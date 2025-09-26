// Entity Management System - handles entity lifecycle, pooling, and spawning
// Replaces the manual entity management from the legacy Android GameView

import { BaseEntity } from '../entities/BaseEntity';
import { Player } from '../entities/Player';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { Collectible, CollectibleType } from '../entities/Collectible';
import { GAME_MECHANICS } from '@/constants/gameData';
import { GAME_CONFIG } from '@/constants/gameConfig';

export interface SpawnConfig {
  obstacleSpawnRate: number; // ms between spawns
  collectibleSpawnChance: number; // 0-1 probability
  difficultyMultiplier: number; // increases over time
}

export class EntityManager {
  private entities: Map<string, BaseEntity> = new Map();
  private player: Player | null = null;

  // Object pools for performance
  private obstaclePool: Obstacle[] = [];
  private collectiblePool: Collectible[] = [];

  // Spawning timers
  private lastObstacleSpawn: number = 0;
  private spawnConfig: SpawnConfig = {
    obstacleSpawnRate: GAME_MECHANICS.OBSTACLE_SPAWN_INTERVAL,
    collectibleSpawnChance: GAME_MECHANICS.COLLECTIBLE_SPAWN_CHANCE,
    difficultyMultiplier: 1.0,
  };

  // Game state
  private gameStartTime: number = 0;
  private score: number = 0;

  constructor() {
    this.initializePools();
  }

  // Initialize object pools for better performance
  private initializePools(): void {
    // Pre-create obstacle pool
    for (let i = 0; i < 10; i++) {
      const obstacle = Obstacle.createRandom(GAME_CONFIG.SCREEN_HEIGHT);
      obstacle.deactivate();
      this.obstaclePool.push(obstacle);
    }

    // Pre-create collectible pool
    for (let i = 0; i < 8; i++) {
      const collectible = Collectible.createRandom(GAME_CONFIG.SCREEN_HEIGHT);
      collectible.deactivate();
      this.collectiblePool.push(collectible);
    }
  }

  // Entity lifecycle management
  public addEntity(entity: BaseEntity): void {
    this.entities.set(entity.id, entity);

    // Track player separately for easy access
    if (entity.type === 'player') {
      this.player = entity as Player;
    }
  }

  public removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      // Return to pool if applicable
      this.returnToPool(entity);
      this.entities.delete(id);
    }
  }

  public getEntity(id: string): BaseEntity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): BaseEntity[] {
    return Array.from(this.entities.values());
  }

  public getEntitiesByType(type: string): BaseEntity[] {
    return this.getAllEntities().filter(entity => entity.type === type);
  }

  public getPlayer(): Player | null {
    return this.player;
  }

  // Update all entities
  public update(deltaTime: number): void {
    const currentTime = Date.now();

    // Update all entities
    this.entities.forEach(entity => {
      entity.update(deltaTime);

      // Remove entities marked for removal
      if (entity.isMarkedForRemoval() || entity.isOutOfBounds()) {
        this.removeEntity(entity.id);
      }
    });

    // Handle spawning
    this.updateSpawning(currentTime);

    // Update difficulty
    this.updateDifficulty(currentTime);

    // Check for passed obstacles (scoring)
    this.checkPassedObstacles();
  }

  // Spawning system
  private updateSpawning(currentTime: number): void {
    // Spawn obstacles
    if (currentTime - this.lastObstacleSpawn >= this.spawnConfig.obstacleSpawnRate) {
      this.spawnObstacle();
      this.lastObstacleSpawn = currentTime;

      // Maybe spawn a collectible with this obstacle
      if (Math.random() < this.spawnConfig.collectibleSpawnChance) {
        this.spawnCollectible(true);
      }
    }
  }

  // Spawn obstacle from pool or create new
  public spawnObstacle(type?: ObstacleType): Obstacle {
    let obstacle = this.getFromPool('obstacle') as Obstacle;

    if (!obstacle) {
      obstacle = Obstacle.createRandom(GAME_CONFIG.SCREEN_HEIGHT);
    } else {
      // Reset pooled obstacle
      const newType = type || this.getRandomObstacleType();
      const randomY = this.getRandomObstacleY();
      obstacle.obstacleType = newType;
      obstacle.setPosition(GAME_CONFIG.SCREEN_WIDTH + 50, randomY);
      obstacle.resetPassed();
      obstacle.activate();
    }

    this.addEntity(obstacle);
    return obstacle;
  }

  // Spawn collectible from pool or create new
  public spawnCollectible(nearObstacle: boolean = false, type?: CollectibleType): Collectible {
    let collectible = this.getFromPool('collectible') as Collectible;

    if (!collectible) {
      collectible = Collectible.createRandom(GAME_CONFIG.SCREEN_HEIGHT, nearObstacle);
    } else {
      // Reset pooled collectible
      const newType = type || this.getRandomCollectibleType();
      const randomY = this.getRandomCollectibleY();
      collectible.reset(GAME_CONFIG.SCREEN_WIDTH + 100, randomY, newType);
    }

    this.addEntity(collectible);
    return collectible;
  }

  // Object pool management
  private getFromPool(type: 'obstacle' | 'collectible'): BaseEntity | null {
    const pool = type === 'obstacle' ? this.obstaclePool : this.collectiblePool;
    const entity = pool.find(item => !item.isActive);

    if (entity) {
      entity.activate();
      entity.markedForRemoval = false;
      return entity;
    }

    return null;
  }

  private returnToPool(entity: BaseEntity): void {
    entity.deactivate();

    if (entity.type === 'obstacle' && this.obstaclePool.length < 15) {
      this.obstaclePool.push(entity as Obstacle);
    } else if (entity.type === 'collectible' && this.collectiblePool.length < 12) {
      this.collectiblePool.push(entity as Collectible);
    }
  }

  // Difficulty scaling over time
  private updateDifficulty(currentTime: number): void {
    if (this.gameStartTime === 0) {
      this.gameStartTime = currentTime;
      return;
    }

    const gameTime = (currentTime - this.gameStartTime) / 1000; // seconds

    // Increase difficulty every 30 seconds
    const difficultyLevel = Math.floor(gameTime / 30) + 1;
    this.spawnConfig.difficultyMultiplier = Math.min(3.0, 1.0 + (difficultyLevel * 0.2));

    // Decrease spawn interval (increase spawn rate)
    this.spawnConfig.obstacleSpawnRate = Math.max(
      800, // Minimum 800ms between spawns
      GAME_MECHANICS.OBSTACLE_SPAWN_INTERVAL / this.spawnConfig.difficultyMultiplier
    );

    // Increase collectible spawn chance slightly
    this.spawnConfig.collectibleSpawnChance = Math.min(
      0.5,
      GAME_MECHANICS.COLLECTIBLE_SPAWN_CHANCE + (difficultyLevel * 0.05)
    );
  }

  // Scoring system
  private checkPassedObstacles(): void {
    const obstacles = this.getEntitiesByType('obstacle') as Obstacle[];

    obstacles.forEach(obstacle => {
      if (!obstacle.hasPassed() && obstacle.x + obstacle.width < (this.player?.x || 0)) {
        obstacle.resetPassed();
        obstacle.passed = true;
        this.score += GAME_MECHANICS.POINTS_PER_OBSTACLE;
      }
    });
  }

  // Helper methods for random generation
  private getRandomObstacleType(): ObstacleType {
    const types: ObstacleType[] = ['chainsaw', 'knife', 'laser', 'picklejars', 'sun', 'surfboard', 'woodlog'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomCollectibleType(): CollectibleType {
    const types: CollectibleType[] = ['coin', 'beans', 'fart'];
    // Weighted random selection
    const weights = [10, 3, 1]; // coin is most common, fart is rarest
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (let i = 0; i < types.length; i++) {
      currentWeight += weights[i];
      if (random <= currentWeight) {
        return types[i];
      }
    }

    return 'coin'; // fallback
  }

  private getRandomObstacleY(): number {
    const groundY = GAME_CONFIG.SCREEN_HEIGHT * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);
    const minY = 50;
    const maxY = groundY - 100;
    return Math.random() * (maxY - minY) + minY;
  }

  private getRandomCollectibleY(): number {
    const groundY = GAME_CONFIG.SCREEN_HEIGHT * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);
    const minY = 80;
    const maxY = groundY - 80;
    return Math.random() * (maxY - minY) + minY;
  }

  // Game control methods
  public startGame(): void {
    this.gameStartTime = Date.now();
    this.score = 0;
    this.lastObstacleSpawn = 0;
    this.spawnConfig.difficultyMultiplier = 1.0;
  }

  public pauseGame(): void {
    // Pause all entity updates
    this.entities.forEach(entity => entity.deactivate());
  }

  public resumeGame(): void {
    // Resume all entity updates
    this.entities.forEach(entity => entity.activate());
    this.gameStartTime = Date.now() - ((this.score / GAME_MECHANICS.POINTS_PER_OBSTACLE) * 2000); // Approximate resume
  }

  public resetGame(): void {
    // Clear all entities except player
    this.entities.forEach((entity, id) => {
      if (entity.type !== 'player') {
        this.removeEntity(id);
      }
    });

    // Reset player
    if (this.player) {
      this.player.reset();
    }

    // Reset game state
    this.gameStartTime = 0;
    this.score = 0;
    this.lastObstacleSpawn = 0;
    this.spawnConfig.difficultyMultiplier = 1.0;
  }

  // Cleanup
  public destroy(): void {
    this.entities.clear();
    this.obstaclePool = [];
    this.collectiblePool = [];
    this.player = null;
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      entityCount: this.entities.size,
      poolSizes: {
        obstacles: this.obstaclePool.length,
        collectibles: this.collectiblePool.length,
      },
      spawnConfig: this.spawnConfig,
      score: this.score,
      gameTime: this.gameStartTime ? (Date.now() - this.gameStartTime) / 1000 : 0,
    };
  }
}