import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATA ---
let workers = [
  { id: 'w1', name: 'Ali Hassan', skill: 'electrician', distance: 1.2, rating: 4.9, isAvailable: true },
  { id: 'w2', name: 'Ahmed Khan', skill: 'plumber', distance: 2.1, rating: 4.7, isAvailable: true },
  { id: 'w3', name: 'Sara Malik', skill: 'cleaner', distance: 0.8, rating: 4.8, isAvailable: true },
  { id: 'w4', name: 'Usman Ali', skill: 'AC repair', distance: 3.2, rating: 4.6, isAvailable: true },
  { id: 'w5', name: 'Fatima Sheikh', skill: 'electrician', distance: 1.8, rating: 4.5, isAvailable: true },
  { id: 'w6', name: 'Bilal Ahmed', skill: 'plumber', distance: 1.5, rating: 4.9, isAvailable: true },
  { id: 'w7', name: 'Zara Khan', skill: 'cleaner', distance: 2.4, rating: 4.7, isAvailable: false },
  { id: 'w8', name: 'Tariq Mahmood', skill: 'AC repair', distance: 0.9, rating: 4.8, isAvailable: true }
];

let jobs = [
  // 5 completed
  { id: 'j1', type: 'plumber', description: 'Leaking pipe', location: 'Block A', status: 'Completed', assignedWorkerId: 'w2', createdAt: new Date(Date.now() - 100000000).toISOString() },
  { id: 'j2', type: 'electrician', description: 'No power', location: 'Main St', status: 'Completed', assignedWorkerId: 'w1', createdAt: new Date(Date.now() - 90000000).toISOString() },
  { id: 'j3', type: 'cleaner', description: 'Deep cleaning', location: 'Office 5', status: 'Completed', assignedWorkerId: 'w3', createdAt: new Date(Date.now() - 80000000).toISOString() },
  { id: 'j4', type: 'AC repair', description: 'Not cooling', location: 'Tower B', status: 'Completed', assignedWorkerId: 'w8', createdAt: new Date(Date.now() - 70000000).toISOString() },
  { id: 'j5', type: 'plumber', description: 'Blocked drain', location: 'Block C', status: 'Completed', assignedWorkerId: 'w6', createdAt: new Date(Date.now() - 60000000).toISOString() },
  // 3 assigned
  { id: 'j6', type: 'electrician', description: 'Sparking wire', location: 'Downtown', status: 'Assigned', assignedWorkerId: 'w5', createdAt: new Date(Date.now() - 5000000).toISOString() },
  { id: 'j7', type: 'cleaner', description: 'Regular cleaning', location: 'Building 1', status: 'Assigned', assignedWorkerId: 'w3', createdAt: new Date(Date.now() - 4000000).toISOString() },
  { id: 'j8', type: 'AC repair', description: 'Weird noise', location: 'Sector 4', status: 'Assigned', assignedWorkerId: 'w4', createdAt: new Date(Date.now() - 3000000).toISOString() },
  // 2 pending
  { id: 'j9', type: 'plumber', description: 'Broken tap', location: 'Avenue 2', status: 'Pending', assignedWorkerId: null, createdAt: new Date().toISOString() },
  { id: 'j10', type: 'electrician', description: 'Lighting installation', location: 'Mall', status: 'Pending', assignedWorkerId: null, createdAt: new Date().toISOString() }
];

let decisionLogs = [];

// --- AI AUTO-ASSIGNMENT LOGIC ---
const assignJob = (job) => {
  const startTime = performance.now();
  
  let bestWorker = null;
  let maxScore = -1;
  let candidateScores = [];

  workers.forEach(w => {
    // strict skill match or we can assign anyway with 0 points? Usually skill match is required.
    // Let's assume skillMatch gives 30, if not match we skip them or give 0? Realistically we skip them for wrong skill.
    if (w.skill !== job.type) return;

    const skillMatch = 1; // Since we filtered, it's 1
    const isAvailable = w.isAvailable ? 1 : 0;
    
    // Formula: score = (1/distance * 40) + (skillMatch * 30) + (rating * 20) + (isAvailable * 10)
    const distanceScore = (1 / w.distance) * 40;
    const score = distanceScore + (skillMatch * 30) + (w.rating * 20) + (isAvailable * 10);
    
    candidateScores.push({ worker: w, score });

    if (score > maxScore && w.isAvailable) { // only assign if available
      maxScore = score;
      bestWorker = w;
    }
  });

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(3); // in seconds

  if (bestWorker) {
    job.status = 'Assigned';
    job.assignedWorkerId = bestWorker.id;
    bestWorker.isAvailable = false; // Mark as busy now

    const logEntry = {
      id: `log_${Date.now()}`,
      jobId: job.id,
      workerName: bestWorker.name,
      skill: bestWorker.skill,
      distance: bestWorker.distance,
      rating: bestWorker.rating,
      score: maxScore.toFixed(2),
      duration: duration, // Simulated fake time or real execution time. Usually AI is fast but for demo we can add a small padding or just use real.
      timestamp: new Date().toISOString(),
      reasoning: `${bestWorker.name} selected \u2014 ${bestWorker.distance}km away, ${bestWorker.skill}, rating ${bestWorker.rating}, available. Assigned in ${duration} seconds.`
    };
    decisionLogs.unshift(logEntry); // Add to top
    return logEntry;
  }
  return null;
};

// --- ENDPOINTS ---

// GET /api/workers
app.get('/api/workers', (req, res) => {
  res.json(workers);
});

// GET /api/jobs
app.get('/api/jobs', (req, res) => {
  // Join worker info
  const jobsWithWorkers = jobs.map(j => {
    const worker = workers.find(w => w.id === j.assignedWorkerId);
    return { ...j, worker };
  });
  res.json(jobsWithWorkers);
});

// GET /api/admin/metrics
app.get('/api/admin/metrics', (req, res) => {
  const totalJobsToday = jobs.filter(j => new Date(j.createdAt).toDateString() === new Date().toDateString()).length;
  // Let's just use all jobs for demo if totalJobsToday is low
  const totalJobs = jobs.length;
  const activeWorkers = workers.filter(w => w.isAvailable).length;
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  
  // Demand by category
  const demand = {};
  jobs.forEach(j => {
    demand[j.type] = (demand[j.type] || 0) + 1;
  });
  
  const demandsArray = Object.keys(demand).map(key => ({ name: key, value: demand[key] }));

  res.json({
    totalJobs: totalJobs, // Using total instead of today for better UI look
    activeWorkers,
    completedJobs,
    avgResponseTime: "1.4s", // Mocked or calculated from logs
    demands: demandsArray
  });
});

// GET /api/admin/logs
app.get('/api/admin/logs', (req, res) => {
  res.json(decisionLogs);
});

// POST /api/jobs (Submit job)
app.post('/api/jobs', (req, res) => {
  const { type, description, location } = req.body;
  const newJob = {
    id: `j${Date.now()}`,
    type,
    description,
    location,
    status: 'Pending',
    assignedWorkerId: null,
    createdAt: new Date().toISOString()
  };
  jobs.push(newJob);
  
  // Auto assign
  const log = assignJob(newJob);

  res.status(201).json({ job: newJob, log });
});

// PUT /api/jobs/:id/status
app.put('/api/jobs/:id/status', (req, res) => {
  const { status } = req.body;
  const job = jobs.find(j => j.id === req.params.id);
  if (job) {
    job.status = status;
    if (status === 'Completed' && job.assignedWorkerId) {
      const worker = workers.find(w => w.id === job.assignedWorkerId);
      if (worker) worker.isAvailable = true; // free the worker
    }
    res.json(job);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

// PUT /api/workers/:id/status
app.put('/api/workers/:id/status', (req, res) => {
  const { isAvailable } = req.body;
  const worker = workers.find(w => w.id === req.params.id);
  if (worker) {
    worker.isAvailable = isAvailable;
    res.json(worker);
  } else {
    res.status(404).json({ message: 'Worker not found' });
  }
});

// POST /api/workers (Register new worker)
app.post('/api/workers', (req, res) => {
  const { name, skill, distance } = req.body;
  const newWorker = {
    id: `w${Date.now()}`,
    name,
    skill,
    distance: parseFloat(distance) || 2.5, // Default distance if not provided
    rating: 5.0, // New workers start with 5.0
    isAvailable: true
  };
  workers.push(newWorker);
  res.status(201).json(newWorker);
});

// POST /api/admin/simulate
app.post('/api/admin/simulate', (req, res) => {
  // Simulate emergency job
  const types = ['electrician', 'plumber', 'cleaner', 'AC repair'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const emergencyJob = {
    id: `j${Date.now()}`,
    type,
    description: `EMERGENCY: ${type} needed immediately!`,
    location: 'Central Plaza',
    status: 'Pending',
    assignedWorkerId: null,
    createdAt: new Date().toISOString()
  };
  
  jobs.push(emergencyJob);

  // We add an artificial delay to make it seem like AI is "scanning" (e.g. 1.8s)
  setTimeout(() => {
    const log = assignJob(emergencyJob);
    // Override log duration for demo effect
    if(log) {
       log.duration = (Math.random() * (2.0 - 1.2) + 1.2).toFixed(2); // Random between 1.2s and 2.0s
       log.reasoning = `${log.workerName} selected \u2014 ${log.distance}km away, ${log.skill}, rating ${log.rating}, available. Assigned in ${log.duration} seconds.`;
    }
    res.json({ job: emergencyJob, log });
  }, 1000); // Wait 1 sec before returning so UI can show loading
});

const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
});

