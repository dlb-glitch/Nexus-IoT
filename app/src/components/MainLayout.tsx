import React, { useState, useEffect } from 'react';
import { ActivityIcon, CpuIcon, SettingsIcon, BotIcon, MenuIcon, LogOutIcon, HelpCircleIcon } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { SerialMonitor } from './SerialMonitor';
import { Settings } from './Settings';
import { AIAdvisor } from './AIAdvisor';
import { GuideModal } from './GuideModal';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useIoTContext } from './IoTProvider';

type View = 'dashboard' | 'serial' | 'advisor' | 'settings';

export function MainLayout() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const { toggleLight, setFanMode, state } = useIoTContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle light: Ctrl+L
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLight();
      }
      
      // Toggle Fan: Ctrl+F
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const nextMode = state.devices.fanMode === 'off' ? 'auto' : (state.devices.fanMode === 'auto' ? 'manual' : 'off');
        setFanMode(nextMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLight, setFanMode, state.devices.fanMode]);

  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: ActivityIcon },
    { id: 'serial', label: 'Serial Monitor', icon: CpuIcon },
    { id: 'advisor', label: 'AI Advisor', icon: BotIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
         <div className="flex flex-col h-full">
            <div className="p-6">
               <div className="flex items-center gap-3 text-sky-400 font-bold text-xl tracking-tight">
                 <ActivityIcon className="w-8 h-8" />
                 <span>Nexus IoT</span>
               </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              {navItems.map(item => {
                const active = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 mt-auto">
               <button
                  onClick={() => setGuideOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-sm font-medium text-emerald-400 focus:bg-emerald-500/10 hover:bg-emerald-500/10 transition-colors shadow-sm"
                >
                  <HelpCircleIcon className="w-5 h-5" />
                  System Guide
               </button>

               <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <p className="font-medium text-slate-400">System Status</p>
                  </div>
                  <p>All core services online.</p>
                  <p className="mt-2 text-sky-400">Gemini AI: Insight Ready</p>
               </div>
               <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOutIcon className="w-5 h-5" />
                  Sign Out
               </button>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0">
         {/* Mobile Header */}
         <header className="lg:hidden flex items-center p-4 border-b border-slate-800 bg-slate-950">
           <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white">
             <MenuIcon className="w-6 h-6" />
           </button>
           <span className="ml-2 font-bold tracking-tight text-white">Nexus IoT</span>
         </header>

         {/* Content Scroll Area */}
         <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentView}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.02 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'serial' && <SerialMonitor />}
                {currentView === 'advisor' && <AIAdvisor />}
                {currentView === 'settings' && <Settings />}
             </motion.div>
           </AnimatePresence>
         </main>
      </div>

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
