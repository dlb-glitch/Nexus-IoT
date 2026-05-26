/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/MainLayout';
import { IoTProvider } from './components/IoTProvider';
import { Auth } from './components/Auth';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ActivityIcon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Set to false so it won't block render
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimeout(true);
      setLoading(false); // Force exit loading state after timeout to allow login page
    }, 5000);

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        clearTimeout(timer);
        setUser(currentUser);
        setLoading(false);
      }, (error) => {
        clearTimeout(timer);
        console.error("Auth state error:", error);
        setLoading(false);
      });
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    } catch (e) {
      clearTimeout(timer);
      console.error("Failed to initialize auth state listener", e);
      setLoading(false);
    }
  }, []);

  if (!user) {
    return <Auth />;
  }

  return (
    <IoTProvider>
      <MainLayout />
    </IoTProvider>
  );
}


