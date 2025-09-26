// Asset management for Farting Pickles React Native
// This replaces the hardcoded asset paths from the Android version

export const IMAGES = {
  // Characters
  CHARACTERS: {
    PICKLE: require('../assets/images/characters/pickle.png'),
    FART_PICKLE: require('../assets/images/characters/fart_pickle.png'),
    ACCESSORIES: {
      SCUMBAG: require('../assets/images/characters/accessory_scumbag.png'),
      SIR: require('../assets/images/characters/accessory_sir.png'),
      SUNGLASSES: require('../assets/images/characters/accessory_sunglasses.png'),
    },
  },

  // Obstacles
  OBSTACLES: {
    CHAINSAW: require('../assets/images/obstacles/chainsaw.png'),
    KNIFE: require('../assets/images/obstacles/knife.png'),
    LASER: require('../assets/images/obstacles/laser.png'),
    PICKLE_JARS: require('../assets/images/obstacles/pickle_jars.png'),
    SUN: require('../assets/images/obstacles/sunbeam.png'),
    SURFBOARD: require('../assets/images/obstacles/surfboard.png'),
    WOOD_LOG: require('../assets/images/obstacles/log_full.png'),
  },

  // Collectibles
  COLLECTIBLES: {
    COIN: require('../assets/images/collectibles/coin.png'),
    BEANS: require('../assets/images/collectibles/beans.png'),
    FART: require('../assets/images/collectibles/fart.png'),
  },

  // Backgrounds and environment
  BACKGROUNDS: {
    BG00: require('../assets/images/backgrounds/bg00.png'),
    BG01: require('../assets/images/backgrounds/bg01.png'),
    BG02: require('../assets/images/backgrounds/bg02.png'),
    BG03: require('../assets/images/backgrounds/bg03.png'),
  },

  FOREGROUNDS: {
    FG00: require('../assets/images/backgrounds/fg00.png'),
    FG000: require('../assets/images/backgrounds/fg000.png'),
    FG01: require('../assets/images/backgrounds/fg01.png'),
    FG03: require('../assets/images/backgrounds/fg03.png'),
  },

  // UI Elements
  UI: {
    PLAY_BUTTON: require('../assets/images/ui/play_button.png'),
    PAUSE_BUTTON: require('../assets/images/ui/pause_button.png'),
    MEDALS: {
      BRONZE: require('../assets/images/ui/bronce.png'),
      SILVER: require('../assets/images/ui/silver.png'),
      GOLD: require('../assets/images/ui/gold.png'),
    },
    SOCKET: require('../assets/images/ui/socket.png'),
    SPEAKER: require('../assets/images/ui/speaker.png'),
    TUTORIAL: require('../assets/images/ui/tutorial.png'),
    SPLASH: require('../assets/images/ui/splash.png'),
  },
} as const;

export const SOUNDS = {
  BACKGROUND_MUSIC: require('../assets/sounds/songfart.mp3'),
  FART_SOUNDS: [
    require('../assets/sounds/fart0.wav'),
    require('../assets/sounds/fart1.wav'),
    require('../assets/sounds/fart2.wav'),
    require('../assets/sounds/fart3.wav'),
  ],
  COIN: require('../assets/sounds/coin.ogg'),
  CRASH: require('../assets/sounds/crash.wav'),
  BELCH: require('../assets/sounds/belch.mp3'),
} as const;

// Helper type for accessing nested asset objects
export type ImageAssets = typeof IMAGES;
export type SoundAssets = typeof SOUNDS;