
import React, { useState } from 'react';
import { GameSettings, ImageAsset, Point, GameMode } from '../types';
import { Play, Image as ImageIcon, Upload, X, Wand2, Zap, CheckCircle2, Turtle, ScanSearch, Grid3X3 } from 'lucide-react';
import { MOCK_IMAGES, CURVE_PRESETS } from '../constants';
import { SpeedGraph } from './SpeedGraph';

interface StartScreenProps {
  onStart: (settings: GameSettings, images: ImageAsset[], useCustom: boolean) => void;
  initialSettings: GameSettings;
  savedImages: ImageAsset[];
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, initialSettings, savedImages }) => {
  const [duration, setDuration] = useState(initialSettings.durationSeconds);
  const [smooth, setSmooth] = useState(initialSettings.smoothEnabled);
  const [curve, setCurve] = useState<Point[]>(initialSettings.speedCurve);
  const [mode, setMode] = useState<GameMode>(initialSettings.mode);
  
  const [customImages, setCustomImages] = useState<ImageAsset[]>(savedImages);
  const [useCustom, setUseCustom] = useState(savedImages.length > 0);

  const applyPreset = (key: string) => {
    if (CURVE_PRESETS[key]) {
      setCurve([...CURVE_PRESETS[key]]);
    }
  };

  // Explicitly casting to File[] to fix type errors for URL.createObjectURL and file.name
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newImages: ImageAsset[] = files.map((file, index) => ({
        id: `custom_${Date.now()}_${index}`,
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setCustomImages(prev => [...prev, ...newImages]);
      setUseCustom(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up py-10">
        
        <div className="lg:col-span-12 text-center space-y-2 mb-4">
          <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-r from-brand-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            Focus Party
          </h1>
          <p className="text-slate-400 text-lg font-medium italic">Préparez vos yeux, le round va commencer.</p>
        </div>

        {/* Sélection du Mode de Jeu */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setMode(GameMode.FOCUS)}
            className={`relative group p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left ${
              mode === GameMode.FOCUS 
              ? 'bg-brand-500/10 border-brand-500 shadow-[0_0_40px_rgba(14,165,233,0.15)]' 
              : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${mode === GameMode.FOCUS ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <Grid3X3 size={32} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-lg">Mode Pixel</h3>
              <p className="text-xs text-slate-400 mt-1">L'image se dévoile d'une mosaïque géante vers la HD.</p>
            </div>
            {mode === GameMode.FOCUS && <div className="absolute top-4 right-4 w-3 h-3 bg-brand-500 rounded-full animate-pulse" />}
          </button>

          <button 
            onClick={() => setMode(GameMode.ZOOM)}
            className={`relative group p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left ${
              mode === GameMode.ZOOM 
              ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.15)]' 
              : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${mode === GameMode.ZOOM ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
              <ScanSearch size={32} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-lg">Mode Zoom</h3>
              <p className="text-xs text-slate-400 mt-1">Un détail macro s'éloigne pour révéler l'ensemble.</p>
            </div>
            {mode === GameMode.ZOOM && <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />}
          </button>
        </div>

        {/* Colonne Gauche : Courbe de progression */}
        <div className="lg:col-span-7 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Courbe de progression</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => applyPreset('linear')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-700">Linéaire</button>
              <button onClick={() => applyPreset('tortue')} className="px-3 py-1.5 bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-brand-500/30 flex items-center gap-1">
                <Turtle size={10} /> Tortue
              </button>
              <button onClick={() => applyPreset('suspense')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-700">Suspense</button>
            </div>
          </div>
          <SpeedGraph points={curve} onChange={setCurve} />
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Durée du round</span>
              <span className="font-mono text-brand-400 text-sm">{duration}s</span>
            </div>
            <input
              type="range" min="10" max="180" step="5" value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        </div>

        {/* Colonne Droite : Images & Start */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 space-y-6 shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Images</h3>
              </div>
              <button 
                onClick={() => setSmooth(!smooth)} 
                title="Lissage du rendu"
                className={`p-2 rounded-xl border transition-all ${smooth ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}
              >
                <Wand2 size={18} />
              </button>
            </div>

            {!useCustom ? (
              <label className="group flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-2xl cursor-pointer transition-all bg-slate-900/30 hover:bg-brand-500/5 p-4 min-h-[10rem]">
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-brand-400 mb-3" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black text-center px-4">Utiliser vos propres photos</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex-1 flex flex-col gap-4 p-4 bg-slate-900 border border-slate-700 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-300">{customImages.length} images prêtes</span>
                  </div>
                  <button onClick={() => {setCustomImages([]); setUseCustom(false);}} className="text-slate-500 hover:text-red-400 transition-colors"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-32 p-1">
                  {customImages.slice(0, 8).map(img => (
                    <div key={img.id} className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-white/5 shadow-lg">
                      <img src={img.url} className="w-full h-full object-cover opacity-60" alt="" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onStart(
                  { durationSeconds: duration, smoothEnabled: smooth, speedCurve: curve, mode }, 
                  useCustom ? customImages : MOCK_IMAGES,
                  useCustom
                );
              }}
              className="w-full mt-6 group flex items-center justify-center gap-4 bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand-500/20 hover:-translate-y-1 active:scale-95"
            >
              <span className="uppercase tracking-[0.3em] text-sm">C'est parti !</span>
              <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
