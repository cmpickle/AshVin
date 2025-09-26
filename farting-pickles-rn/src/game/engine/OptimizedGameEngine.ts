// Optimized Game Engine - High-performance game loop with object pooling
// Advanced performance optimizations for 60fps gameplay

import { Animated, Easing } from 'react-native';

export interface GameEntity {
  id: number;
  type: 'player' | 'obstacle' | 'collectible' | 'effect';
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
  pooled: boolean;
  spriteKey?: string;
  animationFrame?: number;
  rotationSpeed?: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
}

export interface ParticleEffect {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'fart' | 'coin' | 'explosion' | 'trail';
}

export class OptimizedGameEngine {
  private entities: Map<number, GameEntity> = new Map();
  private particles: ParticleEffect[] = [];

  // Object pools for performance
  private obstaclePool: GameEntity[] = [];
  private collectiblePool: GameEntity[] = [];
  private particlePool: ParticleEffect[] = [];

  // Performance tracking
  private frameCount = 0;
  private lastFpsTime = 0;
  private currentFPS = 60;
  private deltaTimeHistory: number[] = [];

  // Animation system
  private animatedValues = new Map<string, Animated.Value>();

  // Game state
  private isRunning = false;
  private isPaused = false;
  private lastUpdateTime = 0;

  // Callbacks
  public onEntitySpawned?: (entity: GameEntity) => void;
  public onEntityRemoved?: (entity: GameEntity) => void;
  public onCollision?: (entity1: GameEntity, entity2: GameEntity) => void;
  public onParticleEffect?: (effect: ParticleEffect) => void;

  constructor() {
    this.initializePools();
    this.initializeAnimations();
  }

  private initializePools(): void {
    // Pre-create obstacle pool
    for (let i = 0; i < 15; i++) {
      this.obstaclePool.push(this.createPooledObstacle());
    }

    // Pre-create collectible pool
    for (let i = 0; i < 10; i++) {
      this.collectiblePool.push(this.createPooledCollectible());
    }

    // Pre-create particle pool
    for (let i = 0; i < 50; i++) {
      this.particlePool.push(this.createPooledParticle());
    }
  }

  private initializeAnimations(): void {
    // Create reusable animated values
    this.animatedValues.set('playerBounce', new Animated.Value(1));
    this.animatedValues.set('coinSpin', new Animated.Value(0));
    this.animatedValues.set('fartPuff', new Animated.Value(0));
    this.animatedValues.set('screenShake', new Animated.Value(0));

    // Start continuous animations
    this.startCoinSpinAnimation();
    this.startPlayerBounceAnimation();
  }

  private startCoinSpinAnimation(): void {
    const coinSpin = this.animatedValues.get('coinSpin')!;

    Animated.loop(
      Animated.timing(coinSpin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }

  private startPlayerBounceAnimation(): void {
    const playerBounce = this.animatedValues.get('playerBounce')!;

    Animated.loop(
      Animated.sequence([
        Animated.timing(playerBounce, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: false,
        }),
        Animated.timing(playerBounce, {
          toValue: 1,
          duration: 500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }

  public update(deltaTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    this.updatePerformanceMetrics(deltaTime);

    // Update entities with optimized batch processing
    this.updateEntities(deltaTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Process collisions with spatial partitioning
    this.processCollisions();

    // Clean up dead entities and particles
    this.cleanup();
  }

  private updatePerformanceMetrics(deltaTime: number): void {
    this.frameCount++;
    this.deltaTimeHistory.push(deltaTime);

    // Keep only last 60 frames for FPS calculation
    if (this.deltaTimeHistory.length > 60) {
      this.deltaTimeHistory.shift();
    }

    // Calculate FPS every second
    const now = Date.now();
    if (now - this.lastFpsTime > 1000) {
      const avgDeltaTime = this.deltaTimeHistory.reduce((sum, dt) => sum + dt, 0) / this.deltaTimeHistory.length;
      this.currentFPS = Math.round(1000 / avgDeltaTime);
      this.lastFpsTime = now;
    }
  }

  private updateEntities(deltaTime: number): void {
    const dt = deltaTime / 1000;

    this.entities.forEach((entity) => {
      if (!entity.active) return;

      // Update position
      entity.x += entity.velocityX * dt * 60; // Scale for 60fps consistency
      entity.y += entity.velocityY * dt * 60;

      // Update rotation if applicable
      if (entity.rotationSpeed) {
        entity.rotation = (entity.rotation || 0) + entity.rotationSpeed * dt;
      }

      // Update animation frame
      if (entity.animationFrame !== undefined) {
        entity.animationFrame += dt * 10; // Animation speed
      }

      // Check if entity is out of bounds
      if (entity.x < -entity.width || entity.x > 1000 || entity.y > 1000) {
        this.removeEntity(entity.id);
      }
    });
  }

  private updateParticles(deltaTime: number): void {
    const dt = deltaTime / 1000;

    this.particles = this.particles.filter(particle => {
      // Update particle physics
      particle.x += particle.velocityX * dt * 60;
      particle.y += particle.velocityY * dt * 60;
      particle.life -= dt;

      // Apply gravity to certain particle types
      if (particle.type === 'fart' || particle.type === 'explosion') {
        particle.velocityY += 200 * dt; // Gravity
      }

      // Fade out over lifetime
      const lifeRatio = particle.life / particle.maxLife;
      if (particle.type === 'fart') {
        particle.size *= 1.02; // Grow slightly
      }

      return particle.life > 0;
    });
  }

  private processCollisions(): void {
    // Spatial partitioning for optimized collision detection
    const cellSize = 100;
    const grid = new Map<string, GameEntity[]>();

    // Populate spatial grid
    this.entities.forEach(entity => {
      if (!entity.active) return;

      const cellX = Math.floor(entity.x / cellSize);
      const cellY = Math.floor(entity.y / cellSize);
      const cellKey = `${cellX},${cellY}`;

      if (!grid.has(cellKey)) {
        grid.set(cellKey, []);
      }
      grid.get(cellKey)!.push(entity);
    });

    // Check collisions only within same cells
    grid.forEach(cellEntities => {
      for (let i = 0; i < cellEntities.length; i++) {
        for (let j = i + 1; j < cellEntities.length; j++) {
          const entity1 = cellEntities[i];
          const entity2 = cellEntities[j];

          if (this.checkCollision(entity1, entity2)) {
            this.onCollision?.(entity1, entity2);
          }
        }
      }
    });
  }

  private checkCollision(entity1: GameEntity, entity2: GameEntity): boolean {
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }

  private cleanup(): void {
    // Return inactive entities to pools
    this.entities.forEach((entity, id) => {
      if (!entity.active) {
        this.returnToPool(entity);
        this.entities.delete(id);
        this.onEntityRemoved?.(entity);
      }
    });
  }

  // Entity management
  public spawnObstacle(x: number, y: number, type: string): GameEntity {
    const entity = this.getFromPool('obstacle') || this.createPooledObstacle();

    entity.x = x;
    entity.y = y;
    entity.velocityX = -200; // Moving left
    entity.velocityY = 0;
    entity.active = true;
    entity.pooled = false;
    entity.spriteKey = type;
    entity.rotation = 0;
    entity.rotationSpeed = type === 'chainsaw' ? 5 : 0; // Spinning chainsaw

    this.entities.set(entity.id, entity);
    this.onEntitySpawned?.(entity);

    return entity;
  }

  public spawnCollectible(x: number, y: number, type: string): GameEntity {
    const entity = this.getFromPool('collectible') || this.createPooledCollectible();

    entity.x = x;
    entity.y = y;
    entity.velocityX = -150; // Slower than obstacles
    entity.velocityY = Math.sin(Date.now() / 1000) * 20; // Gentle floating
    entity.active = true;
    entity.pooled = false;
    entity.spriteKey = type;
    entity.rotation = 0;
    entity.rotationSpeed = type === 'coin' ? 2 : 0; // Spinning coins
    entity.animationFrame = 0;

    this.entities.set(entity.id, entity);
    this.onEntitySpawned?.(entity);

    return entity;
  }

  public spawnParticleEffect(x: number, y: number, type: ParticleEffect['type'], count: number = 5): void {
    for (let i = 0; i < count; i++) {
      const particle = this.getFromParticlePool();
      if (!particle) continue;

      particle.x = x + (Math.random() - 0.5) * 20;
      particle.y = y + (Math.random() - 0.5) * 20;
      particle.velocityX = (Math.random() - 0.5) * 100;
      particle.velocityY = (Math.random() - 0.5) * 100 - 50; // Upward bias
      particle.life = particle.maxLife;
      particle.type = type;

      // Type-specific properties
      switch (type) {
        case 'fart':
          particle.color = `rgba(255, 255, 0, 0.6)`;
          particle.size = 8 + Math.random() * 8;
          particle.maxLife = 0.8;
          break;
        case 'coin':
          particle.color = `rgba(255, 215, 0, 0.8)`;
          particle.size = 4 + Math.random() * 4;
          particle.maxLife = 0.5;
          break;
        case 'explosion':
          particle.color = `rgba(255, 100, 0, 0.9)`;
          particle.size = 6 + Math.random() * 10;
          particle.maxLife = 0.6;
          break;
      }

      this.particles.push(particle);
    }
  }

  // Object pool management
  private getFromPool(type: 'obstacle' | 'collectible'): GameEntity | null {
    const pool = type === 'obstacle' ? this.obstaclePool : this.collectiblePool;
    const entity = pool.find(e => e.pooled);

    if (entity) {
      entity.pooled = false;
      entity.active = true;
    }

    return entity || null;
  }

  private getFromParticlePool(): ParticleEffect | null {
    return this.particlePool.find(p => p.life <= 0) || null;
  }

  private returnToPool(entity: GameEntity): void {
    entity.active = false;
    entity.pooled = true;
    entity.x = -1000; // Move offscreen
    entity.y = -1000;
    entity.velocityX = 0;
    entity.velocityY = 0;
    entity.rotation = 0;
    entity.animationFrame = 0;
  }

  private removeEntity(id: number): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.active = false;
    }
  }

  // Factory methods for pooled entities
  private createPooledObstacle(): GameEntity {
    return {
      id: Math.random() * 1000000,
      type: 'obstacle',
      x: -1000,
      y: -1000,
      width: 32,
      height: 64,
      velocityX: 0,
      velocityY: 0,
      active: false,
      pooled: true,
      rotation: 0,
      scale: 1,
      opacity: 1,
    };
  }

  private createPooledCollectible(): GameEntity {
    return {
      id: Math.random() * 1000000 + 1000000,
      type: 'collectible',
      x: -1000,
      y: -1000,
      width: 24,
      height: 24,
      velocityX: 0,
      velocityY: 0,
      active: false,
      pooled: true,
      rotation: 0,
      scale: 1,
      opacity: 1,
      animationFrame: 0,
    };
  }

  private createPooledParticle(): ParticleEffect {
    return {
      id: Math.random() * 1000000 + 2000000,
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      life: 0,
      maxLife: 1,
      size: 4,
      color: 'rgba(255, 255, 255, 1)',
      type: 'fart',
    };
  }

  // Screen effects
  public triggerScreenShake(intensity: number = 1): void {
    const shakeValue = this.animatedValues.get('screenShake')!;

    Animated.sequence([
      Animated.timing(shakeValue, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeValue, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeValue, {
        toValue: intensity * 0.5,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: false,
      }),
    ]).start();
  }

  public triggerFartEffect(): void {
    const fartPuff = this.animatedValues.get('fartPuff')!;

    fartPuff.setValue(0);
    Animated.timing(fartPuff, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start(() => {
      fartPuff.setValue(0);
    });
  }

  // Control methods
  public start(): void {
    this.isRunning = true;
    this.isPaused = false;
    this.lastUpdateTime = Date.now();
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.lastUpdateTime = Date.now();
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
  }

  public reset(): void {
    this.entities.clear();
    this.particles = [];
    this.frameCount = 0;
    this.deltaTimeHistory = [];
  }

  // Getters
  public getEntities(): GameEntity[] {
    return Array.from(this.entities.values()).filter(e => e.active);
  }

  public getParticles(): ParticleEffect[] {
    return this.particles.filter(p => p.life > 0);
  }

  public getAnimatedValue(key: string): Animated.Value | undefined {
    return this.animatedValues.get(key);
  }

  public getFPS(): number {
    return this.currentFPS;
  }

  public getEntityCount(): number {
    return this.entities.size;
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  // Debug info
  public getDebugInfo(): any {
    return {
      fps: this.currentFPS,
      entities: this.entities.size,
      particles: this.particles.length,
      poolSizes: {
        obstacles: this.obstaclePool.filter(e => e.pooled).length,
        collectibles: this.collectiblePool.filter(e => e.pooled).length,
        particles: this.particlePool.filter(p => p.life <= 0).length,
      },
      running: this.isRunning,
      paused: this.isPaused,
    };
  }
}