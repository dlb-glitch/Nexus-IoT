import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { HexagonIcon, ActivityIcon, MailIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/admin-restricted-operation') {
        setError('Google Sign-In is disabled. Please enable it in your Firebase Console > Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
        setLoading(true);
        setError(null);
        await signInAnonymously(auth);
    } catch(err: any) {
        console.error(err);
        if (err.code === 'auth/admin-restricted-operation') {
            setError('Anonymous Sign-In is disabled. Please enable it in your Firebase Console > Authentication > Sign-in method.');
        } else {
            setError(err.message || 'Failed to sign in anonymously');
        }
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 items-center justify-center font-sans selection:bg-sky-500/30">
      <div 
        className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
           <div className="flex items-center gap-3 text-sky-400 font-bold text-3xl tracking-tight">
             <ActivityIcon className="w-10 h-10" />
             <span>Nexus IoT</span>
           </div>
        </div>
        
        <div className="text-center mb-8">
           <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
           <p className="text-slate-400 text-sm">Sign in to access your dashboard configuration and telemetry data.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors border border-slate-700 disabled:opacity-50"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
