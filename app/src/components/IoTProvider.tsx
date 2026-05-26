import React, { createContext, useContext, ReactNode } from 'react';
import { useIoTData, MqttLogMsg } from '../hooks/useIoTData';
import { useAppConfig } from '../hooks/useAppConfig';
import { SystemState, FanMode, MqttConfig, ThemeConfig, WidgetConfig } from '../types';
import { Layout } from 'react-grid-layout';

interface IoTContextValue {
  state: SystemState;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  logs: MqttLogMsg[];
  toggleLight: () => void;
  setFanMode: (mode: FanMode) => void;
  setLedBrightness: (brightness: number) => void;
  setRgbColor: (color: string) => void;
  toggleLock: () => void;
  rawPublish: (topic: string, payload: string) => void;
  clearLogs: () => void;
  mqttConfig: MqttConfig;
  setMqttConfig: (config: MqttConfig) => void;
  themeConfig: ThemeConfig;
  setThemeConfig: (config: ThemeConfig) => void;
  widgets: WidgetConfig[];
  setWidgets: (widgets: WidgetConfig[]) => void;
  layouts: { [key: string]: Layout };
  setLayouts: (layouts: { [key: string]: Layout }) => void;
}

const IoTContext = createContext<IoTContextValue | null>(null);

export function IoTProvider({ children }: { children: ReactNode }) {
  const { mqttConfig, setMqttConfig, themeConfig, setThemeConfig, widgets, setWidgets, layouts, setLayouts } = useAppConfig();
  const iot = useIoTData(mqttConfig);

  return (
    <IoTContext.Provider value={{ ...iot, mqttConfig, setMqttConfig, themeConfig, setThemeConfig, widgets, setWidgets, layouts, setLayouts }}>
      {children}
    </IoTContext.Provider>
  );
}

export function useIoTContext() {
  const ctx = useContext(IoTContext);
  if (!ctx) throw new Error('useIoTContext must be used within IoTProvider');
  return ctx;
}
