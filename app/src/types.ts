export type FanMode = 'off' | 'manual' | 'auto';

export interface SensorData {
  temperature: number; // Celsius
  humidity: number;    // %
  gasLevel: number;    // PPM (MQ-9)
  voltage: number;     // Volts (ZMPT101B)
  motion: boolean;     // Motion sensor
  doorOpen: boolean;   // Door contact sensor
  lightLevel: number;  // Lux
  timestamp: number;   // UNIX timestamp
}

export interface DeviceStatus {
  lightOn: boolean;
  fanMode: FanMode;
  ledBrightness: number;
  rgbColor: string;    // Hex color string #RRGGBB
  lockEngaged: boolean;// Smart lock status
}

export interface SystemState {
  sensors: SensorData;
  devices: DeviceStatus;
  history: SensorData[];
  isGasLeak: boolean;
}

export interface MqttConfig {
  url: string;
  username?: string;
  password?: string;
}

export interface ThemeConfig {
  colorSchema: 'blue' | 'sky' | 'emerald' | 'rose' | 'amber';
}

export type WidgetType = 'stat' | 'gauge' | 'chart' | 'control_light' | 'control_fan' | 'control_dimmer' | 'control_switch' | 'control_rgb' | 'control_lock' | 'sensor_boolean';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  sensorKey?: keyof SensorData;
  unit?: string;
  // Layout constraints (x, y, w, h are handled by layout state, not widget config, but we can store them together)
  // We'll store layout natively in the layout manager.
}
