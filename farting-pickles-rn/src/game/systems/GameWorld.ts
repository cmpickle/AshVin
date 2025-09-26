// GameWorld - Main game coordinator that ties all systems together
// Replaces the Game.java activity from the legacy Android version

import { GameEngine, GameEngineCallbacks } from '../engine/GameEngine';
import { EntityManager } from './EntityManager';
import { Player } from '../entities/Player';
import { useGameStore, usePlayerStore, useSettingsStore } from '@/services/gameStore';
import { GAME_CONFIG } from '@/constants/gameConfig';
import { GAME_MECHANICS } from '@/constants/gameData';

export interface GameWorldCallbacks {
  onScoreUpdate?: (score: number) => void;
  onCoinCollected?: (coins: number) => void;
  onGameOver?: (finalScore: number, coins: number) => void;
  onAchievementUnlocked?: (achievement: any) => void;
  onLevelComplete?: () => void;
}

export class GameWorld {
  private gameEngine: GameEngine;
  private entityManager: EntityManager;
  private callbacks: GameWorldCallbacks;

  // Game state
  private currentScore: number = 0;
  private currentCoins: number = 0;
  private currentLevel: number = 0;
  private gameOverTriggered: boolean = false;

  // Store references
  private gameStore = useGameStore.getState();
  private playerStore = usePlayerStore.getState();
  private settingsStore = useSettingsStore.getState();

  constructor(callbacks: GameWorldCallbacks = {}) {
    this.callbacks = callbacks;

    // Initialize entity manager
    this.entityManager = new EntityManager();

    // Initialize game engine with callbacks
    const engineCallbacks: GameEngineCallbacks = {
      onUpdate: this.onEngineUpdate.bind(this),
      onRender: this.onEngineRender.bind(this),
      onGameOver: this.onEngineGameOver.bind(this),
      onScoreUpdate: this.onEngineScoreUpdate.bind(this),
      onCoinCollected: this.onEngineCoinCollected.bind(this),
    };

    this.gameEngine = new GameEngine(engineCallbacks);
  }

  // Game control methods
  public startGame(level: number = 0): void {
    this.currentLevel = level;
    this.currentScore = 0;
    this.currentCoins = 0;
    this.gameOverTriggered = false;

    // Update game store
    this.gameStore.startGame(level);

    // Reset entity manager
    this.entityManager.resetGame();

    // Create player
    this.createPlayer();

    // Start game engine
    this.gameEngine.start();
    this.entityManager.startGame();
  }

  public pauseGame(): void {
    this.gameEngine.pause();
    this.entityManager.pauseGame();
    this.gameStore.pauseGame();
  }

  public resumeGame(): void {
    this.gameEngine.resume();
    this.entityManager.resumeGame();
    this.gameStore.resumeGame();
  }

  public endGame(): void {
    this.gameEngine.stop();
    this.gameStore.endGame();

    if (!this.gameOverTriggered) {
      this.triggerGameOver();
    }
  }

  public resetGame(): void {
    this.gameEngine.stop();
    this.entityManager.resetGame();
    this.gameStore.resetCurrentGame();
    this.gameOverTriggered = false;
  }

  // Player creation and setup
  private createPlayer(): void {
    const player = new Player({
      x: GAME_CONFIG.SCREEN_WIDTH * 0.2, // 20% from left edge
      y: GAME_CONFIG.SCREEN_HEIGHT * 0.5, // Middle of screen
    });

    // Set player accessory based on unlocked accessories
    const unlockedAccessories = this.playerStore.getUnlockedAccessories();
    if (unlockedAccessories.length > 0) {
      // Use the highest tier unlocked accessory
      const highestTier = unlockedAccessories[unlockedAccessories.length - 1];
      player.setAccessory(highestTier);
    }

    this.entityManager.addEntity(player);
  }

  // Game engine callbacks
  private onEngineUpdate(deltaTime: number): void {
    // Update all entities
    this.entityManager.update(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Check game over conditions
    this.checkGameOverConditions();

    // Update stores
    this.updateGameStores();
  }

  private onEngineRender(entities: any[]): void {
    // This will be handled by the React Native rendering component
    // The entities are passed to the React component for rendering
  }

  private onEngineGameOver(): void {
    this.triggerGameOver();
  }

  private onEngineScoreUpdate(score: number): void {
    this.currentScore = score;
    this.callbacks.onScoreUpdate?.(score);
  }

  private onEngineCoinCollected(coins: number): void {
    this.currentCoins += coins;
    this.callbacks.onCoinCollected?.(this.currentCoins);
  }

  // Collision detection system
  private checkCollisions(): void {
    const player = this.entityManager.getPlayer();
    if (!player || !player.isActive) return;

    const obstacles = this.entityManager.getEntitiesByType('obstacle');
    const collectibles = this.entityManager.getEntitiesByType('collectible');

    // Player vs Obstacles
    obstacles.forEach(obstacle => {
      if (player.isCollidingWith(obstacle)) {
        this.handlePlayerObstacleCollision(player, obstacle);
      }
    });

    // Player vs Collectibles
    collectibles.forEach(collectible => {
      if (player.isCollidingWith(collectible) && !(collectible as any).collected) {
        this.handlePlayerCollectibleCollision(player, collectible);
      }
    });
  }

  private handlePlayerObstacleCollision(player: Player, obstacle: any): void {
    // Player dies on obstacle collision
    player.onCollision(obstacle);

    // Trigger game over
    this.triggerGameOver();
  }

  private handlePlayerCollectibleCollision(player: Player, collectible: any): void {
    // Collect the item
    collectible.collect();

    // Add to current coins
    this.currentCoins += collectible.getValue();

    // Handle special effects
    if (collectible.hasSpecialEffect()) {
      this.handleSpecialEffect(collectible.getSpecialEffect());
    }

    // Update score
    this.currentScore += collectible.getValue();

    // Trigger callbacks
    this.callbacks.onCoinCollected?.(this.currentCoins);
    this.callbacks.onScoreUpdate?.(this.currentScore);

    // Visual effect
    player.onCollision(collectible);
  }

  private handleSpecialEffect(effect: string): void {
    switch (effect) {
      case 'superfart':
        // Unlock superfart achievement
        this.playerStore.unlockAchievement('superfart');
        break;
      case 'bean_boost':
        // Temporary score multiplier - could be implemented
        break;
    }
  }

  // Game over conditions
  private checkGameOverConditions(): void {
    const player = this.entityManager.getPlayer();

    if (!player || !player.isActive || player.isDead()) {
      this.triggerGameOver();
    }

    // Check if player fell off screen or hit sky
    if (player && (player.isTouchingSky() || player.y > GAME_CONFIG.SCREEN_HEIGHT)) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    if (this.gameOverTriggered) return;

    this.gameOverTriggered = true;

    // Update high score
    this.playerStore.updateHighScore(this.currentScore);
    this.playerStore.addTotalCoins(this.currentCoins);
    this.playerStore.incrementGamesPlayed();

    // Check for new achievements
    const newAchievements = this.playerStore.checkAchievements(
      this.currentScore,
      this.playerStore.totalCoins + this.currentCoins
    );

    // Notify about achievements
    newAchievements.forEach(achievement => {
      this.callbacks.onAchievementUnlocked?.(achievement);
    });

    // Trigger game over callback
    this.callbacks.onGameOver?.(this.currentScore, this.currentCoins);

    // Stop the game
    this.gameEngine.stop();
  }

  // Store updates
  private updateGameStores(): void {
    // Update game store with current progress
    this.gameStore.increaseScore(0); // Score updates happen through callbacks
    this.gameStore.addCoins(0); // Coin updates happen through callbacks
  }

  // Player input handling
  public onPlayerJump(): void {
    const player = this.entityManager.getPlayer();
    if (player && player.isActive) {
      player.requestJump();
    }
  }

  // Getters for current game state
  public getCurrentScore(): number {
    return this.currentScore;
  }

  public getCurrentCoins(): number {
    return this.currentCoins;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public getPlayer(): Player | null {
    return this.entityManager.getPlayer();
  }

  public getAllEntities(): any[] {
    return this.entityManager.getAllEntities();
  }

  public isGameOver(): boolean {
    return this.gameOverTriggered;
  }

  public isPlaying(): boolean {
    return this.gameStore.isPlaying && !this.gameStore.isPaused;
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      gameState: {
        score: this.currentScore,
        coins: this.currentCoins,
        level: this.currentLevel,
        gameOver: this.gameOverTriggered,
      },
      engine: this.gameEngine.getDebugInfo(),
      entities: this.entityManager.getDebugInfo(),
    };
  }

  // Cleanup
  public destroy(): void {
    this.gameEngine.stop();
    this.entityManager.destroy();
  }
}