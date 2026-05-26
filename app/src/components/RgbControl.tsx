import React from 'react';
import { PaletteIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const PRESET_COLORS = [
    '#ffffff', // White
    '#ef4444', // Red
    '#10b981', // Green
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#d946ef', // Fuchsia
];

export function RgbControl({ color, onSetColor }: { color: string, onSetColor: (c: string) => void }) {
  return (
    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 p-6 flex flex-col pointer-events-auto">
      <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
            <PaletteIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-white">RGB Strip</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{color.toUpperCase()}</p>
          </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-auto">
         {PRESET_COLORS.map(c => (
             <button
                key={c}
                onClick={() => onSetColor(c)}
                className={cn(
                    "w-full h-8 rounded-md transition-all shadow-sm ring-offset-slate-900 ring-offset-2 hover:scale-105",
                    color === c && "ring-2 ring-white"
                )}
                style={{ backgroundColor: c }}
             />
         ))}
      </div>
    </div>
  );
}
