export enum AppState {
  START = 'START',
  GAME = 'GAME',
  ENDING = 'ENDING',
}

export enum GameMode {
  FOCUS = 'FOCUS',
  ZOOM = 'ZOOM',
}

export interface Point {
  x: number;
  y: number;
}

export interface GameSettings {
  durationSeconds: number;
  smoothEnabled: boolean;
  speedCurve: Point[];
  mode: GameMode;
}

export interface ImageAsset {
  id: string;
  url: string;
  name: string;
}