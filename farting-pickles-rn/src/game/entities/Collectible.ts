// Collectible entity class - replaces Coin, Beans, Fart classes from legacy Android version
// Handles different types of collectibles with unified behavior

import { BaseEntity, EntityOptions } from './BaseEntity';
import { COLLECTIBLE_CONFIGS, GAME_MECHANICS } from '@/constants/gameData';
import { GAME_CONFIG } from '@/constants/gameConfig';

export type CollectibleType = 'coin' | 'beans' | 'fart';

export interface CollectibleOptions extends EntityOptions {
  collectibleType: CollectibleType;
}

export class Collectible extends BaseEntity {
  public collectibleType: CollectibleType;
  public collected: boolean = false;
  public value: number;

  // Animation properties
  private bobOffset: number = 0;
  private bobSpeed: number = 2;
  private initialY: number;

  // Magnetic collection (for enhanced gameplay)
  private magnetRange: number = 30;
  private isBeingAttracted: boolean = false;

  constructor(options: CollectibleOptions) {
    const config = COLLECTIBLE_CONFIGS[options.collectibleType];

    super('collectible', {
      width: config.width,
      height: config.height,
      speedX: GAME_MECHANICS.WORLD_SPEED / 4, // Slightly slower than obstacles
      speedY: 0,
      ...options,
    });

    this.collectibleType = options.collectibleType;
    this.value = config.value;
    this.initialY = this.y;

    // Set collectible-specific properties
    this.setupCollectibleSpecifics();
  }

  private setupCollectibleSpecifics(): void {
    switch (this.collectibleType) {
      case 'coin':
        this.bobSpeed = 2;
        this.magnetRange = 40;
        break;
      case 'beans':
        this.bobSpeed = 1.5;
        this.magnetRange = 30;
        break;
      case 'fart':
        this.bobSpeed = 3;
        this.magnetRange = 60;
        // Fart powerup has special attraction
        break;
    }
  }

  protected onUpdate(deltaTime: number): void {
    this.updateBobbing(deltaTime);
    this.updateMagneticAttraction();
  }

  // Bobbing animation effect
  private updateBobbing(deltaTime: number): void {
    if (this.collected) return;

    this.bobOffset += this.bobSpeed * (deltaTime / 1000);
    this.y = this.initialY + Math.sin(this.bobOffset) * 3; // 3 pixel bob amplitude
  }

  // Magnetic attraction to player (enhanced gameplay feature)
  private updateMagneticAttraction(): void {
    if (this.collected || this.isBeingAttracted) return;

    // This would need player position - simplified for now
    // In full implementation, this would check distance to player
    // and apply attraction force if within range
  }

  // Collision with player
  public onCollision(other: BaseEntity): void {
    if (other.type === 'player' && !this.collected) {
      this.collect();
    }
  }

  // Collect this item
  public collect(): void {
    if (this.collected) return;

    this.collected = true;
    this.visible = false;

    // Play collection effect
    this.triggerCollectionEffect();

    // Mark for removal (will be removed by game engine)
    this.markForRemoval();
  }

  private triggerCollectionEffect(): void {
    // Visual/audio effect would be triggered here
    // This will be handled by the game engine callbacks
  }

  // Factory method for creating collectibles
  public static createRandom(screenHeight: number, nearObstacle: boolean = false): Collectible {
    const types: CollectibleType[] = Object.keys(COLLECTIBLE_CONFIGS) as CollectibleType[];

    // Weight the random selection based on rarity
    const weightedTypes: CollectibleType[] = [];
    types.forEach(type => {
      const config = COLLECTIBLE_CONFIGS[type];
      for (let i = 0; i < config.spawnWeight; i++) {
        weightedTypes.push(type);
      }
    });

    const randomType = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const config = COLLECTIBLE_CONFIGS[randomType];
    const groundY = screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);

    // Position collectibles in safe areas
    let randomY: number;

    if (nearObstacle) {
      // Place near obstacles but in safe collection zones
      randomY = Math.random() * (groundY - config.height - 100) + 50;
    } else {
      // Free-floating collectible
      const minY = 80;
      const maxY = groundY - config.height - 80;
      randomY = Math.random() * (maxY - minY) + minY;
    }

    return new Collectible({
      collectibleType: randomType,
      x: GAME_CONFIG.SCREEN_WIDTH + Math.random() * 100, // Slight random offset
      y: randomY,
    });
  }

  // Check if collectible is collected
  public isCollected(): boolean {
    return this.collected;
  }

  // Get collectible value
  public getValue(): number {
    return this.value;
  }

  // Special effects for different collectibles
  public hasSpecialEffect(): boolean {
    return this.collectibleType === 'fart' || this.collectibleType === 'beans';
  }

  public getSpecialEffect(): string | null {
    switch (this.collectibleType) {
      case 'fart':
        return 'superfart'; // Triggers superfart achievement
      case 'beans':
        return 'bean_boost'; // Temporary score multiplier
      default:
        return null;
    }
  }

  // Reset collectible state (for object pooling)
  public reset(x: number, y: number, type?: CollectibleType): void {
    if (type) {
      this.collectibleType = type;
      const config = COLLECTIBLE_CONFIGS[type];
      this.width = config.width;
      this.height = config.height;
      this.value = config.value;
      this.setupCollectibleSpecifics();
    }

    this.x = x;
    this.y = y;
    this.initialY = y;
    this.collected = false;
    this.visible = true;
    this.bobOffset = 0;
    this.isBeingAttracted = false;
    this.activate();
    this.markedForRemoval = false;
  }

  public getDebugInfo(): any {
    return {
      ...super.getDebugInfo(),
      collectibleType: this.collectibleType,
      collected: this.collected,
      value: this.value,
      bobOffset: this.bobOffset,
      isBeingAttracted: this.isBeingAttracted,
    };
  }
}