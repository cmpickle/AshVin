// Core game engine - replaces the GameView rendering loop from Android version
// Manages game loop, entity updates, and rendering coordination

import { Dimensions } from 'react-native';
import { GAME_CONFIG } from '../../constants/gameConfig';

export interface GameEngineCallbacks {
  onUpdate?: (deltaTime: number) => void;
  onRender?: (entities: any[]) => void;
  onGameOver?: () => void;
  onScoreUpdate?: (score: number) => void;
  onCoinCollected?: (coins: number) => void;
}

export class GameEngine {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private callbacks: GameEngineCallbacks = {};

  // Screen dimensions
  public screenWidth: number;
  public screenHeight: number;

  // Game timing
  private targetFPS: number = GAME_CONFIG.FRAME_RATE;
  private frameInterval: number = 1000 / this.targetFPS;

  // Entity management
  private entities: Map<string, any> = new Map();
  private entitiesToAdd: any[] = [];
  private entitiesToRemove: string[] = [];

  constructor(callbacks?: GameEngineCallbacks) {
    const { width, height } = Dimensions.get('window');
    this.screenWidth = width;
    this.screenHeight = height;
    this.callbacks = callbacks || {};

    // Update screen dimensions in game config
    GAME_CONFIG.SCREEN_WIDTH = width;
    GAME_CONFIG.SCREEN_HEIGHT = height;
  }

  // Game loop control
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = Date.now();
    this.gameLoop();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = Date.now(); // Reset timer to avoid large deltaTime
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Clear all entities
    this.entities.clear();
    this.entitiesToAdd = [];
    this.entitiesToRemove = [];
  }

  // Main game loop - equivalent to the Android GameView's drawing loop
  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTime;

    // Cap deltaTime to prevent huge jumps when returning from background
    const cappedDeltaTime = Math.min(deltaTime, 1000 / 30); // Max 30fps minimum

    if (!this.isPaused && deltaTime >= this.frameInterval) {
      // Update game logic
      this.update(cappedDeltaTime);

      // Render frame
      this.render();

      this.lastTime = currentTime;
    }

    // Continue the loop
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  // Update all entities and game logic
  private update(deltaTime: number): void {
    // Add pending entities
    this.entitiesToAdd.forEach(entity => {
      this.entities.set(entity.id, entity);
    });
    this.entitiesToAdd = [];

    // Remove marked entities
    this.entitiesToRemove.forEach(id => {
      this.entities.delete(id);
    });
    this.entitiesToRemove = [];

    // Update all entities
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(deltaTime);
      }

      // Remove entities that are out of bounds
      if (entity.isOutOfBounds && entity.isOutOfBounds()) {
        this.removeEntity(entity.id);
      }
    });

    // Call update callback
    this.callbacks.onUpdate?.(deltaTime);
  }

  // Render all entities
  private render(): void {
    const entityList = Array.from(this.entities.values());
    this.callbacks.onRender?.(entityList);
  }

  // Entity management
  addEntity(entity: any): void {
    this.entitiesToAdd.push(entity);
  }

  removeEntity(id: string): void {
    if (!this.entitiesToRemove.includes(id)) {
      this.entitiesToRemove.push(id);
    }
  }

  getEntity(id: string): any {
    return this.entities.get(id);
  }

  getAllEntities(): any[] {
    return Array.from(this.entities.values());
  }

  getEntitiesByType(type: string): any[] {
    return Array.from(this.entities.values()).filter(entity => entity.type === type);
  }

  // Collision detection system
  checkCollisions(): void {
    const players = this.getEntitiesByType('player');
    const obstacles = this.getEntitiesByType('obstacle');
    const collectibles = this.getEntitiesByType('collectible');

    players.forEach(player => {
      // Check player vs obstacles
      obstacles.forEach(obstacle => {
        if (this.isColliding(player, obstacle)) {
          player.onCollision?.(obstacle);
          obstacle.onCollision?.(player);
        }
      });

      // Check player vs collectibles
      collectibles.forEach(collectible => {
        if (this.isColliding(player, collectible)) {
          player.onCollision?.(collectible);
          collectible.onCollision?.(player);

          // Remove collected items
          if (collectible.collected) {
            this.removeEntity(collectible.id);
          }
        }
      });
    });
  }

  // Simple AABB collision detection (from legacy Sprite.java)
  private isColliding(entity1: any, entity2: any): boolean {
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }

  // Utility methods
  getScreenBounds() {
    return {
      width: this.screenWidth,
      height: this.screenHeight,
      groundY: this.screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO),
    };
  }

  // Event triggers
  triggerGameOver(): void {
    this.callbacks.onGameOver?.();
  }

  triggerScoreUpdate(score: number): void {
    this.callbacks.onScoreUpdate?.(score);
  }

  triggerCoinCollected(coins: number): void {
    this.callbacks.onCoinCollected?.(coins);
  }

  // Debug information
  getDebugInfo() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      entityCount: this.entities.size,
      screenDimensions: {
        width: this.screenWidth,
        height: this.screenHeight,
      },
    };
  }
}