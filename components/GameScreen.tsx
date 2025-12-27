import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameSettings, ImageAsset, Point, GameMode } from '../types';
import { Pause, Play, ChevronLeft, ChevronRight, Settings, X, Sliders, ScanSearch, Grid3X3 } from 'lucide-react';

interface GameScreenProps {
  settings: GameSettings;
  images: ImageAsset[];
  onGameEnd: () => void;
  onBackToMenu: () => void;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  settings, 
  images, 
  onGameEnd, 
  onBackToMenu, 
  onUpdateSettings
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [isImageReady, setIsImageReady] = useState(false);

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  const currentImage = images[currentImageIndex];

  // Image Loader
  useEffect(() => {
    setIsImageReady(false);
    setProgress(0);
    setIsPlaying(false);
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = currentImage.url;
    
    img.decode().then(() => {
      sourceImageRef.current = img;
      setIsImageReady(true);
      render(0);
    }).catch(() => {
      img.onload = () => {
        sourceImageRef.current = img;
        setIsImageReady(true);
        render(0);
      };
    });
  }, [currentImageIndex, currentImage.url]);

  const getVisualProgressFromCurve = (p: number, curve: Point[]) => {
    if (p <= 0) return curve[0].y;
    if (p >= 1) return curve[curve.length - 1].y;
    for (let i = 0; i < curve.length - 1; i++) {
      const p1 = curve[i];
      const p2 = curve[i + 1];
      if (p >= p1.x && p <= p2.x) {
        const t = (p - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
      }
    }
    return p;
  };

  const render = useCallback((currentProgress: number) => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;

    let visualProgress = getVisualProgressFromCurve(currentProgress, settings.speedCurve);
    
    // Seuil de révélation automatique (Focus ou Zoom)
    if (visualProgress > 0.88) {
      visualProgress = 1;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width; canvas.height = img.height;
    }

    if (settings.mode === GameMode.FOCUS) {
      // LOGIQUE PIXEL
      const minRes = 1; 
      const maxRes = img.width;
      
      if (visualProgress >= 1) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return;
      }

      const floatRes = minRes + (maxRes - minRes) * visualProgress;
      const resFloor = Math.max(1, Math.floor(floatRes));
      const ratio = img.height / img.width;
      
      ctx.imageSmoothingEnabled = settings.smoothEnabled;
      const hFloor = Math.max(1, Math.floor(resFloor * ratio));
      
      ctx.drawImage(img, 0, 0, resFloor, hFloor);
      ctx.drawImage(canvas, 0, 0, resFloor, hFloor, 0, 0, canvas.width, canvas.height);
    } else {
      // LOGIQUE ZOOM CENTRAL
      // On commence à un zoom de 10x et on finit à 1x
      const maxZoom = 10;
      const minZoom = 1;
      const currentZoom = maxZoom - (maxZoom - minZoom) * visualProgress;
      
      if (visualProgress >= 1) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return;
      }

      // Calculer la fenêtre source basée sur le zoom
      const sw = img.width / currentZoom;
      const sh = img.height / currentZoom;
      
      // Toujours au centre (0.5, 0.5)
      const currentCenterX = 0.5;
      const currentCenterY = 0.5;

      let sx = (img.width * currentCenterX) - (sw / 2);
      let sy = (img.height * currentCenterY) - (sh / 2);

      // Garder le rectangle dans l'image
      sx = Math.max(0, Math.min(img.width - sw, sx));
      sy = Math.max(0, Math.min(img.height - sh, sy));

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    }
  }, [settings.mode, settings.speedCurve, settings.smoothEnabled]);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== 0) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      setProgress((prev) => {
        let next = prev + (deltaTime / settings.durationSeconds);
        if (next >= 1) {
          next = 1;
          setIsPlaying(false);
        }
        render(next);
        return next;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [settings.durationSeconds, render]);

  useEffect(() => {
    if (isPlaying && progress < 1 && !showSettings) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = 0;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, progress, animate, showSettings]);

  const togglePlay = () => { if (progress < 1) setIsPlaying(!isPlaying); };
  const nextImage = () => { if (currentImageIndex < images.length - 1) setCurrentImageIndex(i => i + 1); else onGameEnd(); };
  const prevImage = () => { if (currentImageIndex > 0) setCurrentImageIndex(i => i - 1); };
  const reveal = () => { setProgress(1); setIsPlaying(false); render(1); };

  useEffect(() => {
    const hk = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showSettings) { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight' && !showSettings) nextImage();
      if (e.code === 'ArrowLeft' && !showSettings) prevImage();
      if (e.code === 'Enter' && !showSettings) reveal();
      if (e.code === 'Escape') { e.preventDefault(); setShowSettings(!showSettings); }
    };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, [progress, isPlaying, currentImageIndex, showSettings, togglePlay, nextImage, prevImage, reveal]);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col overflow-hidden">
      
      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-brand-400 flex items-center gap-3">
                   <Settings size={24} /> RÉGLAGES
                 </h2>
                 <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-slate-800 rounded-full text-slate-500">
                   <X size={28} />
                 </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span>Vitesse (Durée)</span>
                    <span>{settings.durationSeconds}s</span>
                  </div>
                  <input 
                    type="range" min="10" max="120" step="5" value={settings.durationSeconds}
                    onChange={(e) => onUpdateSettings({ durationSeconds: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-brand-500"
                  />
                </div>
                <div className="pt-4 space-y-3">
                   <button onClick={() => setShowSettings(false)} className="w-full py-5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl transition-all shadow-xl">
                     Reprendre
                   </button>
                   <button onClick={onBackToMenu} className="w-full py-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-500 font-bold rounded-2xl transition-all">
                     Quitter le salon
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="z-50 w-full bg-slate-900/95 border-b border-white/5 px-6 py-4 flex items-center gap-8 shadow-xl">
        <button 
          onClick={togglePlay} 
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isPlaying ? 'bg-slate-800 text-brand-400 border border-brand-500/30' : 'bg-brand-600 text-white shadow-[0_0_30px_rgba(14,165,233,0.3)]'
          }`}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-baseline text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
             <div className="flex items-center gap-3">
                <span className="text-white flex items-center gap-2">
                  {settings.mode === GameMode.FOCUS ? <Grid3X3 size={12} /> : <ScanSearch size={12} />}
                  IMAGE {currentImageIndex + 1}/{images.length}
                </span>
                {settings.mode !== GameMode.ZOOM && (
                  <>
                    <span className="opacity-50">•</span>
                    <span>{currentImage.name}</span>
                  </>
                )}
             </div>
             <span className="text-brand-400 font-mono text-xs">{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner relative">
            <div className="bg-brand-500 h-full transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(14,165,233,0.5)]" style={{ width: `${progress * 100}%` }} />
            {isPlaying && <div className="absolute top-0 h-full w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ left: `${progress * 100 - 5}%` }} />}
          </div>
        </div>

        <button onClick={() => setShowSettings(true)} className="p-4 rounded-2xl hover:bg-slate-800 text-slate-400 transition-all border border-transparent hover:border-slate-700">
          <Sliders size={22} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative p-8 bg-slate-950">
        <button onClick={prevImage} disabled={currentImageIndex === 0} className="absolute left-6 z-20 p-5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-0 text-white transition-all"><ChevronLeft size={36} /></button>
        <button onClick={nextImage} className="absolute right-6 z-20 p-5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><ChevronRight size={36} /></button>

        <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 bg-black flex items-center justify-center transition-transform duration-500"
          style={{ width: 'auto', height: 'auto', maxWidth: '85vw', maxHeight: '72vh', aspectRatio: sourceImageRef.current ? `${sourceImageRef.current.width}/${sourceImageRef.current.height}` : '16/9' }}
        >
           {!isImageReady && <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />}
           <canvas 
             ref={canvasRef} 
             className="max-w-full max-h-full w-full h-full object-contain" 
             style={{ imageRendering: settings.mode === GameMode.FOCUS && progress < 1 ? 'pixelated' : 'auto' }} 
           />
           
           {!isPlaying && progress === 0 && isImageReady && (
             <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center animate-fade-in pointer-events-none">
                <div className="flex flex-col items-center gap-4 text-center">
                   <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                      <Play size={40} className="ml-2 text-white fill-current" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase tracking-[0.2em] text-white">Prêt ?</h4>
                      <p className="text-slate-300 text-xs font-medium uppercase tracking-widest opacity-80">Appuyez sur [Espace] pour lancer</p>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
      
      <div className="bg-slate-900/50 backdrop-blur-md px-10 py-4 flex justify-center gap-10 text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black border-t border-white/5">
        <div className="flex items-center gap-2"><span className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">ESPACE</span> PAUSE / PLAY</div>
        <div className="flex items-center gap-2"><span className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">ENTRÉE</span> RÉVÉLER</div>
      </div>
    </div>
  );
};