import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ThermometerIcon, DropletsIcon, FlameIcon, ZapIcon, Settings2Icon, PlusIcon, XIcon, LightbulbIcon, WindIcon, GaugeIcon, ChevronLeftIcon, LayoutPanelLeftIcon, ActivityIcon, LockIcon, PaletteIcon, DoorOpenIcon } from 'lucide-react';
import { useIoTContext } from './IoTProvider';
import { StatCard } from './StatCard';
import { GaugeWidget } from './GaugeWidget';
import { ChartsPanel } from './ChartsPanel';
import { LightControl } from './LightControl';
import { FanControl } from './FanControl';
import { DimmerControl } from './DimmerControl';
import { AlertBanner } from './AlertBanner';
import { RgbControl } from './RgbControl';
import { LockControl } from './LockControl';
import { BooleanSensorCard } from './BooleanSensorCard';
import { motion, AnimatePresence } from 'motion/react';
import { Responsive as ResponsiveGridLayout, Layout } from 'react-grid-layout';

function useStableContainerWidth() {
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let cachedWidth = 0;
    
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.floor(entry.contentRect.width);
        if (Math.abs(newWidth - cachedWidth) > 5) {
          cachedWidth = newWidth;
          if (frameId) cancelAnimationFrame(frameId);
          frameId = requestAnimationFrame(() => setWidth(newWidth));
        }
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return { width, containerRef, mounted: true };
}
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CloudUploadIcon } from 'lucide-react';

export function Dashboard() {
  const { state, toggleLight, setFanMode, setLedBrightness, setRgbColor, toggleLock, widgets, setWidgets, layouts, setLayouts } = useIoTContext();
  const { sensors, devices, history, isGasLeak } = state;

  const { width, containerRef, mounted } = useStableContainerWidth();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalStep, setAddModalStep] = useState<'sensor' | 'model'>('sensor');
  const [selectedSensorKey, setSelectedSensorKey] = useState<string | null>(null);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);

  const handleSaveSnapshot = async () => {
    if (!auth.currentUser) return;
    setIsSavingSnapshot(true);
    try {
      const userId = auth.currentUser.uid;
      const promises = ['temperature', 'humidity', 'gasLevel', 'voltage'].map((sensorKey) => {
        return addDoc(collection(db, 'users', userId, 'telemetry'), {
          userId,
          sensorKey,
          value: sensors[sensorKey as keyof typeof sensors] || 0,
          timestamp: serverTimestamp()
        });
      });
      await Promise.all(promises);
      alert('Snapshot berhasil disimpan ke Cloud!');
    } catch (error) {
      console.error('Error saving snapshot:', error);
      alert('Gagal menyimpan snapshot.');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    // Reset after animation
    setTimeout(() => {
      setAddModalStep('sensor');
      setSelectedSensorKey(null);
    }, 200);
  };

  const activeLayouts = useMemo(() => {
    const res: { [key: string]: Layout } = {};
    for (const key in layouts) {
      res[key] = layouts[key].map(item => ({
        ...item,
        isDraggable: isEditMode,
        isResizable: isEditMode,
        static: !isEditMode,
      }));
    }
    return res;
  }, [layouts, isEditMode]);

  const getIconForSensor = (key?: string) => {
    switch (key) {
      case 'temperature': return ThermometerIcon;
      case 'humidity': return DropletsIcon;
      case 'gasLevel': return FlameIcon;
      case 'voltage': return ZapIcon;
      case 'speed': return GaugeIcon;
      default: return ZapIcon;
    }
  };

  const onLayoutChange = (layout: Layout, allLayouts: { [key: string]: Layout }) => {
    if (isEditMode) {
      setLayouts(allLayouts);
    }
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const addWidget = (type: any, sensorKey?: keyof typeof sensors) => {
    const id = `w_${Date.now()}`;
    const newWidget = {
      id,
      type,
      title: type === 'stat' ? `New ${sensorKey} Stat` : type === 'gauge' ? `New ${sensorKey} Gauge` : type === 'chart' ? 'New Chart' : 'New Controls',
      sensorKey,
      unit: sensorKey === 'temperature' ? '°C' : sensorKey === 'humidity' ? '%' : sensorKey === 'gasLevel' ? 'PPM' : sensorKey === 'voltage' ? 'V' : undefined
    };
    setWidgets([...widgets, newWidget]);
    
    // Add to all layouts at default position
    const newLayouts = { ...layouts };
    
    // Default dimensions
    let w = 3, h = 4, minW = 2, minH = 3, maxW = 12, maxH = 8;
    if (type === 'chart') { w = 9; h = 10; minW = 4; minH = 6; maxW = 12; maxH = 20; }
    else if (type === 'gauge') { w = 4; h = 6; minW = 3; minH = 4; maxW = 8; maxH = 10; }
    else if (type.startsWith('control')) { w = 3; h = 3; minW = 2; minH = 3; maxH = 6; }

    Object.keys(newLayouts).forEach(br => {
      newLayouts[br] = [...(newLayouts[br] || []), { i: id, x: 0, y: Number.MAX_SAFE_INTEGER, w, h, minW, minH, maxW, maxH }];
    });
    setLayouts(newLayouts);
    closeAddModal();
  };

  const renderWidget = (w: any) => {
    let content = null;
    if (w.type === 'stat') {
      const val = w.sensorKey ? sensors[w.sensorKey as keyof typeof sensors] : 0;
      content = (
        <StatCard 
          title={w.title || ''} 
          value={typeof val === 'number' ? val.toFixed(1) : String(val)} 
          unit={w.unit || ''} 
          icon={getIconForSensor(w.sensorKey)}
          warning={w.sensorKey === 'gasLevel' && isGasLeak}
          className="w-full h-full m-0"
        />
      );
    } else if (w.type === 'gauge') {
      const val = w.sensorKey ? sensors[w.sensorKey as keyof typeof sensors] : 0;
      let min = 0, max = 100;
      if (w.sensorKey === 'temperature') { min = 0; max = 50; }
      if (w.sensorKey === 'gasLevel') { min = 0; max = 1000; }
      if (w.sensorKey === 'voltage') { min = 0; max = 250; }
      
      content = (
        <GaugeWidget 
          title={w.title || ''} 
          value={typeof val === 'number' ? val : 0} 
          min={min}
          max={max}
          unit={w.unit || ''} 
          icon={getIconForSensor(w.sensorKey)}
          warning={w.sensorKey === 'gasLevel' && isGasLeak}
          className="w-full h-full m-0"
        />
      );
    } else if (w.type === 'chart') {
      content = <ChartsPanel history={history} />;
    } else if (w.type === 'control_light') {
      content = <LightControl lightOn={devices.lightOn} onToggle={toggleLight} />;
    } else if (w.type === 'control_fan') {
      content = <FanControl fanMode={devices.fanMode} onSetFanMode={setFanMode} />;
    } else if (w.type === 'control_dimmer') {
      content = <DimmerControl ledBrightness={devices.ledBrightness} onSetLedBrightness={setLedBrightness} />;
    } else if (w.type === 'control_rgb') {
      content = <RgbControl color={devices.rgbColor} onSetColor={setRgbColor} />;
    } else if (w.type === 'control_lock') {
      content = <LockControl lockEngaged={devices.lockEngaged} onToggle={toggleLock} />;
    } else if (w.type === 'sensor_boolean') {
      const val = w.sensorKey ? sensors[w.sensorKey as keyof typeof sensors] : false;
      content = (
        <BooleanSensorCard 
          title={w.title || ''} 
          value={Boolean(val)} 
          type={w.sensorKey === 'doorOpen' ? 'door' : 'motion'} 
        />
      );
    }

    return (
      <div key={w.id} className="relative w-full h-full group">
        {content}
        {isEditMode && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] border-2 border-sky-500/50 hover:border-sky-500 rounded-xl flex items-center justify-center transition-all z-10 pointer-events-none">
            <button 
              onClick={() => removeWidget(w.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer pointer-events-auto shadow-lg"
            >
              <XIcon className="w-4 h-4" />
            </button>
            <div className="drag-handle pointer-events-auto bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg shadow-xl flex items-center justify-center cursor-move hover:bg-slate-800 transition-colors">
              <span className="font-bold text-sky-400 flex items-center gap-2">
                Drag to Move
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full relative">
      <AlertBanner isVisible={isGasLeak} value={sensors.gasLevel} />

      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight text-white mb-2"
          >
            Welcome, {auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400"
          >
            Real-time telemetry and control panel.
          </motion.p>
        </div>
        
        <div className="flex gap-2">
           <button
              onClick={handleSaveSnapshot}
              disabled={isSavingSnapshot}
              title="Save Snapshot"
              className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 rounded-lg transition-colors border border-indigo-500 disabled:opacity-50"
            >
              <CloudUploadIcon className="w-5 h-5" />
            </button>
           {isEditMode && (
             <button
                onClick={() => setShowAddModal(true)}
                title="Add Widget"
                className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white w-10 h-10 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
           )}
           <button
              onClick={() => setIsEditMode(!isEditMode)}
              title={isEditMode ? 'Finish Editing' : 'Edit Layout'}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors border ${
                isEditMode ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings2Icon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="min-h-[500px]" ref={containerRef}>
        {mounted && (
          <ResponsiveGridLayout
            className="layout"
            layouts={activeLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            width={width}
            onLayoutChange={onLayoutChange}
            dragConfig={{ enabled: isEditMode, handle: ".drag-handle" }}
            resizeConfig={{ enabled: isEditMode }}
            margin={[16, 16]}
          >
            {widgets.map(w => renderWidget(w))}
          </ResponsiveGridLayout>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-4"
             >
                 <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2">
                     {addModalStep === 'model' && (
                       <button onClick={() => setAddModalStep('sensor')} className="text-slate-400 hover:text-white mr-2">
                         <ChevronLeftIcon className="w-5 h-5" />
                       </button>
                     )}
                     <h3 className="text-xl font-bold text-white">
                       {addModalStep === 'sensor' ? 'Select Widget' : 'Select UI Model'}
                     </h3>
                   </div>
                   <button onClick={closeAddModal} className="text-slate-400 hover:text-white">
                     <XIcon className="w-5 h-5" />
                   </button>
                 </div>

                 {addModalStep === 'sensor' ? (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     <div className="col-span-full mb-1 mt-2">
                       <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sensors (Multi UI)</h4>
                     </div>
                      <button onClick={() => { setSelectedSensorKey('temperature'); setAddModalStep('model'); }} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <ThermometerIcon className="w-6 h-6 text-amber-500" />
                        <span className="text-sm font-medium text-slate-300">Temperature</span>
                      </button>
                      <button onClick={() => { setSelectedSensorKey('humidity'); setAddModalStep('model'); }} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <DropletsIcon className="w-6 h-6 text-sky-500" />
                        <span className="text-sm font-medium text-slate-300">Humidity</span>
                      </button>
                      <button onClick={() => { setSelectedSensorKey('gasLevel'); setAddModalStep('model'); }} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <FlameIcon className="w-6 h-6 text-red-500" />
                        <span className="text-sm font-medium text-slate-300">Gas Target</span>
                      </button>
                      <button onClick={() => { setSelectedSensorKey('voltage'); setAddModalStep('model'); }} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <ZapIcon className="w-6 h-6 text-purple-500" />
                        <span className="text-sm font-medium text-slate-300">Voltage</span>
                      </button>

                     <div className="col-span-full mb-1 mt-4">
                       <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Boolean & Security</h4>
                     </div>
                      <button onClick={() => addWidget('sensor_boolean', 'motion')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <ActivityIcon className="w-6 h-6 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">Motion Sensor</span>
                      </button>
                      <button onClick={() => addWidget('sensor_boolean', 'doorOpen')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <DoorOpenIcon className="w-6 h-6 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">Door Sensor</span>
                      </button>
                      <button onClick={() => addWidget('control_lock')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <LockIcon className="w-6 h-6 text-emerald-400" />
                        <span className="text-sm font-medium text-slate-300">Smart Lock</span>
                      </button>

                     <div className="col-span-full mb-1 mt-4">
                       <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Controls & Charts</h4>
                     </div>
                      <button onClick={() => addWidget('chart')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <ZapIcon className="w-6 h-6 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-300">Telemetry Chart</span>
                      </button>
                      <button onClick={() => addWidget('control_light')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <LightbulbIcon className="w-6 h-6 text-amber-400" />
                        <span className="text-sm font-medium text-slate-300">Light Switch</span>
                      </button>
                      <button onClick={() => addWidget('control_rgb')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <PaletteIcon className="w-6 h-6 text-amber-500" />
                        <span className="text-sm font-medium text-slate-300">RGB Strip</span>
                      </button>
                      <button onClick={() => addWidget('control_fan')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <WindIcon className="w-6 h-6 text-sky-400" />
                        <span className="text-sm font-medium text-slate-300">Fan Control</span>
                      </button>
                      <button onClick={() => addWidget('control_dimmer')} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-2 transition-colors border border-slate-700">
                        <Settings2Icon className="w-6 h-6 text-emerald-400" />
                        <span className="text-sm font-medium text-slate-300">LED Dimmer</span>
                      </button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => addWidget('stat', selectedSensorKey as any)} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-xl flex flex-col items-center text-center gap-3 transition-colors border border-slate-700 group">
                        <div className="bg-slate-900 border border-slate-700 w-24 h-16 rounded shadow-sm flex items-center justify-center mb-2 group-hover:border-sky-500 transition-colors">
                          <LayoutPanelLeftIcon className="w-6 h-6 text-sky-400" />
                        </div>
                        <span className="text-base font-semibold text-white">Stat Card</span>
                        <span className="text-xs text-slate-400">Standard numeric display card.</span>
                      </button>
                      <button onClick={() => addWidget('gauge', selectedSensorKey as any)} className="bg-slate-800 hover:bg-slate-700 p-6 rounded-xl flex flex-col items-center text-center gap-3 transition-colors border border-slate-700 group">
                        <div className="bg-slate-900 border border-slate-700 w-24 h-16 rounded shadow-sm flex items-center justify-center mb-2 group-hover:border-orange-500 transition-colors">
                          <GaugeIcon className="w-8 h-8 text-orange-500" />
                        </div>
                        <span className="text-base font-semibold text-white">Gauge Meter</span>
                        <span className="text-xs text-slate-400">Radial speedometer style display.</span>
                      </button>
                   </div>
                 )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
