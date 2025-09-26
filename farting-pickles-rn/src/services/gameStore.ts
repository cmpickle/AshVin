// Core game state management using Zustand
// Replaces the manual state management from the legacy Android version

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, GameSettings, PlayerStats, Achievement } from '../types/game';
import { ACHIEVEMENTS, DEFAULT_GAME_SETTINGS } from '../constants/gameData';

interface GameStore extends GameState {
  // Game state actions
  startGame: (level: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;

  // Score and progress actions
  increaseScore: (points: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;

  // Level management
  unlockLevel: (level: number) => void;
  setCurrentLevel: (level: number) => void;

  // Game mechanics
  playerDied: () => void;
  revivePlayer: () => void;

  // Reset functions
  resetCurrentGame: () => void;
  resetAllProgress: () => void;
}

interface SettingsStore extends GameSettings {
  // Settings actions
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  toggleVibration: () => void;
  toggleMusic: () => void;

  // Reset
  resetSettings: () => void;
}

interface PlayerStore extends PlayerStats {
  // Achievement actions
  checkAchievements: (currentScore: number, totalCoins: number) => Achievement[];
  unlockAchievement: (achievementId: string) => void;

  // Stats actions
  updateHighScore: (score: number) => void;
  incrementGamesPlayed: () => void;
  addTotalCoins: (amount: number) => void;
  unlockLevel: (level: number) => void;

  // Accessory management
  getUnlockedAccessories: () => string[];

  // Reset
  resetPlayerStats: () => void;
}

// Game state store - current game session data
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      isPaused: false,
      score: 0,
      coins: 0,
      level: 0,
      lives: 1,

      // Game control actions
      startGame: (level: number) =>
        set({
          isPlaying: true,
          isPaused: false,
          score: 0,
          coins: 0,
          level,
          lives: 1,
        }),

      pauseGame: () =>
        set((state) => ({
          isPaused: !state.isPlaying ? false : true,
        })),

      resumeGame: () =>
        set((state) => ({
          isPaused: state.isPlaying ? false : state.isPaused,
        })),

      endGame: () =>
        set({
          isPlaying: false,
          isPaused: false,
        }),

      // Score and coins
      increaseScore: (points: number) =>
        set((state) => ({
          score: state.score + points,
        })),

      addCoins: (amount: number) =>
        set((state) => ({
          coins: state.coins + amount,
        })),

      spendCoins: (amount: number) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          return true;
        }
        return false;
      },

      // Level management
      unlockLevel: (level: number) =>
        set((state) => ({
          // This will be handled by the player store, but kept for compatibility
        })),

      setCurrentLevel: (level: number) =>
        set({ level }),

      // Game mechanics
      playerDied: () =>
        set((state) => ({
          lives: Math.max(0, state.lives - 1),
        })),

      revivePlayer: () =>
        set({ lives: 1 }),

      // Reset functions
      resetCurrentGame: () =>
        set({
          isPlaying: false,
          isPaused: false,
          score: 0,
          coins: 0,
          lives: 1,
        }),

      resetAllProgress: () =>
        set({
          isPlaying: false,
          isPaused: false,
          score: 0,
          coins: 0,
          level: 0,
          lives: 1,
        }),
    }),
    {
      name: 'game-state',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields, not the current game state
      partialize: (state) => ({
        level: state.level,
      }),
    }
  )
);

// Settings store - user preferences
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial settings from legacy MainActivity.java
      ...DEFAULT_GAME_SETTINGS,

      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      setVolume: (volume: number) =>
        set({ volume: Math.max(0, Math.min(1, volume)) }),

      toggleVibration: () =>
        set((state) => ({
          vibrationEnabled: !state.vibrationEnabled,
        })),

      toggleMusic: () =>
        set((state) => ({
          musicEnabled: !state.musicEnabled,
        })),

      resetSettings: () =>
        set(DEFAULT_GAME_SETTINGS),
    }),
    {
      name: 'game-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Player stats store - persistent progress data
export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      highScore: 0,
      totalCoins: 0,
      gamesPlayed: 0,
      achievementsUnlocked: [...ACHIEVEMENTS], // Copy the template
      levelsUnlocked: 1, // First level always unlocked

      // Achievement system
      checkAchievements: (currentScore: number, totalCoins: number) => {
        const state = get();
        const newAchievements: Achievement[] = [];

        state.achievementsUnlocked.forEach((achievement) => {
          if (!achievement.unlocked) {
            let shouldUnlock = false;

            switch (achievement.id) {
              case '50_coins':
                shouldUnlock = totalCoins >= 50;
                break;
              case 'bronze':
                shouldUnlock = currentScore >= 10;
                break;
              case 'silver':
                shouldUnlock = currentScore >= 50;
                break;
              case 'gold':
                shouldUnlock = currentScore >= 100;
                break;
              case 'superfart':
                // This will be triggered manually when superfart is used
                break;
            }

            if (shouldUnlock) {
              achievement.unlocked = true;
              newAchievements.push(achievement);
            }
          }
        });

        if (newAchievements.length > 0) {
          set((state) => ({
            achievementsUnlocked: [...state.achievementsUnlocked],
          }));
        }

        return newAchievements;
      },

      unlockAchievement: (achievementId: string) =>
        set((state) => ({
          achievementsUnlocked: state.achievementsUnlocked.map((achievement) =>
            achievement.id === achievementId
              ? { ...achievement, unlocked: true }
              : achievement
          ),
        })),

      // Stats management
      updateHighScore: (score: number) =>
        set((state) => ({
          highScore: Math.max(state.highScore, score),
        })),

      incrementGamesPlayed: () =>
        set((state) => ({
          gamesPlayed: state.gamesPlayed + 1,
        })),

      addTotalCoins: (amount: number) =>
        set((state) => ({
          totalCoins: state.totalCoins + amount,
        })),

      unlockLevel: (level: number) =>
        set((state) => ({
          levelsUnlocked: Math.max(state.levelsUnlocked, level + 1),
        })),

      // Accessory system based on score thresholds
      getUnlockedAccessories: () => {
        const state = get();
        const accessories: string[] = [];

        if (state.highScore >= 20) accessories.push('scumbag');
        if (state.highScore >= 50) accessories.push('sir');
        if (state.highScore >= 100) accessories.push('sunglasses');

        return accessories;
      },

      resetPlayerStats: () =>
        set({
          highScore: 0,
          totalCoins: 0,
          gamesPlayed: 0,
          achievementsUnlocked: [...ACHIEVEMENTS],
          levelsUnlocked: 1,
        }),
    }),
    {
      name: 'player-stats',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);