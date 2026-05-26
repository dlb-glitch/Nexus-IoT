import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface GaugeWidgetProps {
  title: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  icon?: LucideIcon;
  warning?: boolean;
  className?: string;
}

export function GaugeWidget({ 
  title, 
  value, 
  min = 0, 
  max = 100, 
  unit = '', 
  icon: Icon, 
  warning = false, 
  className 
}: GaugeWidgetProps) {
  const size = 100; // Reference size for viewBox
  
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  // Calculate percentage (0 to 1)
  const percentage = (clampedValue - min) / (max - min);

  // SVG dimensions
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Arc length for a semi-circle
  const circumference = Math.PI * radius;
  // Stroke dash array / offset calculations
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-sm flex flex-col items-center justify-center h-full w-full",
        warning && "border-red-500/50 bg-red-500/10",
        className
      )}
    >
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 w-[calc(100%-2rem)]">
        <h3 className="text-sm font-medium text-slate-400 truncate">{title}</h3>
        {Icon && <Icon className={cn("h-5 w-5 flex-shrink-0", warning ? "text-red-400" : "text-slate-500")} />}
      </div>

      <div className="relative flex-grow flex items-center justify-center mt-6 w-full max-h-[85%]">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            strokeLinecap="round"
          />
          
          {/* Foreground Arc (Animated) */}
          <motion.path
            d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(warning ? "text-red-500" : "text-sky-500")}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner Text Overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2">
          <span 
            className={cn(
              "font-bold tracking-tight",
              warning ? "text-red-400" : "text-white"
            )}
            style={{ fontSize: `clamp(1.5rem, 4vw, 2.5rem)`, lineHeight: 1 }}
          >
            {value.toFixed(1)}
          </span>
          {unit && (
            <span 
              className="font-medium text-slate-500 mt-1 text-xs" 
            >
              {unit}
            </span>
          )}
          
          {/* Min/Max labels */}
          <div 
            className="flex w-full justify-between items-center px-4 mt-2" 
          >
             <span className="text-slate-600 font-mono text-[10px]">{min}</span>
             <span className="text-slate-600 font-mono text-[10px]">{max}</span>
          </div>
        </div>
      </div>

      {warning && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl rounded-full pointer-events-none" />
      )}
    </motion.div>
  );
}
