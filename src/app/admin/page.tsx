'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, MapPin, Globe, Clock, ShieldAlert } from 'lucide-react';

export default function AdminPortal() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.submissions || []);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch admin data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    const interval = setInterval(fetchEntries, 2500);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="text-emerald-500 w-6 h-6" />
              MAXXING ADMIN
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Total Verified Applicants: <span className="text-white font-bold">{entries.length}</span></p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full border border-emerald-500/20">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Auto-Refresh (2.5s)</span>
            </div>
            
            <button 
              onClick={fetchEntries}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="grid gap-4">
          {entries.length === 0 && !loading && (
            <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 font-medium">No verified entries yet.</p>
            </div>
          )}
          
          {entries.map(entry => (
            <div key={entry.id} className="bg-zinc-900 hover:bg-zinc-800/80 transition-colors border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6">
              
              <img 
                src={entry.image_data} 
                alt={entry.handle} 
                className="w-16 h-16 rounded-xl object-cover border border-zinc-700 shadow-md shrink-0" 
              />
              
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-lg">@{entry.handle}</span>
                    <span className="text-zinc-600 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-white font-medium text-sm flex items-center gap-2">
                    PSL Rating: <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-bold">{entry.score.toFixed(1)} / 10</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {entry.latitude && entry.longitude ? (
                    <a 
                      href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 px-3 py-2 rounded-xl hover:bg-emerald-900/40 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <div className="text-xs text-left">
                        <div className="font-bold uppercase tracking-wider text-[10px] text-emerald-500/80">GPS Verified</div>
                        <div className="truncate max-w-[150px]">{entry.city} / {entry.region}</div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-900/30 text-amber-400 px-3 py-2 rounded-xl">
                      <Globe className="w-4 h-4 text-amber-500/80" />
                      <div className="text-xs text-left">
                        <div className="font-bold uppercase tracking-wider text-[10px] text-amber-500/60">IP Only</div>
                        <div className="truncate max-w-[150px]">{entry.ip_address} • {entry.city}</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
