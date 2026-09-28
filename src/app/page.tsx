'use client';

import { useState } from 'react';
import CameraScanner from '@/components/CameraScanner';
import { Trophy, ShieldCheck, Target, Activity, Share2 } from 'lucide-react';

export default function Home() {
  const [report, setReport] = useState<any>(null);

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black -z-10"></div>
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            MAXXING PSL ANALYZER
          </h1>
          <p className="text-zinc-400 text-lg">AI-powered facial aesthetic analysis & ranking</p>
        </header>

        {/* Prize Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-12 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-amber-400 tracking-wide">SEASON 1 CONTEST POOL UNLOCKED</h3>
          </div>
          <p className="text-zinc-300 text-sm mb-4">Cash prizes unlocked at 1,000 verified entries</p>
          
          <div className="flex gap-4 mb-5 text-sm font-semibold">
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300">1st: $100</div>
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-500/20 text-zinc-300">2nd: $80</div>
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-orange-500/20 text-orange-300">3rd: $30</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-amber-400/80">
              <span>742 VERIFIED ENTRIES</span>
              <span>1,000 GOAL</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-amber-500/10">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full w-[74.2%] relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner / Results */}
        {!report ? (
          <CameraScanner onScanComplete={setReport} />
        ) : (
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="bg-emerald-500/10 p-6 flex flex-col items-center border-b border-emerald-500/20">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Entry Verified</h2>
              <p className="text-emerald-400 font-medium">@{report.handle} added to Season 1 Pool</p>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 shrink-0">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl relative group">
                    <img src={report.imageData} alt="Scan" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs text-emerald-400 font-bold tracking-widest mb-1">OVERALL PSL</div>
                      <div className="text-4xl font-black text-white drop-shadow-md">{report.metrics.overall}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <h3 className="text-lg font-bold text-zinc-300 border-b border-zinc-800 pb-2 mb-4">Biometric Breakdown</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-500 text-xs font-bold mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> CANTHAL TILT</div>
                      <div className="text-lg font-semibold text-white">{report.metrics.canthalTilt}</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-500 text-xs font-bold mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> MIDFACE RATIO</div>
                      <div className="text-lg font-semibold text-white">{report.metrics.midface}</div>
                    </div>
                    <div className="col-span-2 bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-500 text-xs font-bold mb-1">FACIAL THIRDS</div>
                      <div className="text-lg font-semibold text-white">{report.metrics.thirds}</div>
                    </div>
                    <div className="col-span-2 bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                      <div className="text-zinc-500 text-xs font-bold mb-1">JAWLINE DEFINITION</div>
                      <div className="text-lg font-semibold text-white">{report.metrics.jawline}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setReport(null)}
                    className="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Share Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
