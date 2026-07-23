import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Briefcase, MapPin, User, Hash, Phone, Clock, Star, CheckCircle2, AlertCircle, PlusCircle, X, Navigation, XCircle, ShieldAlert, TrendingDown } from 'lucide-react';
import { api, supabase } from '../api';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [step, setStep] = useState('register'); // register | dashboard
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);

  const [formData, setFormData] = useState({
    name: '', cnic: '', phone: '',
    skill: 'electrician',
    distance: '',
    experience: ''
  });

  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [cancelledJobs, setCancelledJobs] = useState([]);

  const loadJobs = async () => {
    if (!worker) return;
    try {
      const { data: jobs } = await api.get('/api/jobs');
      setActiveJobs(jobs.filter(j => j.worker_id === worker.id && ['assigned', 'arrived'].includes(j.status)));
      setCompletedJobs(jobs.filter(j => j.worker_id === worker.id && j.status === 'completed'));
      setCancelledJobs(jobs.filter(j => j.worker_id === worker.id && j.status === 'cancelled'));
    } catch (err) {
      console.error(err);
    }
  };

  const loadWorker = async () => {
    if (!worker) return;
    try {
      const { data } = await supabase.from('workers').select('*').eq('id', worker.id).single();
      if (data) setWorker(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (step === 'dashboard' && worker) {
      loadJobs();
      loadWorker();

      const jobChannel = supabase.channel('worker_jobs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
          loadJobs();
          loadWorker(); // Status might change based on jobs
        })
        .subscribe();

      const workerChannel = supabase.channel('worker_status')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workers', filter: `id=eq.${worker.id}` }, (payload) => {
          setWorker(payload.new);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(jobChannel);
        supabase.removeChannel(workerChannel);
      };
    }
  }, [step, worker?.id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cnic || !formData.distance) return;
    setIsProcessing(true);
    try {
      const { data } = await api.post('/api/workers', formData);
      setWorker(data);
      setStep('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAvailability = async () => {
    if (!worker.is_available && worker.wallet_balance < 100) {
      alert('Minimum Rs. 100 required in your Prepaid Wallet to go Online. Please top up.');
      return;
    }
    const newStatus = !worker.is_available;
    try {
      const { data } = await api.put(`/api/workers/${worker.id}/status`, { isAvailable: newStatus });
      setWorker(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markArrived = async (jobId) => {
    try {
      await api.put(`/api/jobs/${jobId}/status`, { status: 'arrived', workerArrived: true });
    } catch (err) {
      console.error(err);
    }
  };

  const completeJob = async (jobId) => {
    try {
      await api.put(`/api/jobs/${jobId}/status`, { status: 'completed' });
      alert('✅ Job completed! Commission has been automatically deducted from your wallet.');
    } catch (err) {
      console.error(err);
    }
  };

  const cancelJob = async (jobId) => {
    if (!confirm('Are you sure you want to cancel this job? No commission will be deducted.')) return;
    try {
      await api.put(`/api/jobs/${jobId}/status`, { status: 'cancelled', cancelledBy: 'worker' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopUp = async () => {
    setIsProcessing(true);
    try {
      const { data } = await api.post(`/api/workers/${worker.id}/topup`, { amount: topUpAmount });
      setWorker(data);
      setShowTopUp(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalEarnings = completedJobs.length * 500;
  const totalCommission = completedJobs.reduce((sum, j) => sum + Number(j.commission_deducted || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Worker Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your profile, jobs, and commissions.</p>
        </div>
        {step === 'dashboard' && worker && (
          <div className="flex items-center space-x-3 bg-slate-900/60 p-2 pl-4 rounded-full border border-slate-800">
            <span className="text-sm font-bold text-slate-300">Status</span>
            <button
              onClick={toggleAvailability}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${worker.is_available ? 'bg-green-500' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${worker.is_available ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-2xl mx-auto glass-card"
          >
            <h2 className="text-xl font-bold text-white mb-2">Expert Registration</h2>
            <p className="text-xs text-slate-400 mb-6">Rs. 150 one-time registration fee + Rs. 500 starter wallet included.</p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="text" placeholder="John Doe"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CNIC Number</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="text" placeholder="XXXXX-XXXXXXX-X"
                      value={formData.cnic} onChange={e => setFormData({ ...formData, cnic: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="tel" placeholder="03XX-XXXXXXX"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Skill Specialization</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select value={formData.skill} onChange={e => setFormData({ ...formData, skill: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50 appearance-none">
                      <option value="electrician">Electrician</option>
                      <option value="plumber">Plumber</option>
                      <option value="house_cleaning">House Cleaning</option>
                      <option value="sofa_cleaning">Sofa Deep Clean</option>
                      <option value="curtain_cleaning">Curtain Cleaning</option>
                      <option value="ac_repair">AC Repair & Gas</option>
                      <option value="fridge_repair">Fridge Repair</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Area Coverage (km radius)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="number" step="0.1" placeholder="e.g. 10"
                      value={formData.distance} onChange={e => setFormData({ ...formData, distance: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Years of Experience</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input required type="number" placeholder="e.g. 5"
                      value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-blue-100 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-blue-400" /> Commission Model (InDrive Style)
                </p>
                <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside">
                  <li>One-time registration: <b>Rs. 150</b> (starter wallet: Rs. 500 included)</li>
                  <li>Platform commission: <b>20% per completed job</b> — deducted from your wallet</li>
                  <li>You receive full job payment <b>directly in cash</b> from customer</li>
                  <li>Minimum wallet balance to stay Online: <b>Rs. 100</b></li>
                  <li>Customer cancels after you arrive → <b>customer gets a warning</b>, no penalty for you</li>
                </ul>
              </div>

              <button type="submit" disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center ${
                  isProcessing ? 'bg-slate-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                {isProcessing
                  ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Register & Activate Account'}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'dashboard' && worker && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-black text-white mb-4">
                  {worker.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold text-white">{worker.name}</h3>
                <p className="text-purple-400 capitalize font-medium">{worker.skill} Expert</p>
                <div className="flex items-center mt-3 text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {Number(worker.rating).toFixed(1)} Rating
                </div>
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${worker.is_available ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                  {worker.is_available ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>

              <div className="glass-card flex flex-col justify-center border-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-medium">Prepaid Wallet</h3>
                    <p className={`text-3xl font-black ${Number(worker.wallet_balance) < 100 ? 'text-red-400' : 'text-white'}`}>
                      Rs. {Number(worker.wallet_balance).toFixed(0)}
                    </p>
                  </div>
                </div>
                {Number(worker.wallet_balance) < 100 && (
                  <p className="text-xs text-red-400 mb-2">⚠️ Low balance! Top up to go Online.</p>
                )}
                <p className="text-xs text-slate-500 mb-3">Commission (20%) deducted per completed job.</p>
                <button
                  onClick={() => setShowTopUp(true)}
                  className="mt-1 w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold py-2 rounded-lg transition-colors border border-orange-500/30 flex justify-center items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Top Up Wallet
                </button>
              </div>

              <div className="glass-card flex flex-col justify-center border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-medium">Cash Earnings</h3>
                    <p className="text-3xl font-black text-white">Rs. {totalEarnings}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                  <p>✅ Completed: <span className="text-white font-bold">{completedJobs.length} jobs</span></p>
                  <p>💸 Platform paid: <span className="text-orange-400 font-bold">Rs. {totalCommission}</span></p>
                  <p>❌ Cancelled: <span className="text-slate-400">{cancelledJobs.length} jobs</span></p>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-xl font-bold text-white mb-6">Active Jobs</h3>

              {activeJobs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-300">No active jobs</h4>
                  <p className="text-slate-500 mt-1">Make sure you are marked as Online to receive AI dispatches.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map(job => (
                    <div key={job.id} className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                              job.status === 'arrived' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {job.status === 'arrived' ? '📍 You Arrived' : '🚗 En Route'}
                            </span>
                            <span className="text-slate-500 text-xs">{job.id.substring(0,8)}</span>
                          </div>
                          <h4 className="text-xl font-bold text-white">{job.customer_name}</h4>
                          <p className="text-slate-400 text-sm mt-1 capitalize">{job.service_type}</p>
                          <p className="text-slate-500 text-sm mt-1 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-slate-500">You'll earn</p>
                          <p className="text-xl font-black text-emerald-400">Rs. {job.price}</p>
                          <p className="text-xs text-orange-400">-Rs. {job.price * 0.20} commission</p>
                        </div>
                      </div>

                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-300">
                          <b>Rs. {job.price * 0.20} commission</b> will be deducted from your wallet when you mark this job complete.
                          Collect <b>Rs. {job.price} in cash</b> from the customer directly. Platform takes nothing from the customer.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        {job.status === 'assigned' && (
                          <button
                            onClick={() => markArrived(job.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <Navigation className="w-4 h-4" /> Mark as Arrived
                          </button>
                        )}
                        {job.status === 'arrived' && (
                          <button
                            onClick={() => completeJob(job.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" /> Complete Job
                          </button>
                        )}
                        <button
                          onClick={() => cancelJob(job.id)}
                          className="sm:w-auto px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      </div>

                      {job.status === 'arrived' && (
                        <div className="mt-3 bg-green-900/20 border border-green-500/20 rounded-xl p-3 flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-green-300">
                            <b>You're protected:</b> If the customer cancels now (after your arrival), they will receive a warning strike. Your wallet will NOT be charged.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showTopUp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center">
                      <Wallet className="w-5 h-5 mr-2" /> JazzCash Wallet Top-up
                    </h3>
                    <button onClick={() => setShowTopUp(false)} className="text-white/70 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Select Amount</label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[500, 1000, 2000].map(amt => (
                          <button key={amt} onClick={() => setTopUpAmount(amt)}
                            className={`py-2 rounded-lg font-bold border transition-colors ${
                              topUpAmount === amt
                                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            Rs. {amt}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rs.</span>
                        <input type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <button onClick={handleTopUp} disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center"
                    >
                      {isProcessing
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : `Pay Rs. ${topUpAmount}`}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
