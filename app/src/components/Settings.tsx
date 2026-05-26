import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SettingsIcon, RefreshCw, PaletteIcon, UserIcon, CheckIcon } from 'lucide-react';
import { useIoTContext } from './IoTProvider';
import { auth } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';

export function Settings() {
  const { mqttConfig, setMqttConfig, status, themeConfig, setThemeConfig } = useIoTContext();
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      await updateProfile(auth.currentUser, { displayName });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMqttSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setMqttConfig({
      url: formData.get('url') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    });
  };

  const colors = ['sky', 'blue', 'emerald', 'amber', 'rose'] as const;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-sky-400" />
          Configuration
        </h1>
        <p className="text-slate-400">
          Manage MQTT connection parameters and application preferences.
        </p>
      </div>

      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/20"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-white text-lg">Account Profile</h3>
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                <input 
                  type="text" 
                  value={auth.currentUser?.email || ''}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 outline-none cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex justify-end items-center gap-4">
               {updateSuccess && (
                 <span className="text-emerald-400 text-sm flex items-center gap-1">
                   <CheckIcon className="w-4 h-4" /> Profile updated
                 </span>
               )}
               <button 
                 type="submit"
                 disabled={isUpdating}
                 className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-5 py-2 rounded-lg font-medium transition-colors border border-sky-500/20 disabled:opacity-50"
               >
                 {isUpdating ? 'Saving...' : 'Save Profile'}
               </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/20"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-white text-lg">MQTT Broker</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {status === 'connecting' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  status === 'connected' ? 'bg-emerald-500' :
                  status === 'connecting' ? 'bg-amber-500' :
                  status === 'error' ? 'bg-red-500' : 'bg-slate-500'
                }`}></span>
              </span>
              <span className="text-sm font-medium text-slate-400 capitalize">{status}</span>
            </div>
          </div>
          
          <form onSubmit={handleMqttSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">WebSocket URL</label>
              <input 
                 type="text" 
                 name="url"
                 defaultValue={mqttConfig.url}
                 placeholder="ws://broker.hivemq.com:8000/mqtt"
                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-sky-500 transition-colors"
                 required
               />
               <p className="text-xs text-slate-500 mt-1">Must use ws:// or wss:// protocol for web applications.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Username (Optional)</label>
                <input 
                  type="text" 
                  name="username"
                  defaultValue={mqttConfig.username}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password (Optional)</label>
                <input 
                  type="password" 
                  name="password"
                  defaultValue={mqttConfig.password}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex justify-end">
               <button 
                 type="submit"
                 className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg font-medium transition-colors border border-slate-700"
               >
                 <RefreshCw className="w-4 h-4" />
                 Apply & Reconnect
               </button>
            </div>
          </form>
        </motion.div>

        {/* Visual Customization */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-black/20"
        >
          <div className="flex items-center gap-2 mb-6">
             <PaletteIcon className="w-5 h-5 text-slate-400" />
             <h3 className="font-medium text-white text-lg">Visual Customization</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">Accent Color (Preview Demo Mode)</label>
            <div className="flex gap-4">
               {colors.map(color => {
                 const bgClasses: Record<string, string> = {
                   'sky': 'bg-sky-500',
                   'blue': 'bg-blue-500',
                   'emerald': 'bg-emerald-500',
                   'amber': 'bg-amber-500',
                   'rose': 'bg-rose-500'
                 };
                 return (
                 <button
                   key={color}
                   onClick={() => setThemeConfig({ ...themeConfig, colorSchema: color })}
                   className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                     themeConfig.colorSchema === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                   } ${bgClasses[color]}`}
                 >
                 </button>
               )})}
            </div>
             <p className="text-xs text-slate-500 mt-4 leading-relaxed">
               Note: Full theme customization requires mapping CSS variables. This simulates the customization layout.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
