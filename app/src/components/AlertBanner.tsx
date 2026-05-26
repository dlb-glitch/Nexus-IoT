import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangleIcon } from 'lucide-react';

interface AlertBannerProps {
  isVisible: boolean;
  value: number;
}

export function AlertBanner({ isVisible, value }: AlertBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-red-500 text-white rounded-xl shadow-2xl shadow-red-500/20 p-4 flex items-start gap-4 border border-red-400">
             <div className="bg-white/20 p-2 rounded-lg shrink-0">
               <AlertTriangleIcon className="w-6 h-6 text-white animate-pulse" />
             </div>
             <div>
               <h4 className="font-bold text-lg mb-1">Peringatan Kebocoran Gas!</h4>
               <p className="text-red-100 text-sm">
                 Sensor MQ-9 mendeteksi kadar gas berbahaya ({value} PPM). Segera periksa area.
               </p>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
