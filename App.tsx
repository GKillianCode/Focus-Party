import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { AppState, GameSettings, ImageAsset, GameMode } from './types';
import { MOCK_IMAGES } from './constants';

const STORAGE_KEY = 'focus_party_v6_settings';

const DEFAULT_SETTINGS: GameSettings = {
  durationSeconds: 30,
  smoothEnabled: false,
  mode: GameMode.FOCUS,
  speedCurve: [
    { x: 0, y: 0.01 },
    { x: 0.8, y: 0.2 },
    { x: 1, y: 1 }
  ]
};

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch(e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [currentImages, setCurrentImages] = useState<ImageAsset[]>(MOCK_IMAGES);
  const [isUsingCustomImages, setIsUsingCustomImages] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleStart = (newSettings: GameSettings, selectedImages: ImageAsset[], useCustom: boolean) => {
    setSettings(newSettings);
    setCurrentImages(selectedImages);
    setIsUsingCustomImages(useCustom);
    setAppState(AppState.GAME);
  };

  const handleGameEnd = () => {
    setAppState(AppState.ENDING);
  };

  const handleRestart = () => {
    setAppState(AppState.START);
  };

  return (
    <div className="antialiased text-slate-200 selection:bg-brand-500/30 font-sans min-h-screen bg-slate-900">
      {appState === AppState.START && (
        <StartScreen 
          onStart={handleStart} 
          initialSettings={settings}
          savedImages={isUsingCustomImages ? currentImages : []}
        />
      )}
      
      {appState === AppState.GAME && (
        <GameScreen 
          settings={settings} 
          images={currentImages}
          onGameEnd={handleGameEnd} 
          onBackToMenu={handleRestart}
          onUpdateSettings={(newS) => setSettings(s => ({...s, ...newS}))}
        />
      )}
      
      {appState === AppState.ENDING && (
        <EndScreen onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;