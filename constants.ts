import { ImageAsset, Point } from './types';

export const MOCK_IMAGES: ImageAsset[] = [
  { id: 'img_1', name: 'Plage Paradisiaque', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img_2', name: 'Néon City', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img_3', name: 'Forêt Mystique', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img_4', name: 'Montagne enneigée', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img_5', name: 'Chaton mignon', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80' },
];

export const CURVE_PRESETS: Record<string, Point[]> = {
  linear: [
    { x: 0, y: 0.01 }, { x: 0.25, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 0.75, y: 0.75 }, { x: 1, y: 1 }
  ],
  suspense: [
    { x: 0, y: 0.01 }, { x: 0.25, y: 0.02 }, { x: 0.5, y: 0.04 }, { x: 0.75, y: 0.12 }, { x: 1, y: 1 }
  ],
  tortue: [
    { x: 0, y: 0.01 }, 
    { x: 0.8, y: 0.2 }, // 20% des pixels (clarté) mettent 80% du temps
    { x: 1, y: 1 }
  ],
  flash: [
    { x: 0, y: 0.01 }, { x: 0.25, y: 0.5 }, { x: 0.5, y: 0.8 }, { x: 0.75, y: 0.95 }, { x: 1, y: 1 }
  ]
};