import { useState, useEffect, useCallback, useRef } from 'react';
import { SystemState, SensorData, DeviceStatus, FanMode, MqttConfig } from '../types';
import mqtt, { MqttClient } from 'mqtt';

const HISTORY_LIMIT = 50;
const LOG_LIMIT = 100;
const GAS_DANGER_THRESHOLD = 300; // PPM

const initialDeviceStatus: DeviceStatus = {
  lightOn: false,
  fanMode: 'off',
  ledBrightness: 50,
  rgbColor: '#00f0ff',
  lockEngaged: true,
};

const initialSensorData: SensorData = {
  temperature: 0,
  humidity: 0,
  gasLevel: 0,
  voltage: 0,
  motion: false,
  doorOpen: false,
  lightLevel: 0,
  timestamp: Date.now(),
};

export interface MqttLogMsg {
  id: string;
  timestamp: number;
  topic: string;
  payload: string;
  direction: 'in' | 'out';
}

const TOPIC_PREFIX = 'nexus_iot_aistudio_001/';

export function useIoTData(config: MqttConfig) {
  const mqttClientRef = useRef<MqttClient | null>(null);

  const [state, setState] = useState<SystemState>({
    sensors: initialSensorData,
    devices: initialDeviceStatus,
    history: [],
    isGasLeak: false,
  });

  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [logs, setLogs] = useState<MqttLogMsg[]>([]);

  const addLog = useCallback((topic: string, payload: string, direction: 'in' | 'out') => {
    setLogs(prev => {
      const newLog: MqttLogMsg = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        topic,
        payload,
        direction
      };
      return [newLog, ...prev].slice(0, LOG_LIMIT);
    });
  }, []);

  useEffect(() => {
    const rawUrl = config.url?.trim() || '';
    if (!rawUrl) {
      setStatus('disconnected');
      return;
    }

    // Ensure valid protocol for browser MQTT
    let validUrl = rawUrl;
    if (!validUrl.startsWith('ws://') && !validUrl.startsWith('wss://')) {
      if (validUrl.includes('://')) {
        setStatus('error');
        addLog('System', 'Init Error: Only ws:// or wss:// protocols are supported in the browser.', 'in');
        return;
      } else {
        validUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + validUrl;
      }
    }

    // Prevent mixed content errors on HTTPS
    if (window.location.protocol === 'https:' && validUrl.startsWith('ws://')) {
      validUrl = validUrl.replace('ws://', 'wss://');
      // Fix known default port for test.mosquitto.org
      if (validUrl.includes('test.mosquitto.org:8080')) {
        validUrl = validUrl.replace(':8080', ':8081');
      }
    }

    setStatus('connecting');
    let client: MqttClient;
    try {
      client = mqtt.connect(validUrl, {
        username: config.username || undefined,
        password: config.password || undefined,
        reconnectPeriod: 5000,
      });
    } catch (err: any) {
      console.error('MQTT Initialization Error:', err);
      setStatus('error');
      addLog('System', `Init Error: ${err.message}`, 'in');
      return;
    }

    mqttClientRef.current = client;

    client.on('connect', () => {
      setStatus('connected');
      // Use a unique topic prefix to avoid flooding from public brokers causing UI lockups
      const uniqueTopic = `${TOPIC_PREFIX}#`; 
      client.subscribe(uniqueTopic);
      addLog('System', `Connected, subscribed to ${uniqueTopic}`, 'in');
    });

    client.on('error', (err) => {
      setStatus('error');
      addLog('System', `MQTT Error: ${err.message}`, 'in');
    });

    client.on('offline', () => {
      setStatus('disconnected');
      addLog('System', 'MQTT Offline', 'in');
    });

    let lastTelemetryUpdate = 0;
    let lastLogUpdate = 0;

    client.on('message', (topic, message) => {
      const msgStr = message.toString();
      const now = Date.now();
      
      // Throttle logging to prevent freezing
      if (now - lastLogUpdate >= 100) {
        addLog(topic, msgStr, 'in');
        lastLogUpdate = now;
      }

      try {
        if (topic === `${TOPIC_PREFIX}sensors/telemetry`) {
          const now = Date.now();
          if (now - lastTelemetryUpdate < 200) {
            return; // Throttle UI updates to max 5 fps (every 200ms) to prevent freezing when receiving thousands of data points
          }
          lastTelemetryUpdate = now;

          const data = JSON.parse(msgStr);
          
          setState((prev) => {
            const newlyReadSensors: SensorData = {
              temperature: data.temperature ?? prev.sensors.temperature,
              humidity: data.humidity ?? prev.sensors.humidity,
              gasLevel: data.gasLevel ?? prev.sensors.gasLevel,
              voltage: data.voltage ?? prev.sensors.voltage,
              motion: data.motion ?? prev.sensors.motion,
              doorOpen: data.doorOpen ?? prev.sensors.doorOpen,
              lightLevel: data.lightLevel ?? prev.sensors.lightLevel,
              timestamp: Date.now(),
            };

            const isGasLeak = newlyReadSensors.gasLevel >= GAS_DANGER_THRESHOLD;
            const newHistory = [...prev.history, newlyReadSensors].slice(-HISTORY_LIMIT);

            return {
              ...prev,
              sensors: newlyReadSensors,
              history: newHistory,
              isGasLeak
            };
          });
        }
      } catch (err) {
        // Ignore JSON parse errors for non-telemetry
      }
    });

    return () => {
      client.end();
      mqttClientRef.current = null;
    };
  }, [config, addLog]);

  const toggleLight = useCallback(() => {
    setState((prev) => {
      const newState = !prev.devices.lightOn;
      const payload = newState ? 'ON' : 'OFF';
      if (mqttClientRef.current && status === 'connected') {
        mqttClientRef.current.publish(`${TOPIC_PREFIX}control/light`, payload);
        addLog(`${TOPIC_PREFIX}control/light`, payload, 'out');
      }
      return {
        ...prev,
        devices: { ...prev.devices, lightOn: newState }
      };
    });
  }, [status, addLog]);

  const setFanMode = useCallback((mode: FanMode) => {
    setState((prev) => {
      if (mqttClientRef.current && status === 'connected') {
        mqttClientRef.current.publish(`${TOPIC_PREFIX}control/fan`, mode);
        addLog(`${TOPIC_PREFIX}control/fan`, mode, 'out');
      }
      return {
        ...prev,
        devices: { ...prev.devices, fanMode: mode }
      };
    });
  }, [status, addLog]);

  const setLedBrightness = useCallback((brightness: number) => {
    setState((prev) => {
      if (mqttClientRef.current && status === 'connected') {
        mqttClientRef.current.publish(`${TOPIC_PREFIX}control/brightness`, brightness.toString());
        addLog(`${TOPIC_PREFIX}control/brightness`, brightness.toString(), 'out');
      }
      return {
        ...prev,
        devices: { ...prev.devices, ledBrightness: brightness }
      };
    });
  }, [status, addLog]);

  const setRgbColor = useCallback((color: string) => {
    setState((prev) => {
      if (mqttClientRef.current && status === 'connected') {
        mqttClientRef.current.publish(`${TOPIC_PREFIX}control/rgb`, color);
        addLog(`${TOPIC_PREFIX}control/rgb`, color, 'out');
      }
      return {
        ...prev,
        devices: { ...prev.devices, rgbColor: color }
      };
    });
  }, [status, addLog]);

  const toggleLock = useCallback(() => {
    setState((prev) => {
      const newState = !prev.devices.lockEngaged;
      const payload = newState ? 'LOCKED' : 'UNLOCKED';
      if (mqttClientRef.current && status === 'connected') {
        mqttClientRef.current.publish(`${TOPIC_PREFIX}control/lock`, payload);
        addLog(`${TOPIC_PREFIX}control/lock`, payload, 'out');
      }
      return {
        ...prev,
        devices: { ...prev.devices, lockEngaged: newState }
      };
    });
  }, [status, addLog]);

  const rawPublish = useCallback((topic: string, payload: string) => {
    if (mqttClientRef.current && status === 'connected') {
      mqttClientRef.current.publish(topic, payload);
      addLog(topic, payload, 'out');
    }
  }, [status, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    state,
    status,
    logs,
    toggleLight,
    setFanMode,
    setLedBrightness,
    setRgbColor,
    toggleLock,
    rawPublish,
    clearLogs
  };
}
