// Game configuration constants migrated from legacy Android version

export const GAME_CONFIG = {
  // Physics constants
  GRAVITY: 0.8,
  JUMP_POWER: -12,
  PLAYER_SPEED: 3,
  OBSTACLE_SPEED: -4,
  PLAYER_START_X: 100,

  // Achievement thresholds (from AccomplishmentBox.java)
  BRONZE_POINTS: 10,
  SILVER_POINTS: 50,
  GOLD_POINTS: 100,

  // Audio settings
  DEFAULT_VOLUME: 0.3,

  // Game mechanics
  COLLISION_TOLERANCE: 25, // pixels
  FRAME_RATE: 60,

  // Screen dimensions (will be set dynamically)
  SCREEN_WIDTH: 0,
  SCREEN_HEIGHT: 0,
  GROUND_HEIGHT_RATIO: 0.2, // 20% of screen height for ground
} as const;

export const ACHIEVEMENT_IDS = {
  COINS_50: '50_coins',
  SUPER_FART: 'superfart',
  BRONZE_MEDAL: 'bronze',
  SILVER_MEDAL: 'silver',
  GOLD_MEDAL: 'gold',
} as const;

export const OBSTACLE_TYPES = [
  'chainsaw',
  'knife',
  'laser',
  'picklejars',
  'sun',
  'surfboard',
  'woodlog',
] as const;

export const COLLECTIBLE_TYPES = [
  'coin',
  'beans',
  'fart',
] as const;

export const ACCESSORY_TYPES = [
  'scumbag',
  'sir',
  'sunglasses',
] as const;

export const ASSET_PATHS = {
  // Player sprites
  PLAYER: {
    PICKLE: 'pickle.png',
    FART_PICKLE: 'fart_pickle.png',
    ACCESSORIES: {
      SCUMBAG: 'accessory_scumbag.png',
      SIR: 'accessory_sir.png',
      SUNGLASSES: 'accessory_sunglasses.png',
    },
  },

  // Obstacle sprites
  OBSTACLES: {
    CHAINSAW: 'chainsaw.png',
    KNIFE: 'knife.png',
    LASER: 'laser.png',
    PICKLE_JARS: 'pickle_jars.png',
    SUN: 'sunbeam.png',
    SURFBOARD: 'surfboard.png',
    WOOD_LOG: 'log_full.png',
  },

  // Collectible sprites
  COLLECTIBLES: {
    COIN: 'coin.png',
    BEANS: 'beans.png',
    FART: 'fart.png',
  },

  // Background and environment
  BACKGROUNDS: {
    BG00: 'bg00.png',
    BG01: 'bg01.png',
    BG02: 'bg02.png',
    BG03: 'bg03.png',
  },

  FOREGROUNDS: {
    FG00: 'fg00.png',
    FG01: 'fg01.png',
    FG03: 'fg03.png',
  },

  // UI elements
  UI: {
    PLAY_BUTTON: 'play_button.png',
    PAUSE_BUTTON: 'pause_button.png',
    MEDALS: {
      BRONZE: 'bronce.png',
      SILVER: 'silver.png',
      GOLD: 'gold.png',
    },
    SOCKET: 'socket.png',
    SPEAKER: 'speaker.png',
    TUTORIAL: 'tutorial.png',
    SPLASH: 'splash.png',
  },
} as const;

export const SOUND_PATHS = {
  BACKGROUND_MUSIC: 'songfart.mp3',
  FART_SOUNDS: [
    'fart0.wav',
    'fart1.wav',
    'fart2.wav',
    'fart3.wav',
  ],
  COIN: 'coin.ogg',
  CRASH: 'crash.wav',
  BELCH: 'belch.mp3',
} as const;