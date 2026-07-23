import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, CheckCircle2, DollarSign, AlertOctagon, BrainCircuit, Activity, BarChart2 } from 'lucide-react';
import { api, supabase } from '../api';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeWorkers: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    revenue: 0,
    demands: []
  });
  const [jobs, setJobs] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);

  const loadData = async () => {
    try {
      const [metricsRes, jobsRes, logsRes] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get('/api/jobs'),
        api.get('/api/admin/logs')
      ]);
      setStats(metricsRes.data);
      setJobs(jobsRes.data);
      setAiLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase.channel('admin_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => loadData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_decision_logs' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const simulateIncident = async () => {
    try {
      await api.post('/api/admin/simulate');
    } catch (err) {
      console.error(err);
    }
  };

  const cards = [
    { title: 'Total Jobs', value: stats.totalJobs, icon: LayoutDashboard, color: 'blue' },
    { title: 'Active Workers', value: stats.activeWorkers, icon: Users, color: 'emerald' },
    { title: 'Completed', value: stats.completedJobs, icon: CheckCircle2, color: 'purple' },
    { title: 'Worker Revenue', value: `Rs. ${(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'orange', sub: 'Commissions only' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Hub</h1>
          <p className="text-slate-400 mt-1">Real-time platform metrics and AI monitoring.</p>
        </div>
        <button
          onClick={simulateIncident}
          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <AlertOctagon className="w-5 h-5" />
          <span>Simulate Incident</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const colorStyles = {
            blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
          }[card.color];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorStyles}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-slate-400 font-medium">{card.title}</h3>
                  <p className="text-3xl font-black text-white">{card.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-primary" />
                Service Demand
              </h2>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.demands}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Live Jobs
              </h2>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 font-bold">ID</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">Service</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {jobs.slice(0, 10).map(job => (
                    <tr key={job.id} className="text-sm">
                      <td className="py-4 text-slate-400">{job.id.substring(0,8)}</td>
                      <td className="py-4 text-white font-medium">{job.customer_name}</td>
                      <td className="py-4 text-slate-300 capitalize">{job.service_type}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          job.status === 'arrived'   ? 'bg-green-500/10  text-green-400  border border-green-500/20'   :
                          job.status === 'assigned'  ? 'bg-blue-500/10   text-blue-400   border border-blue-500/20'    :
                          job.status === 'cancelled' ? 'bg-red-500/10    text-red-400    border border-red-500/20'     :
                                                       'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {jobs.length === 0 && (
                <div className="text-center py-8 text-slate-500">No jobs yet</div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card flex flex-col h-[500px]"
        >
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BrainCircuit className="w-5 h-5 mr-2 text-purple-400" />
              AI Decision Log
            </h2>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {aiLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No decisions recorded</div>
            ) : (
              aiLogs.map((log, i) => (
                <div key={log.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
                  <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
                    <span>Job: {log.jobId.substring(0,8)}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    "{log.reasoning}"
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
