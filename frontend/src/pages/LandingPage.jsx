import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit, ShieldCheck, Zap, Droplets, Wind, Wrench, Paintbrush, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const services = [
    { icon: Zap, name: 'Electrician', desc: 'Wiring, fixtures & repairs' },
    { icon: Droplets, name: 'Plumber', desc: 'Pipes, leaks & installations' },
    { icon: Sparkles, name: 'Cleaner', desc: 'Deep cleaning & sanitization' },
    { icon: Wind, name: 'AC Repair', desc: 'Cooling & maintenance' },
    { icon: Wrench, name: 'Carpenter', desc: 'Furniture & woodworks' },
    { icon: Paintbrush, name: 'Painter', desc: 'Interior & exterior' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-[#0f172a] text-slate-200 selection:bg-primary/30">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pt-20 pb-20">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center space-y-8 mb-32 pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-bold text-slate-300 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Online & Ready</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter max-w-4xl"
          >
            AI-Powered Smart <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
              Service Management
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            ServiceIQ connects you with elite, vetted professionals instantly using advanced neural routing. Experience the fastest service delivery on the planet.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-6"
          >
            <button 
              onClick={() => navigate('/customer')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <BrainCircuit className="w-6 h-6" />
              <span className="text-lg">Book a Service</span>
            </button>
            <button 
              onClick={() => navigate('/worker')}
              className="px-8 py-4 rounded-2xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center space-x-2"
            >
              <span>Join as Worker</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>

        {/* SERVICES SECTION */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">Our Services</h2>
            <p className="text-slate-400">Professional services at your doorstep.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-colors group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-slate-400">{service.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-32 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-4">How AI Routing Works</h2>
            <p className="text-slate-400">Our neural engine finds the perfect match in seconds.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Request Service', desc: 'Tell us what you need and where you are. Pay a flat Rs. 300 upfront visiting fee via JazzCash.' },
              { step: '2', title: 'AI Matching', desc: 'Our AI calculates the best worker based on distance, rating, skills, and availability in real-time.' },
              { step: '3', title: 'Job Done', desc: 'Your expert arrives, completes the job, and you pay the remaining balance.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative p-8 rounded-3xl bg-gradient-to-b from-slate-800/50 to-transparent border border-slate-700/50 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-black text-white mx-auto mb-6 shadow-lg shadow-blue-600/30">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-4">Transparent Pricing</h2>
            <p className="text-slate-400">No hidden fees. Pay securely with JazzCash.</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex flex-col"
            >
              <h3 className="text-2xl font-black text-white mb-2">Customers</h3>
              <div className="text-4xl font-black text-blue-400 mb-6">Rs. 300 <span className="text-lg text-slate-500 font-medium">/ visit</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Flat visiting fee</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Instant AI assignment</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Pay remaining after job</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
              <h3 className="text-2xl font-black text-white mb-2">Workers</h3>
              <div className="text-4xl font-black text-purple-400 mb-6">Rs. 150 <span className="text-lg text-slate-500 font-medium">/ register</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <span>One-time registration fee</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <span>Get matched to local jobs</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  <span>Keep 80% of earnings</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
}
