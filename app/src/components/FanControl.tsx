import React from 'react';
import { WindIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { FanMode } from '../types';

export function FanControl({ fanMode, onSetFanMode }: { fanMode: FanMode, onSetFanMode: (mode: FanMode) => void }) {
  const fanModes: { value: FanMode; label: string }[] = [
    { value: 'off', label: 'Off' },
    { value: 'manual', label: 'Manual' },
    { value: 'auto', label: 'Auto' },
  ];
  return (
    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg transition-colors",
              fanMode !== 'off' ? "bg-sky-500/20 text-sky-400" : "bg-slate-800 text-slate-400"
            )}>
              <WindIcon className={cn("w-6 h-6", fanMode !== 'off' && "animate-[spin_3s_linear_infinite]")} />
            </div>
            <div>
              <h3 className="font-medium text-white">Cooling Fan</h3>
              <p className="text-sm text-slate-400">Environment</p>
            </div>
          </div>
       </div>
       
       <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mt-auto pointer-events-auto">
          {fanModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onSetFanMode(mode.value)}
              className={cn(
                "relative flex-1 py-1.5 text-sm font-medium transition-colors rounded-md z-10 cursor-pointer",
                fanMode === mode.value ? "text-white bg-slate-800" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {mode.label}
            </button>
          ))}
       </div>
    </div>
  );
}
