import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusIcon, XIcon, Settings2Icon } from 'lucide-react';
import { SensorData } from '../types';

interface ChartsPanelProps {
  history: SensorData[];
}

type ChartConfig = {
  id: string;
  name: string;
  sensorKey: keyof SensorData;
  color: string;
};

const defaultTabs: ChartConfig[] = [
  { id: '1', name: 'Temperature', sensorKey: 'temperature', color: '#f59e0b' },
  { id: '2', name: 'Gas Level', sensorKey: 'gasLevel', color: '#ef4444' },
];

export function ChartsPanel({ history }: ChartsPanelProps) {
  const [tabs, setTabs] = useState<ChartConfig[]>(defaultTabs);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Format timestamps for display
  const chartData = history.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  const addTab = (sensorKey: keyof SensorData, defaultName: string, color: string) => {
    const newId = `t_${Date.now()}`;
    const newTab = { id: newId, name: defaultName, sensorKey, color };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
    setShowAddMenu(false);
  };

  const removeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/50 p-3 rounded-lg shadow-xl shadow-black/50 text-sm z-50 relative">
          <p className="text-slate-400 mb-2 font-mono text-xs">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
               <span className="text-slate-300 capitalize">{entry.name}:</span>
               <span className="font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-6 flex flex-col pointer-events-auto relative cursor-default">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h3 className="font-medium text-white whitespace-nowrap">Real-time Telemetry</h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.name}
              {tabs.length > 1 && (
                <div onClick={(e) => removeTab(e, tab.id)} className="p-0.5 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-slate-300 cursor-pointer">
                  <XIcon className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
          
          <div className="relative">
             <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-1.5 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 transition-colors cursor-pointer"
                title="Add Widget / Tab"
             >
               <Settings2Icon className="w-4 h-4" />
             </button>
             
             {showAddMenu && (
               <div className="absolute top-10 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 w-48 z-50">
                  <div className="text-xs font-medium text-slate-500 mb-2 px-2 uppercase tracking-wider flex justify-between items-center">
                    <span>Add Chart</span>
                    <button onClick={() => setShowAddMenu(false)}><XIcon className="w-3 h-3 cursor-pointer"/></button>
                  </div>
                  <button onClick={() => addTab('temperature', 'Temperature', '#f59e0b')} className="w-full text-left px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors cursor-pointer">Temperature</button>
                  <button onClick={() => addTab('humidity', 'Humidity', '#0ea5e9')} className="w-full text-left px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors cursor-pointer">Humidity</button>
                  <button onClick={() => addTab('gasLevel', 'Gas Target', '#ef4444')} className="w-full text-left px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors cursor-pointer">Gas Target (PPM)</button>
                  <button onClick={() => addTab('voltage', 'Voltage', '#8b5cf6')} className="w-full text-left px-2 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded transition-colors cursor-pointer">Voltage</button>
               </div>
             )}
          </div>
         </div>
      </div>

      <div className="flex-1 w-full h-full min-h-[200px]">
        {currentTab ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color_${currentTab.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentTab.color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={currentTab.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={11}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={11}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={currentTab.sensorKey} 
                name={currentTab.name}
                stroke={currentTab.color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color_${currentTab.id})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            Please add a chart widget using the settings button.
          </div>
        )}
      </div>
    </div>
  );
}
