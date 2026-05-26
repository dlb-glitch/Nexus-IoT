import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  warning?: boolean;
  className?: string;
}

export function StatCard({ title, value, unit, icon: Icon, trend, warning, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-sm",
        warning && "border-red-500/50 bg-red-500/10",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <Icon className={cn("h-5 w-5", warning ? "text-red-400" : "text-slate-500")} />
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className={cn(
          "text-3xl font-bold tracking-tight",
          warning ? "text-red-400" : "text-white"
        )}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        )}
      </div>

      {/* Decorative gradient blur in background */}
      {warning && (
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl rounded-full pointer-events-none" />
      )}
    </motion.div>
  );
}
