import React from 'react';
import { LockIcon, UnlockIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function LockControl({ lockEngaged, onToggle }: { lockEngaged: boolean, onToggle: () => void }) {
  return (
    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl transition-colors shadow-inner",
            !lockEngaged ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          )}>
            {lockEngaged ? <LockIcon className="w-6 h-6" /> : <UnlockIcon className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-medium text-white">Smart Lock</h3>
            <p className="text-sm text-slate-400">Main Door</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto cursor-pointer pointer-events-auto">
        <span className={cn(
            "text-lg font-bold transition-colors",
            !lockEngaged ? "text-red-400" : "text-emerald-400"
        )}>
          {lockEngaged ? 'LOCKED' : 'UNLOCKED'}
        </span>
        <button
          onClick={onToggle}
          className={cn(
            "px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none flex-shrink-0 font-medium text-sm border",
            !lockEngaged 
                ? "bg-red-500/20 text-red-400 border-red-500 hover:bg-red-500 hover:text-white" 
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500 hover:bg-emerald-500 hover:text-white"
          )}
        >
          {lockEngaged ? 'Unlock' : 'Lock'}
        </button>
      </div>

      <div className={cn(
          "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-1000",
          !lockEngaged ? "bg-red-500/10" : "bg-emerald-500/10"
      )} />
    </div>
  );
}
