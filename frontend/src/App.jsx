import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Wrench, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  // Hide sidebar completely on Landing Page
  if (location.pathname === '/') return null;

  const links = [
    { name: 'Admin Hub', path: '/admin', icon: LayoutDashboard },
    { name: 'Customer App', path: '/customer', icon: BrainCircuit },
    { name: 'Worker App', path: '/worker', icon: Wrench },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`fixed left-0 top-0 h-screen w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        <div className="p-8">
          <Link to="/" className="flex items-center space-x-3 mb-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ServiceIQ<span className="text-primary text-3xl leading-none">.</span>
            </h1>
          </Link>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">AI Management Platform</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                <span className="font-semibold">{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Status</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI Engine is currently processing 24 active service requests.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#050B14] text-slate-200 font-sans selection:bg-primary/30 relative overflow-hidden">
        {/* Global Premium Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="orb w-[500px] h-[500px] bg-primary/30 top-[-100px] left-[-100px]" />
          <div className="orb w-[400px] h-[400px] bg-purple-600/20 bottom-[10%] right-[-50px] [animation-delay:2s]" />
          <div className="orb w-[300px] h-[300px] bg-emerald-500/10 top-[20%] right-[20%] [animation-delay:5s]" />
        </div>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={
            <div className="relative z-10 flex flex-1 w-full">
              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
              
              <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="text-primary" size={24} />
                    <span className="font-bold text-xl">ServiceIQ</span>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Menu size={24} />
                  </button>
                </header>

                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                  <div className="max-w-6xl mx-auto">
                    <Routes>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/customer" element={<CustomerDashboard />} />
                      <Route path="/worker" element={<WorkerDashboard />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;
