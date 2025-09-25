// Game-specific type definitions
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  coins: number;
  level: number;
  lives: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  vibrationEnabled: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  threshold?: number;
}

export interface PlayerStats {
  highScore: number;
  totalCoins: number;
  gamesPlayed: number;
  achievementsUnlocked: Achievement[];
  levelsUnlocked: number;
}

export interface Sprite {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  visible: boolean;
}

export interface Player extends Sprite {
  isJumping: boolean;
  jumpPower: number;
  accessory?: 'scumbag' | 'sir' | 'sunglasses';
}

export interface Obstacle extends Sprite {
  type: 'chainsaw' | 'knife' | 'laser' | 'picklejars' | 'sun' | 'surfboard' | 'woodlog';
  passed: boolean;
}

export interface Collectible extends Sprite {
  type: 'coin' | 'beans' | 'fart';
  collected: boolean;
  value: number;
}

export interface GameLevel {
  id: number;
  name: string;
  background: string;
  foreground: string;
  unlocked: boolean;
  obstacles: Obstacle[];
  collectibles: Collectible[];
}