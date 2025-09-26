// Game data configuration extracted from legacy Android version
import { Achievement, GameLevel } from '@/types/game';
import { IMAGES } from './assets';

// Achievement definitions (from AccomplishmentBox.java)
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: '50_coins',
    name: '50 Coins',
    description: 'Collect 50 coins',
    unlocked: false,
    threshold: 50,
  },
  {
    id: 'superfart',
    name: 'Super Fart',
    description: 'Activate super fart power-up',
    unlocked: false,
  },
  {
    id: 'bronze',
    name: 'Bronze Medal',
    description: 'Score 10 points in a single game',
    unlocked: false,
    threshold: 10,
  },
  {
    id: 'silver',
    name: 'Silver Medal',
    description: 'Score 50 points in a single game',
    unlocked: false,
    threshold: 50,
  },
  {
    id: 'gold',
    name: 'Gold Medal',
    description: 'Score 100 points in a single game',
    unlocked: false,
    threshold: 100,
  },
];

// Game levels configuration
// Based on the original level system and background/foreground combinations
export const GAME_LEVELS: GameLevel[] = [
  {
    id: 0,
    name: 'Level 1',
    background: 'BG00',
    foreground: 'FG00',
    unlocked: true, // First level always unlocked
    obstacles: [],
    collectibles: [],
  },
  {
    id: 1,
    name: 'Level 2',
    background: 'BG01',
    foreground: 'FG01',
    unlocked: false,
    obstacles: [],
    collectibles: [],
  },
  {
    id: 2,
    name: 'Level 3',
    background: 'BG02',
    foreground: 'FG03',
    unlocked: false,
    obstacles: [],
    collectibles: [],
  },
  {
    id: 3,
    name: 'Level 4',
    background: 'BG03',
    foreground: 'FG03',
    unlocked: false,
    obstacles: [],
    collectibles: [],
  },
];

// Obstacle spawn patterns and configurations
// This will be used by the obstacle generation system
export const OBSTACLE_CONFIGS = {
  chainsaw: {
    width: 64,
    height: 64,
    speed: -4,
    spawnWeight: 1,
  },
  knife: {
    width: 32,
    height: 64,
    speed: -4,
    spawnWeight: 1,
  },
  laser: {
    width: 16,
    height: 128,
    speed: -4,
    spawnWeight: 1,
  },
  picklejars: {
    width: 80,
    height: 96,
    speed: -4,
    spawnWeight: 1,
  },
  sun: {
    width: 96,
    height: 96,
    speed: -4,
    spawnWeight: 1,
  },
  surfboard: {
    width: 96,
    height: 32,
    speed: -4,
    spawnWeight: 1,
  },
  woodlog: {
    width: 128,
    height: 32,
    speed: -4,
    spawnWeight: 1,
  },
} as const;

// Collectible configurations
export const COLLECTIBLE_CONFIGS = {
  coin: {
    width: 24,
    height: 24,
    value: 1,
    spawnWeight: 10,
  },
  beans: {
    width: 32,
    height: 32,
    value: 5,
    spawnWeight: 3,
  },
  fart: {
    width: 40,
    height: 40,
    value: 10,
    spawnWeight: 1,
  },
} as const;

// Player character configurations
export const PLAYER_CONFIG = {
  width: 48,
  height: 48,
  jumpPower: -12,
  gravity: 0.8,
  maxFallSpeed: 10,
  startX: 100,
  startY: 200,

  // Accessory unlock thresholds (based on score)
  accessories: {
    scumbag: { unlockScore: 20 },
    sir: { unlockScore: 50 },
    sunglasses: { unlockScore: 100 },
  },
} as const;

// Default game settings (from MainActivity.java)
export const DEFAULT_GAME_SETTINGS = {
  soundEnabled: true,
  volume: 0.3, // DEFAULT_VOLUME from MainActivity
  vibrationEnabled: true,
  musicEnabled: true,
} as const;

// Game mechanics constants
export const GAME_MECHANICS = {
  // From Game.java
  GAMES_PER_AD: 3, // How often ads should show (not applicable for RN version)
  DOUBLE_BACK_TIME: 1000, // Time window for double-back to exit (ms)

  // Spawn rates and timing
  OBSTACLE_SPAWN_INTERVAL: 2000, // ms between obstacle spawns
  COLLECTIBLE_SPAWN_CHANCE: 0.3, // 30% chance to spawn collectible with obstacle

  // Scoring
  POINTS_PER_OBSTACLE: 1,
  COIN_VALUE: 1,
  BEANS_MULTIPLIER: 5,
  FART_BONUS: 10,

  // Physics
  WORLD_SPEED: -200, // pixels per second
  GROUND_HEIGHT_RATIO: 0.2, // 20% of screen for ground
} as const;