import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Point } from '../types';

interface SpeedGraphProps {
  points: Point[];
  onChange: (points: Point[]) => void;
}

export const SpeedGraph: React.FC<SpeedGraphProps> = ({ points, onChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const getCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): Point | null => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (draggingIdx === null) return;
    const coords = getCoords(e);
    if (!coords) return;

    const newPoints = [...points];
    
    // Extrémités : seulement modifiable sur Y (clarté)
    if (draggingIdx === 0 || draggingIdx === points.length - 1) {
      newPoints[draggingIdx] = { ...newPoints[draggingIdx], y: coords.y };
    } else {
      // Points du milieu : modifiables X et Y avec contraintes d'ordre
      const minX = points[draggingIdx - 1].x + 0.02;
      const maxX = points[draggingIdx + 1].x - 0.02;
      newPoints[draggingIdx] = {
        x: Math.max(minX, Math.min(maxX, coords.x)),
        y: coords.y
      };
    }
    onChange(newPoints);
  }, [draggingIdx, points, onChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  useEffect(() => {
    if (draggingIdx !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingIdx, handleMouseMove, handleMouseUp]);

  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x * 200} ${(1 - p.y) * 100}`
  ).join(' ');

  return (
    <div className="space-y-2 select-none">
      <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500">
        <span>Flou</span>
        <span>Temps →</span>
        <span>Net</span>
      </div>
      <div className="relative h-44 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner cursor-crosshair">
        <svg 
          ref={svgRef} 
          viewBox="0 0 200 100" 
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grille */}
          <line x1="0" y1="50" x2="200" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="100" y1="0" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
          
          <path 
            d={pathData} 
            fill="none" 
            stroke="url(#grad)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x * 200}
              cy={(1 - p.y) * 100}
              r={draggingIdx === i ? "8" : "6"}
              className={`${i === 0 || i === points.length - 1 ? 'fill-slate-600' : 'fill-white stroke-brand-500 stroke-2'} cursor-grab active:cursor-grabbing transition-all hover:r-8`}
              onMouseDown={(e) => { e.preventDefault(); setDraggingIdx(i); }}
              onTouchStart={(e) => { e.preventDefault(); setDraggingIdx(i); }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};