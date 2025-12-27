import React, { useEffect } from 'react';
import { RefreshCw, Star } from 'lucide-react';

// Declaration for canvas-confetti loaded via CDN
declare const confetti: any;

interface EndScreenProps {
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ onRestart }) => {
  
  useEffect(() => {
    // Launch confetti
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0ea5e9', '#a855f7', '#f43f5e']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0ea5e9', '#a855f7', '#f43f5e']
        });
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 text-center space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
             <div className="bg-yellow-500/20 p-6 rounded-full border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
               <Star size={64} className="text-yellow-400 fill-current animate-bounce" />
             </div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Victoire !
          </h1>
          <p className="text-xl text-slate-400">
            Toutes les images ont été révélées avec succès.
          </p>
        </div>

        <button
          onClick={onRestart}
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-brand-500/50"
        >
          <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
          <span className="font-bold text-xl uppercase tracking-widest">Nouvelle Partie</span>
        </button>
      </div>
    </div>
  );
};