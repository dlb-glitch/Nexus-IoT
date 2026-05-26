import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { UserIcon, ActivityIcon, DoorClosedIcon, DoorOpenIcon } from 'lucide-react';

interface BooleanSensorCardProps {
  title: string;
  value: boolean;
  type: 'motion' | 'door';
}

export function BooleanSensorCard({ title, value, type }: BooleanSensorCardProps) {
  const isAlert = type === 'motion' ? value : value; // motion true = alert, door true = open/alert

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-sm flex flex-col justify-between",
        isAlert && "border-indigo-500/50 bg-indigo-500/10"
      )}
    >
      <div className="flex justify-between items-start">
         <h3 className="text-sm font-medium text-slate-400">{title}</h3>
         {type === 'motion' ? (
             <ActivityIcon className={cn("w-6 h-6", isAlert ? "text-indigo-400" : "text-slate-500")} />
         ) : value ? (
             <DoorOpenIcon className={cn("w-6 h-6 text-indigo-400")} />
         ) : (
             <DoorClosedIcon className={cn("w-6 h-6 text-slate-500")} />
         )}
      </div>

      <div className="mt-4 flex items-center justify-between">
         <span className={cn(
             "text-2xl font-bold tracking-tight",
             isAlert ? "text-indigo-400" : "text-white"
         )}>
             {type === 'motion' ? (value ? 'Detected' : 'Clear') : (value ? 'Open' : 'Closed')}
         </span>
         
         <div className="flex h-3 w-3 relative">
            {isAlert && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>}
            <span className={cn("relative inline-flex rounded-full h-3 w-3", isAlert ? "bg-indigo-500" : "bg-slate-700")}></span>
         </div>
      </div>

      {isAlert && (
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      )}
    </motion.div>
  );
}
