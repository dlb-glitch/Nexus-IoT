import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BotIcon, AlertCircleIcon, SparklesIcon } from 'lucide-react';
import { useIoTContext } from './IoTProvider';

export function AIAdvisor() {
  const { state, widgets } = useIoTContext();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const dynamicWidgetsPayload = widgets.map(w => {
        if (w.type === 'stat' || w.type === 'gauge' || w.type === 'chart') {
          if (!w.sensorKey) return '';
          let val = state.sensors[w.sensorKey];
          if (typeof val === 'number') val = Number(val.toFixed(1));
          return `- ${w.title}: ${val} ${w.unit || ''}`;
        } else if (w.type === 'control_light') {
          return `- Light Control: ${state.devices.lightOn ? 'ON' : 'OFF'}`;
        } else if (w.type === 'control_fan') {
          return `- Fan Control: ${state.devices.fanMode}`;
        } else if (w.type === 'control_dimmer') {
          return `- Dimmer Control: ${state.devices.ledBrightness}%`;
        }
        return '';
      }).filter(Boolean).join('\n');

      const systemInstruction = `
You are an expert AI IoT Analyst. Look at the current system state configured by the user:

Dashboard Telemetry:
${dynamicWidgetsPayload}

Other State:
- Gas Leak Detected: ${state.isGasLeak ? "YES" : "NO"}

Provide a comprehensive but concise professional analysis of the system's current health and any immediate recommendations based on the provided telemetry values. Use bullet points and clear, easy-to-read paragraphs.
      `;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Analyze the current system state and give professional recommendations based on the telemetry data.",
          systemInstruction
        })
      });
      if (response.ok) {
         const data = await response.json();
         setAnalysis(data.text);
      } else {
         setAnalysis("Error: Failed to fetch analysis from Gemini API.");
      }
    } catch(err) {
      setAnalysis("Error: Could not connect to the AI API.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderWidgetValue = (w: any) => {
    if (w.type === 'stat' || w.type === 'gauge' || w.type === 'chart') {
      if (!w.sensorKey) return '-';
      let val = state.sensors[w.sensorKey as keyof typeof state.sensors];
      if (typeof val === 'number') return `${val.toFixed(1)}${w.unit || ''}`;
      return val;
    } else if (w.type === 'control_light') {
      return state.devices.lightOn ? 'ON' : 'OFF';
    } else if (w.type === 'control_fan') {
      return state.devices.fanMode.toUpperCase();
    } else if (w.type === 'control_dimmer') {
      return `${state.devices.ledBrightness}%`;
    }
    return '-';
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <BotIcon className="w-8 h-8 text-indigo-400" />
            AI Advisor
          </h1>
          <p className="text-slate-400">
            Powered by Gemini, giving you deep insights on your dynamic sensor telemetry.
          </p>
        </div>
        {state.isGasLeak && (
          <div className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 border border-red-500/20 shadow-lg shadow-red-500/10">
            <AlertCircleIcon className="w-5 h-5" />
            <span className="text-sm font-bold">System Alert Active</span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between z-10">
          <div className="flex gap-4 sm:gap-4 items-center overflow-x-auto custom-scrollbar pb-2 w-full sm:w-auto mask-fade-right pr-4">
            {widgets.map(w => (
              <div key={w.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center min-w-[90px] shadow-sm shrink-0">
                <span className="text-xs text-slate-400 font-medium mb-1.5 truncate max-w-[80px]">{w.title}</span>
                <span className="text-lg font-semibold text-slate-200">{renderWidgetValue(w)}</span>
              </div>
            ))}
            {widgets.length === 0 && (
              <span className="text-slate-500 text-sm">No widgets configured on dashboard.</span>
            )}
          </div>

          <button 
             onClick={fetchAnalysis}
             disabled={isLoading}
             className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2 mx-auto sm:mx-0 shrink-0 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
           >
             {isLoading ? "Running Diagnostic..." : "Generate Analysis"}
             {!isLoading && <SparklesIcon className="w-4 h-4" />}
           </button>
        </div>
        
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar relative z-0">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {!analysis && !isLoading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 gap-5 max-w-sm mx-auto text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent" />
                  <BotIcon className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  Click <span className="text-indigo-400">Generate Analysis</span> to get an AI summary of your current dashboard telemetry.
                </p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-6"
              >
                  <div className="relative w-16 h-16">
                     <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
                     <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                     <BotIcon className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                 <p className="text-indigo-400 font-medium text-sm animate-pulse tracking-wide uppercase">Synthesizing Data...</p>
              </motion.div>
            )}

            {analysis && !isLoading && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed font-medium prose-p:mb-4 prose-a:text-indigo-400 prose-headings:text-slate-100 prose-strong:text-slate-200"
              >
                 <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-inner relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-sky-400" />
                    {analysis.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
