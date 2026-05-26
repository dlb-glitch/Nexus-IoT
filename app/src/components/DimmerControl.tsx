import React from 'react';
import { LightbulbIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function DimmerControl({ ledBrightness, onSetLedBrightness }: { ledBrightness: number, onSetLedBrightness: (val: number) => void }) {
  return (
    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg transition-colors",
              ledBrightness > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
            )}>
              <LightbulbIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-white">LED Dimmer</h3>
              <p className="text-sm text-slate-400">PWM Control</p>
            </div>
          </div>
          <span className="text-lg font-bold text-white">{ledBrightness}%</span>
       </div>
       
       <div className="flex flex-col gap-2 mt-auto">
         <div className="flex items-center gap-4 pointer-events-auto">
           <span className="text-xs text-slate-500 font-mono">0</span>
           <input 
             type="range" 
             min="0" 
             max="100" 
             value={ledBrightness}
             onChange={(e) => onSetLedBrightness(parseInt(e.target.value))}
             className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
           />
           <span className="text-xs text-slate-500 font-mono">100</span>
         </div>
       </div>
    </div>
  );
}
