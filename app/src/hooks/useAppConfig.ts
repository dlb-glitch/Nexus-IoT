import { useState, useEffect, useRef } from 'react';
import { MqttConfig, ThemeConfig, WidgetConfig } from '../types';
import { Layout } from 'react-grid-layout';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const CONFIG_KEY = 'iot_mqtt_config_v4';
const THEME_KEY = 'iot_theme_config';
const WIDGETS_KEY = 'iot_widgets_v3';
const LAYOUTS_KEY = 'iot_layouts_v3';

const defaultMqtt: MqttConfig = {
  url: (import.meta as any).env?.VITE_MQTT_BROKER_URL || 'wss://fb23a06e795b40dd853b16efcbb94481.s1.eu.hivemq.cloud:8884/mqtt',
  username: (import.meta as any).env?.VITE_MQTT_USERNAME || '',
  password: (import.meta as any).env?.VITE_MQTT_PASSWORD || ''
};

const defaultTheme: ThemeConfig = {
  colorSchema: 'sky'
};

const defaultWidgets: WidgetConfig[] = [
  { id: 'w1', type: 'stat', title: 'Temperature (DHT22)', sensorKey: 'temperature', unit: '°C' },
  { id: 'w2', type: 'stat', title: 'Humidity (DHT22)', sensorKey: 'humidity', unit: '%' },
  { id: 'w3', type: 'stat', title: 'Gas Target (MQ-9)', sensorKey: 'gasLevel', unit: 'PPM' },
  { id: 'w4', type: 'stat', title: 'Voltage (ZMPT101B)', sensorKey: 'voltage', unit: 'V' },
  { id: 'sm1', type: 'sensor_boolean', title: 'Motion Sensor', sensorKey: 'motion' },
  { id: 'sm2', type: 'sensor_boolean', title: 'Door Sensor', sensorKey: 'doorOpen' },
  { id: 'wt1', type: 'gauge', title: 'Temperature Speed', sensorKey: 'temperature', unit: '°C' },
  { id: 'w5', type: 'chart', title: 'Real-time Telemetry' },
  { id: 'wl', type: 'control_light', title: 'Light Control' },
  { id: 'wrgb', type: 'control_rgb', title: 'RGB Control' },
  { id: 'wlk', type: 'control_lock', title: 'Smart Lock' },
  { id: 'wf', type: 'control_fan', title: 'Fan Control' },
  { id: 'wd', type: 'control_dimmer', title: 'LED Dimmer' }
];

const defaultLayouts: { [key: string]: Layout } = {
  lg: [
    { i: 'w1', x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3, maxH: 6 },
    { i: 'w2', x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 3, maxH: 6 },
    { i: 'w3', x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 3, maxH: 6 },
    { i: 'w4', x: 9, y: 0, w: 3, h: 4, minW: 2, minH: 3, maxH: 6 },
    { i: 'wt1', x: 0, y: 4, w: 4, h: 5, minW: 3, minH: 4, maxH: 8, maxW: 8 },
    { i: 'sm1', x: 4, y: 4, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'sm2', x: 7, y: 4, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'wl', x: 9, y: 4, w: 3, h: 3, minW: 2, minH: 2, maxH: 5 },
    { i: 'wrgb', x: 9, y: 7, w: 3, h: 4, minW: 3, minH: 4, maxH: 6 },
    { i: 'wlk', x: 9, y: 11, w: 3, h: 3, minW: 2, minH: 3, maxH: 5 },
    { i: 'wd', x: 6, y: 9, w: 3, h: 4, minW: 2, minH: 3, maxH: 6 },
    { i: 'wf', x: 6, y: 13, w: 3, h: 4, minW: 2, minH: 3, maxH: 6 },
    { i: 'w5', x: 0, y: 9, w: 6, h: 10, minW: 4, minH: 8 },
  ]
};

export function useAppConfig() {
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : defaultMqtt;
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem(WIDGETS_KEY);
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  const [layouts, setLayouts] = useState<{ [key: string]: Layout }>(() => {
    const saved = localStorage.getItem(LAYOUTS_KEY);
    return saved ? JSON.parse(saved) : defaultLayouts;
  });

  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const initialLoadDone = useRef(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(mqttConfig));
    localStorage.setItem(THEME_KEY, JSON.stringify(themeConfig));
    localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgets));
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
  }, [mqttConfig, themeConfig, widgets, layouts]);

  // Read initial from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/dashboard_config/main`;

    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'dashboard_config', 'main');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.widgets) setWidgets(data.widgets);
          if (data.layouts) setLayouts(data.layouts);
          if (data.theme) setThemeConfig(data.theme);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      } finally {
        setFirebaseLoaded(true);
        initialLoadDone.current = true;
      }
    };
    fetchConfig();
  }, [auth.currentUser]);

  // Write changes to Firebase (debounced sort of, or just on change after load)
  useEffect(() => {
    if (!auth.currentUser || !firebaseLoaded || !initialLoadDone.current) return;
    const userId = auth.currentUser.uid;

    const timer = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', userId, 'dashboard_config', 'main');
        
        // Strip out undefined values to prevent Firestore validation errors
        const cleanData = JSON.parse(JSON.stringify({
          userId,
          layouts,
          widgets,
          theme: themeConfig
        }));

        await setDoc(docRef, {
          ...cleanData,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/dashboard_config/main`);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [layouts, widgets, themeConfig, firebaseLoaded]);

  return {
    mqttConfig,
    setMqttConfig,
    themeConfig,
    setThemeConfig,
    widgets,
    setWidgets,
    layouts,
    setLayouts
  };
}
