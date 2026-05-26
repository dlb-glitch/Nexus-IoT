import React from 'react';
import { LightbulbIcon, PowerIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function LightControl({ lightOn, onToggle }: { lightOn: boolean, onToggle: () => void }) {
  return (
    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-lg transition-colors",
            lightOn ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
          )}>
            <LightbulbIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-white">Main Light</h3>
            <p className="text-sm text-slate-400">Relay 1</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-medium text-slate-300">
          Status: {lightOn ? 'ON' : 'OFF'}
        </span>
        <button
          onClick={onToggle}
          className={cn(
            "relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 cursor-pointer pointer-events-auto",
            lightOn ? "bg-amber-500" : "bg-slate-700"
          )}
        >
          <span
            className={cn(
              "absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center",
              lightOn ? "translate-x-6" : "translate-x-0"
            )}
          >
            <PowerIcon className={cn("w-3 h-3", lightOn ? "text-amber-500" : "text-slate-400")} />
          </span>
        </button>
      </div>
    </div>
  );
}
