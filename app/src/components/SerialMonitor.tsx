import React from 'react';
import { motion } from 'motion/react';
import { CpuIcon, TrashIcon } from 'lucide-react';
import { useIoTContext } from './IoTProvider';

export function SerialMonitor() {
  const { logs, clearLogs } = useIoTContext();
  
  // Filter only system status logs, or show all logs if you want.
  // The user asked to show status like wifi connect, disconnect, failed to read sensor etc.
  // Let's assume these come from the topic 'System', 'iot/system/status' or we just show all inward logs but highlight 'System'.
  
  const systemLogs = logs.filter(log => log.topic === 'System' || log.topic.startsWith('iot/system'));

  return (
    <div className="w-full flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <CpuIcon className="w-8 h-8 text-sky-400" />
            Serial Monitor
          </h1>
          <p className="text-slate-400">
            Monitor system status from the microcontroller (e.g., connection status, sensor errors).
          </p>
        </div>
        <button
          onClick={clearLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 text-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Clear Monitor
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg shadow-black/20">
          <div className="bg-slate-950/50 p-3 border-b border-slate-800 flex justify-between items-center text-sm font-medium text-slate-400">
            <span>System Status Log</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
            {systemLogs.length === 0 && (
              <div className="text-slate-600 text-center mt-10">Waiting for system status updates...</div>
            )}
            {systemLogs.map((log) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={log.id} 
                className="flex gap-4 border-b border-slate-800/50 pb-2 last:border-0"
              >
                <span className="text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
                </span>
                <span className={`text-slate-300 font-bold shrink-0 ${log.payload.toLowerCase().includes('error') || log.payload.toLowerCase().includes('offline') ? 'text-red-400' : 'text-sky-400'}`}>
                  {log.topic}
                </span>
                <span className="text-slate-400 break-all">{log.payload}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
