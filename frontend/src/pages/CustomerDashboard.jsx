import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2, Star, AlertCircle, XCircle, ShieldAlert, ArrowRight, PhoneCall, Sparkles, Wind, Zap, Droplets, Thermometer, Home } from 'lucide-react';
import { api, supabase } from '../api';

export default function CustomerDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'electrician',
    description: '',
    location: '',
  });
  const [step, setStep] = useState('form'); // form | processing | tracking
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelWarning, setCancelWarning] = useState(null);

  const serviceCategories = [
    {
      category: 'Cleaning',
      items: [
        { id: 'curtain_cleaning', name: 'Curtains', icon: <Sparkles className="w-5 h-5 mb-1" /> },
        { id: 'sofa_cleaning', name: 'Sofa Deep Clean', icon: <Droplets className="w-5 h-5 mb-1" /> },
        { id: 'house_cleaning', name: 'House Clean', icon: <Home className="w-5 h-5 mb-1" /> },
      ]
    },
    {
      category: 'Appliances',
      items: [
        { id: 'ac_repair', name: 'AC & Gas', icon: <Wind className="w-5 h-5 mb-1" /> },
        { id: 'fridge_repair', name: 'Fridge Repair', icon: <Thermometer className="w-5 h-5 mb-1" /> },
      ]
    },
    {
      category: 'Maintenance',
      items: [
        { id: 'electrician', name: 'Electrician', icon: <Zap className="w-5 h-5 mb-1" /> },
        { id: 'plumber', name: 'Plumber', icon: <Zap className="w-5 h-5 mb-1" /> },
      ]
    }
  ];

  // Track live job status changes via Supabase
  useEffect(() => {
    if (step === 'tracking' && currentJob?.id) {
      const channel = supabase
        .channel(`job_${currentJob.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${currentJob.id}` },
          async (payload) => {
            setCurrentJob(payload.new);
            
            // If worker changed/assigned, fetch worker
            if (payload.new.worker_id) {
              const { data: worker } = await supabase.from('workers').select('*').eq('id', payload.new.worker_id).single();
              if (worker) setAssignedWorker(worker);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [step, currentJob?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.description) return;
    setIsProcessing(true);
    setStep('processing');

    try {
      const res = await api.post('/api/jobs', formData);
      setCurrentJob(res.data.job);
      if (res.data.job.worker_id) {
        // Fetch the assigned worker manually for the initial state
        const { data: worker } = await supabase.from('workers').select('*').eq('id', res.data.job.worker_id).single();
        if (worker) setAssignedWorker(worker);
      }
    } catch (err) {
      console.error('Error submitting job:', err);
    } finally {
      setIsProcessing(false);
      setStep('tracking');
    }
  };

  const handleCancel = async () => {
    if (!currentJob) return;

    const workerArrived = currentJob?.worker_arrived;

    try {
      if (workerArrived) {
        // Penalty logic
        await api.put(`/api/jobs/${currentJob.id}/status`, { status: 'cancelled', cancelledBy: 'customer' });
        const warnRes = await api.post('/api/customers/warn', { name: formData.name });
        setCancelWarning({ warnings: warnRes.data.warning_strikes });
      } else {
        // No penalty
        await api.put(`/api/jobs/${currentJob.id}/status`, { status: 'cancelled', cancelledBy: 'customer_before_arrival' });
        setCancelWarning(null);
      }

      setCurrentJob(prev => ({ ...prev, status: 'cancelled' }));
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Error cancelling job:', err);
    }
  };

  const resetForm = () => {
    setStep('form');
    setCurrentJob(null);
    setAssignedWorker(null);
    setShowCancelConfirm(false);
    setCancelWarning(null);
    setFormData({ name: '', serviceType: 'electrician', description: '', location: '' });
  };

  const jobStatus = currentJob?.status;
  const workerArrived = currentJob?.worker_arrived;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white">Customer Dashboard</h1>
        <p className="text-slate-400 mt-1">Book a service — completely free. Pay the worker directly in cash.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass-card">
              <h2 className="text-xl font-bold text-white mb-2">Request a Service</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-6">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free for Customers (No Platform Fee)
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    required type="text" placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Type</label>
                  <div className="space-y-4">
                    {serviceCategories.map((cat) => (
                      <div key={cat.category}>
                        <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">{cat.category}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cat.items.map(s => (
                            <button
                              key={s.id} type="button"
                              onClick={() => setFormData({ ...formData, serviceType: s.id })}
                              className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden group ${
                                formData.serviceType === s.id
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                  : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-800/80'
                              }`}
                            >
                              {s.icon}
                              <span className="text-[11px] text-center leading-tight">{s.name}</span>
                              {formData.serviceType === s.id && (
                                <motion.div layoutId="activeServiceGlow" className="absolute inset-0 border border-blue-400 rounded-xl pointer-events-none" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Location (km from center)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      required type="number" step="0.1" placeholder="e.g. 5"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Problem Description</label>
                  <textarea
                    required rows="3" placeholder="Describe the issue..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-100">You pay NOTHING to the platform</p>
                    <p className="text-xs text-emerald-300 mt-1">Pay the worker directly in cash after job is done. Platform commission is paid by the worker.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  Find Expert Now — Free <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              <div className="glass-card border-emerald-500/20">
                <h3 className="text-lg font-bold text-white mb-3">🆓 How it works</h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Submit your request — completely free' },
                    { step: '2', text: 'AI matches the best worker nearby in seconds' },
                    { step: '3', text: 'Worker arrives at your location' },
                    { step: '4', text: 'Pay the worker directly in cash after job is done' },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center shrink-0">{item.step}</span>
                      <p className="text-slate-300 text-sm mt-0.5">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-100">Cancellation Policy</p>
                    <p className="text-xs text-yellow-300 mt-1">If you cancel after the worker has arrived, you will receive a <b>warning strike</b>. 3 strikes may result in a temporary ban.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto glass-card text-center py-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <motion.div animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute w-32 h-32 rounded-full border border-blue-500" />
              <motion.div animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.4, 0] }} transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }} className="absolute w-32 h-32 rounded-full border border-blue-500" />
              <motion.div animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.4, 0] }} transition={{ duration: 2, delay: 1.2, repeat: Infinity, ease: "easeOut" }} className="absolute w-32 h-32 rounded-full border border-blue-500" />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Finding Your Expert</h2>
              <p className="text-slate-400">AI is analyzing workers by distance, skill & rating…</p>
            </div>
          </motion.div>
        )}

        {step === 'tracking' && currentJob && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-5"
          >
            {(jobStatus === 'cancelled') && (
              <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-8 h-8 text-red-400" />
                  <h3 className="text-xl font-bold text-white">Order Cancelled</h3>
                </div>

                {cancelWarning ? (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-200">⚠️ Warning Issued to You</p>
                        <p className="text-xs text-red-300 mt-1">
                          You cancelled after the worker had already arrived. This counts as a strike.
                          <b> Warning #{cancelWarning.warnings}</b> recorded on your account.
                          {cancelWarning.warnings >= 3 && ' Your account has been temporarily suspended.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/60 rounded-xl p-4 mb-4">
                    <p className="text-slate-300 text-sm">Cancelled before worker arrived — no penalty applied. ✓</p>
                  </div>
                )}

                <p className="text-slate-400 text-sm mb-4">Worker has been released and is now available for other jobs.</p>
                <button onClick={resetForm} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                  Book Another Service
                </button>
              </div>
            )}

            {jobStatus !== 'cancelled' && (
              <>
                <div className="glass-card border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">🤖</span>
                      AI Match Complete
                    </h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full uppercase">
                      {assignedWorker ? 'Matched' : 'Queued'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    "{currentJob.ai_reasoning}"
                  </p>
                </div>

                {assignedWorker ? (
                  <>
                    <div className="glass-card">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Assigned Expert</h3>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-black text-white">
                          {assignedWorker.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white">{assignedWorker.name}</h4>
                          <p className="text-slate-400 capitalize">{assignedWorker.skill}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm font-medium">
                            <span className="flex items-center text-yellow-500">
                              <Star className="w-4 h-4 mr-1 fill-current" /> {assignedWorker.rating}
                            </span>
                            <span className="flex items-center text-slate-300">
                              <PhoneCall className="w-4 h-4 mr-1 text-slate-500" /> 03XX-XXXXXXX
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative pl-6 border-l-2 border-slate-800 space-y-5">
                        <div className="relative">
                          <div className={`absolute w-3 h-3 rounded-full -left-[31px] top-1 ${
                            ['assigned','arrived','completed'].includes(jobStatus) ? 'bg-blue-500' : 'bg-slate-700'
                          }`} />
                          <h5 className="font-bold text-white text-sm">Worker Dispatched</h5>
                          <p className="text-xs text-slate-500 mt-0.5">{assignedWorker.name} is heading to your location.</p>
                        </div>
                        <div className={`relative ${!workerArrived ? 'opacity-40' : ''}`}>
                          <div className={`absolute w-3 h-3 rounded-full -left-[31px] top-1 ${workerArrived ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                          <h5 className="font-bold text-white text-sm">Worker Arrived</h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {workerArrived ? '✓ Worker has arrived at your location.' : 'Pending arrival…'}
                          </p>
                        </div>
                        <div className={`relative ${jobStatus !== 'completed' ? 'opacity-40' : ''}`}>
                          <div className={`absolute w-3 h-3 rounded-full -left-[31px] top-1 ${jobStatus === 'completed' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                          <h5 className="font-bold text-white text-sm">Job Completed</h5>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {jobStatus === 'completed' ? '✓ Done! Pay worker in cash.' : 'Pending completion.'}
                          </p>
                        </div>
                      </div>

                      {jobStatus === 'completed' && (
                        <div className="mt-5 bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-emerald-200">Job Completed! 🎉</p>
                            <p className="text-xs text-emerald-300 mt-1">Please pay <b>{assignedWorker.name}</b> directly in cash for the service. You owe nothing to the platform.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {(jobStatus === 'assigned' || jobStatus === 'arrived') && (
                      <div>
                        {!showCancelConfirm ? (
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="w-full py-3 rounded-xl font-medium text-slate-500 hover:text-red-400 transition-colors text-sm border border-slate-800 hover:border-red-500/30"
                          >
                            Cancel Request
                          </button>
                        ) : (
                          <div className={`rounded-2xl p-5 border space-y-4 ${
                            currentJob.worker_arrived
                              ? 'bg-red-900/20 border-red-500/30'
                              : 'bg-slate-900/80 border-slate-700'
                          }`}>
                            {currentJob.worker_arrived ? (
                              <div className="flex items-start gap-3">
                                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-bold text-red-200">⚠️ Warning: Worker Has Arrived</p>
                                  <p className="text-xs text-red-300 mt-1">
                                    The worker is already at your location. Cancelling now will result in a <b>warning strike</b> on your account.
                                    Repeated cancellations after arrival may lead to a temporary ban.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-300">Are you sure you want to cancel? The worker hasn't arrived yet, so no penalty will apply.</p>
                            )}
                            <div className="flex gap-3">
                              <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-colors"
                              >
                                Keep Request
                              </button>
                              <button
                                onClick={handleCancel}
                                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
                              >
                                Confirm Cancel {currentJob.worker_arrived ? '(Get Warning)' : ''}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {jobStatus === 'completed' && (
                      <button onClick={resetForm} className="w-full py-3 rounded-xl font-medium text-slate-400 hover:text-white transition-colors">
                        Book Another Service
                      </button>
                    )}
                  </>
                ) : (
                  <div className="glass-card text-center py-10">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Workers Available</h3>
                    <p className="text-slate-400 text-sm mb-6">Your request is queued. An expert will be assigned as soon as one becomes available.</p>
                    <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors text-sm">Cancel & Go Back</button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
