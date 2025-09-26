// Obstacle entity class - replaces various Obstacle classes from legacy Android version
// Handles different types of obstacles with unified behavior

import { BaseEntity, EntityOptions } from './BaseEntity';
import { OBSTACLE_CONFIGS } from '@/constants/gameData';
import { GAME_CONFIG } from '@/constants/gameConfig';

export type ObstacleType = 'chainsaw' | 'knife' | 'laser' | 'picklejars' | 'sun' | 'surfboard' | 'woodlog';

export interface ObstacleOptions extends EntityOptions {
  obstacleType: ObstacleType;
}

export class Obstacle extends BaseEntity {
  public obstacleType: ObstacleType;
  public passed: boolean = false;

  // Animation properties (for obstacles like chainsaw)
  private rotationAngle: number = 0;
  private animationSpeed: number = 1;

  constructor(options: ObstacleOptions) {
    const config = OBSTACLE_CONFIGS[options.obstacleType];

    super('obstacle', {
      width: config.width,
      height: config.height,
      speedX: config.speed,
      speedY: 0,
      ...options,
    });

    this.obstacleType = options.obstacleType;

    // Set obstacle-specific properties
    this.setupObstacleSpecifics();
  }

  private setupObstacleSpecifics(): void {
    switch (this.obstacleType) {
      case 'chainsaw':
        this.animationSpeed = 3; // Fast spinning
        this.maxFrames = 1; // Rotation animation handled separately
        break;
      case 'laser':
        this.animationSpeed = 1;
        break;
      case 'sun':
        this.animationSpeed = 0.5; // Slow pulsing
        break;
      default:
        this.animationSpeed = 1;
    }
  }

  protected onUpdate(deltaTime: number): void {
    this.updateAnimation(deltaTime);
    this.checkIfPassed();
  }

  // Check if player has passed this obstacle (for scoring)
  private checkIfPassed(): void {
    if (!this.passed && this.x + this.width < GAME_CONFIG.SCREEN_WIDTH * 0.2) {
      this.passed = true;
      // Score will be updated by the game engine when it detects passed obstacles
    }
  }

  // Custom animation update for specific obstacles
  protected updateAnimation(deltaTime: number): void {
    super.updateAnimation(deltaTime);

    // Special animations
    switch (this.obstacleType) {
      case 'chainsaw':
        this.rotationAngle += this.animationSpeed * (deltaTime / 16.67);
        if (this.rotationAngle >= 360) this.rotationAngle -= 360;
        break;
      case 'sun':
        // Pulsing effect could be handled here
        break;
    }
  }

  // Collision with player
  public onCollision(other: BaseEntity): void {
    if (other.type === 'player') {
      // Obstacle hit by player - player should handle the death logic
      // The obstacle itself doesn't need to do much here
    }
  }

  // Factory method for creating obstacles at random positions
  public static createRandom(screenHeight: number): Obstacle {
    const types: ObstacleType[] = Object.keys(OBSTACLE_CONFIGS) as ObstacleType[];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const config = OBSTACLE_CONFIGS[randomType];
    const groundY = screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);

    // Random Y position, but keep obstacles away from extreme top/bottom
    const minY = 50;
    const maxY = groundY - config.height - 50;
    const randomY = Math.random() * (maxY - minY) + minY;

    return new Obstacle({
      obstacleType: randomType,
      x: GAME_CONFIG.SCREEN_WIDTH + 50, // Start off-screen to the right
      y: randomY,
    });
  }

  // Get rotation angle (for rendering spinning obstacles)
  public getRotationAngle(): number {
    return this.rotationAngle;
  }

  // Check if obstacle has been passed by player (for scoring)
  public hasPassed(): boolean {
    return this.passed;
  }

  // Reset passed state (for object pooling)
  public resetPassed(): void {
    this.passed = false;
  }

  public getDebugInfo(): any {
    return {
      ...super.getDebugInfo(),
      obstacleType: this.obstacleType,
      passed: this.passed,
      rotationAngle: this.rotationAngle,
    };
  }
}