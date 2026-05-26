import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon, BookOpenIcon, InfoIcon, LayoutGridIcon, CpuIcon, CloudIcon, SettingsIcon, CheckIcon } from 'lucide-react';

export function GuideModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpenIcon },
    { id: 'dashboard', label: 'Dashboard & Layout', icon: LayoutGridIcon },
    { id: 'widgets', label: 'Widgets & Controls', icon: CpuIcon },
    { id: 'ai', label: 'AI Advisor', icon: InfoIcon },
    { id: 'cloud', label: 'Cloud Sync', icon: CloudIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
               <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Guide</h2>
              <p className="text-sm text-slate-400">Learn how to use your IoT Dashboard</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
           {/* Sidebar */}
           <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar p-4">
              <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                  {tabs.map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                           activeTab === tab.id 
                           ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                           : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                        }`}
                     >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                     </button>
                  ))}
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <AnimatePresence mode="wait">
                 {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                       <h3 className="text-2xl font-bold text-slate-100">Welcome to Nexus IoT</h3>
                       <p className="text-slate-400 leading-relaxed text-base">
                          Nexus IoT is a modern, real-time Internet of Things dashboard built to help you monitor and control your smart devices.
                          It uses MQTT for ultra-fast, bidirectional communication, allowing values to sync instantly.
                       </p>
                       <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl space-y-3">
                           <h4 className="font-semibold text-slate-200">Key Features:</h4>
                           <ul className="space-y-2 text-slate-400 text-sm">
                              <li className="flex items-start gap-2"><CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5" /> Fully dynamic grid layout (drag, resize, add/remove).</li>
                              <li className="flex items-start gap-2"><CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5" /> Bidirectional hardware controls (Lights, Dimmer, Smart Lock, RGB, Fans).</li>
                              <li className="flex items-start gap-2"><CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5" /> High-frequency polling safety (updates throttled at 5 FPS to keep UI fluid).</li>
                              <li className="flex items-start gap-2"><CheckIcon className="w-4 h-4 text-emerald-400 mt-0.5" /> AI Advisor using Gemini to interpret your specific telemetry contexts.</li>
                           </ul>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'dashboard' && (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                       <h3 className="text-2xl font-bold text-slate-100">Layout Engine</h3>
                       <p className="text-slate-400 leading-relaxed">
                          Your dashboard is highly customizable. Click the <strong className="text-indigo-400">Edit Layout</strong> button on the top right to enter Edit Mode.
                       </p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                              <h4 className="font-semibold text-white mb-2">Dragging</h4>
                              <p className="text-sm text-slate-400">In edit mode, click and hold any widget to move it around the grid. Elements below it will automatically shuffle to make room.</p>
                           </div>
                           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                              <h4 className="font-semibold text-white mb-2">Resizing</h4>
                              <p className="text-sm text-slate-400">Drag the bottom right corner of any widget to resize it. Constraints map gracefully to ensure charts get enough space.</p>
                           </div>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'widgets' && (
                    <motion.div key="widgets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                       <h3 className="text-2xl font-bold text-slate-100">Adding & Removing Widgets</h3>
                       <p className="text-slate-400 leading-relaxed">
                          Enter Edit Mode to add new sensors and controls to your dashboard. 
                          You can mix and match controls depending on your physical loadouts.
                       </p>
                       <ul className="space-y-4 text-sm text-slate-400">
                           <li className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                              <strong className="text-emerald-400 block mb-1">Status & Gauge Cards</strong>
                              Display real-time numerical readings like Temperature, Humidity, and Voltage. They flash if thresholds are breached safely.
                           </li>
                           <li className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                              <strong className="text-amber-400 block mb-1">Control Switches</strong>
                              Directly command external relays, locks, and dimmers. Feedback is purely state-driven from MQTT.
                           </li>
                           <li className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                              <strong className="text-sky-400 block mb-1">Motion & Door Entities</strong>
                              Boolean sensors that indicate perimeter activity or open/close contacts.
                           </li>
                       </ul>
                    </motion.div>
                 )}

                 {activeTab === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                       <h3 className="text-2xl font-bold text-slate-100">AI Advisor</h3>
                       <p className="text-slate-400 leading-relaxed">
                          The AI Advisor translates your raw metrics into actionable insight.
                       </p>
                       <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl space-y-3">
                          <p className="text-sm text-slate-300">
                             Because you can completely customize the dashboard, the AI Advisor dynamically reads <strong className="text-white">only the widgets you've placed</strong>. 
                             If you remove the Gas sensor, the AI won't hallucinate about it. This creates contextually tailored diagnostics directly driven by your layout.
                          </p>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'cloud' && (
                    <motion.div key="cloud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                       <h3 className="text-2xl font-bold text-slate-100">Firestore Cloud Sync</h3>
                       <p className="text-slate-400 leading-relaxed">
                          Your configurations are bound directly to your Google account.
                       </p>
                       <ul className="space-y-3 mt-4">
                           <li className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg text-sm text-slate-300 border border-slate-700/50">
                              <CloudIcon className="w-5 h-5 text-sky-400" /> Auto-Save: Dashboard layouts and widget setups bounce to Firebase automatically as you edit.
                           </li>
                           <li className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg text-sm text-slate-300 border border-slate-700/50">
                              <BookOpenIcon className="w-5 h-5 text-emerald-400" /> Snapshots: Use the "Save Snapshot" icon periodically as a hard manual save state to secure your grid.
                           </li>
                       </ul>
                    </motion.div>
                 )}

                 {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                       <h3 className="text-2xl font-bold text-slate-100">Settings</h3>
                       <p className="text-slate-400 leading-relaxed">
                          Configure your environment setup securely.
                       </p>
                       <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                           <h4 className="font-semibold text-white mb-2">MQTT Broker</h4>
                           <p className="text-sm text-slate-400">
                              By default, the platform connects to a high-speed HiveMQ cloud broker. You can swap this out in Settings. Ensure you only use `wss://` prefixes for web sockets to avoid mixed-content browser errors.
                           </p>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
