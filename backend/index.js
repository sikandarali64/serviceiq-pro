import express from 'express';
import cors from 'cors';
import { supabase } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const COMMISSION_RATE = 0.20;

// --- AI AUTO-ASSIGNMENT LOGIC ---
const assignJob = async (jobId, serviceType, customerLocation = 0) => {
  const startTime = performance.now();
  
  // Fetch available workers matching skill
  const { data: availableWorkers, error } = await supabase
    .from('workers')
    .select('*')
    .eq('skill', serviceType)
    .eq('is_available', true)
    .gte('wallet_balance', 100);

  if (error || !availableWorkers || availableWorkers.length === 0) {
    return null;
  }

  let bestWorker = null;
  let maxScore = -1;

  availableWorkers.forEach(w => {
    // Formula: score = (1/distance * 40) + (skillMatch * 30) + (rating * 20) + (isAvailable * 10)
    // Distance can be random or based on worker's seeded distance relative to customer.
    const distanceVal = Math.abs(w.distance - customerLocation) || 0.1;
    const distanceScore = (1 / distanceVal) * 40;
    const skillMatch = 1; 
    const isAvailable = 1;
    
    const score = distanceScore + (skillMatch * 30) + (Number(w.rating) * 20) + (isAvailable * 10);
    
    if (score > maxScore) {
      maxScore = score;
      bestWorker = w;
    }
  });

  if (bestWorker) {
    const duration = ((performance.now() - startTime) / 1000).toFixed(3);
    const reasoning = `${bestWorker.name} selected — distance ${bestWorker.distance}km, ${bestWorker.skill}, rating ${bestWorker.rating}, available. Assigned in ${duration}s.`;

    // 1. Update job
    await supabase.from('jobs').update({
      worker_id: bestWorker.id,
      status: 'assigned',
      ai_reasoning: reasoning
    }).eq('id', jobId);

    // 2. Update worker status
    await supabase.from('workers').update({
      is_available: false
    }).eq('id', bestWorker.id);

    // 3. Log decision
    const { data: logEntry } = await supabase.from('ai_decision_logs').insert([{
      job_id: jobId,
      worker_id: bestWorker.id,
      reasoning: reasoning,
      score: maxScore
    }]).select().single();

    return logEntry;
  }
  return null;
};

// --- ENDPOINTS ---

// GET /api/workers
app.get('/api/workers', async (req, res) => {
  const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/jobs
app.get('/api/jobs', async (req, res) => {
  const { data, error } = await supabase.from('jobs').select('*, workers(*)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  
  // Format to match old structure (worker object nested)
  const formatted = data.map(j => ({
    ...j,
    worker: j.workers
  }));
  res.json(formatted);
});

// GET /api/admin/metrics
app.get('/api/admin/metrics', async (req, res) => {
  const { data: jobs } = await supabase.from('jobs').select('*');
  const { data: workers } = await supabase.from('workers').select('*');
  
  const totalJobs = jobs?.length || 0;
  const activeWorkers = workers?.filter(w => w.is_available).length || 0;
  const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0;
  const cancelledJobs = jobs?.filter(j => j.status === 'cancelled').length || 0;
  
  const workerCommissions = jobs?.filter(j => j.status === 'completed').reduce((sum, j) => sum + Number(j.commission_deducted || 100), 0) || 0;
  const registrationFees = (workers?.length || 0) * 150;
  const revenue = workerCommissions + registrationFees;

  const demand = {};
  jobs?.forEach(j => {
    demand[j.service_type] = (demand[j.service_type] || 0) + 1;
  });
  const demandsArray = Object.keys(demand).map(key => ({ name: key, value: demand[key] }));

  res.json({ totalJobs, activeWorkers, completedJobs, cancelledJobs, revenue, demands: demandsArray });
});

// GET /api/admin/logs
app.get('/api/admin/logs', async (req, res) => {
  const { data, error } = await supabase.from('ai_decision_logs').select('*, jobs(id), workers(name, skill, distance, rating)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  
  const formatted = data.map(l => ({
    id: l.id,
    jobId: l.job_id,
    workerName: l.workers?.name,
    skill: l.workers?.skill,
    distance: l.workers?.distance,
    rating: l.workers?.rating,
    score: l.score,
    reasoning: l.reasoning,
    timestamp: l.created_at
  }));
  res.json(formatted);
});

// POST /api/jobs (Submit job)
app.post('/api/jobs', async (req, res) => {
  const { name, serviceType, description, location } = req.body;
  
  const { data: newJob, error } = await supabase.from('jobs').insert([{
    customer_name: name,
    service_type: serviceType,
    description,
    location,
    status: 'pending',
    ai_reasoning: 'Finding expert...'
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  
  // Auto assign async
  const log = await assignJob(newJob.id, serviceType, parseFloat(location) || 0);
  
  res.status(201).json({ job: newJob, log });
});

// PUT /api/jobs/:id/status
app.put('/api/jobs/:id/status', async (req, res) => {
  const { status, cancelledBy, workerArrived } = req.body;
  const jobId = req.params.id;

  const { data: job, error: jobError } = await supabase.from('jobs').select('*').eq('id', jobId).single();
  if (jobError) return res.status(404).json({ message: 'Job not found' });

  const updates = { status };
  if (cancelledBy) updates.cancelled_by = cancelledBy;
  if (workerArrived !== undefined) updates.worker_arrived = workerArrived;

  if (status === 'completed' && job.worker_id) {
    const commission = Math.round(Number(job.price || 500) * COMMISSION_RATE);
    updates.commission_deducted = commission;
    updates.completed_at = new Date().toISOString();

    const { data: worker } = await supabase.from('workers').select('*').eq('id', job.worker_id).single();
    if (worker) {
      const newBalance = Number(worker.wallet_balance) - commission;
      const newStatus = newBalance >= 100;

      await supabase.from('workers').update({
        wallet_balance: newBalance,
        is_available: newStatus
      }).eq('id', worker.id);

      await supabase.from('wallet_transactions').insert([{
        worker_id: worker.id,
        amount: -commission,
        type: 'commission'
      }]);
    }
  } else if (status === 'cancelled' && job.worker_id) {
    await supabase.from('workers').update({ is_available: true }).eq('id', job.worker_id);
  }

  const { data: updatedJob, error } = await supabase.from('jobs').update(updates).eq('id', jobId).select().single();
  if (error) return res.status(500).json({ error: error.message });

  res.json(updatedJob);
});

// PUT /api/workers/:id/status
app.put('/api/workers/:id/status', async (req, res) => {
  const { isAvailable } = req.body;
  const { data, error } = await supabase.from('workers').update({ is_available: isAvailable }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/workers/:id/topup
app.post('/api/workers/:id/topup', async (req, res) => {
  const { amount } = req.body;
  const workerId = req.params.id;

  const { data: worker } = await supabase.from('workers').select('wallet_balance').eq('id', workerId).single();
  if (!worker) return res.status(404).json({ message: 'Worker not found' });

  const newBalance = Number(worker.wallet_balance) + Number(amount);
  const { data, error } = await supabase.from('workers').update({ wallet_balance: newBalance }).eq('id', workerId).select().single();
  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('wallet_transactions').insert([{ worker_id: workerId, amount: Number(amount), type: 'topup' }]);

  res.json(data);
});

// POST /api/workers (Register new worker)
app.post('/api/workers', async (req, res) => {
  const { name, cnic, phone, skill, distance, experience } = req.body;
  const { data, error } = await supabase.from('workers').insert([{
    name,
    cnic,
    phone,
    skill,
    distance: parseFloat(distance) || 2.5,
    rating: 5.0,
    is_available: true,
    wallet_balance: 500
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/customers/warn
app.post('/api/customers/warn', async (req, res) => {
  const { name } = req.body;
  
  let { data: customer } = await supabase.from('customers').select('*').eq('name', name).single();
  
  if (customer) {
    const warnings = (customer.warning_strikes || 0) + 1;
    const isBanned = warnings >= 3;
    const { data } = await supabase.from('customers').update({ warning_strikes: warnings, is_banned: isBanned }).eq('id', customer.id).select().single();
    return res.json(data);
  } else {
    const { data } = await supabase.from('customers').insert([{ name, warning_strikes: 1 }]).select().single();
    return res.json(data);
  }
});

// POST /api/admin/simulate
app.post('/api/admin/simulate', async (req, res) => {
  const types = ['electrician', 'plumber', 'house_cleaning', 'ac_repair', 'fridge_repair', 'curtain_cleaning'];
  const serviceType = types[Math.floor(Math.random() * types.length)];
  
  const { data: newJob } = await supabase.from('jobs').insert([{
    customer_name: 'Emergency System',
    service_type: serviceType,
    description: `EMERGENCY: ${serviceType} needed immediately!`,
    location: 'Central Plaza',
    status: 'pending',
    ai_reasoning: 'Finding expert...'
  }]).select().single();

  setTimeout(async () => {
    const log = await assignJob(newJob.id, serviceType, 2.5);
    res.json({ job: newJob, log });
  }, 1000);
});

const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
});
