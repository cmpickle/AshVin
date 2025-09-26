// Enhanced Obstacle System - Advanced obstacles with unique behaviors and patterns
// Extends the base Obstacle class with specialized movement and visual effects

import { Obstacle, ObstacleType, ObstacleOptions } from './Obstacle';
import { VisualEffectSystem } from '../systems/VisualEffectSystem';
import { GAME_CONFIG } from '@/constants/gameConfig';

export interface ObstacleBehavior {
  type: 'static' | 'rotating' | 'oscillating' | 'pulsing' | 'following' | 'warning';
  data: any;
}

export interface RotatingBehavior {
  rotationSpeed: number; // degrees per second
  currentAngle: number;
}

export interface OscillatingBehavior {
  amplitude: number;
  frequency: number;
  initialY: number;
  phase: number;
}

export interface PulsingBehavior {
  minScale: number;
  maxScale: number;
  pulseSpeed: number;
  currentScale: number;
}

export interface FollowingBehavior {
  targetY: number;
  followSpeed: number;
  trackingRange: number;
}

export interface WarningBehavior {
  warningTime: number;
  isWarning: boolean;
  flashTimer: number;
}

export class EnhancedObstacle extends Obstacle {
  private behavior: ObstacleBehavior;
  private visualEffects: VisualEffectSystem;

  // Visual state
  private currentScale: number = 1.0;
  private currentAngle: number = 0;
  private currentAlpha: number = 1.0;
  private isFlashing: boolean = false;

  // Warning system
  private showWarning: boolean = false;
  private warningEffectId: string | null = null;

  constructor(options: ObstacleOptions, visualEffects: VisualEffectSystem) {
    super(options);
    this.visualEffects = visualEffects;
    this.behavior = this.createBehaviorForType(options.obstacleType);
  }

  private createBehaviorForType(type: ObstacleType): ObstacleBehavior {
    switch (type) {
      case 'chainsaw':
        return {
          type: 'rotating',
          data: {
            rotationSpeed: 360, // 1 full rotation per second
            currentAngle: 0,
          } as RotatingBehavior,
        };

      case 'laser':
        return {
          type: 'warning',
          data: {
            warningTime: 1000, // 1 second warning
            isWarning: true,
            flashTimer: 0,
          } as WarningBehavior,
        };

      case 'sun':
        return {
          type: 'pulsing',
          data: {
            minScale: 0.8,
            maxScale: 1.2,
            pulseSpeed: 2,
            currentScale: 1.0,
          } as PulsingBehavior,
        };

      case 'surfboard':
        return {
          type: 'oscillating',
          data: {
            amplitude: 30,
            frequency: 1.5,
            initialY: this.y,
            phase: 0,
          } as OscillatingBehavior,
        };

      case 'picklejars':
        return {
          type: 'following',
          data: {
            targetY: this.y,
            followSpeed: 50,
            trackingRange: 150,
          } as FollowingBehavior,
        };

      default:
        return {
          type: 'static',
          data: {},
        };
    }
  }

  protected onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    this.updateBehavior(deltaTime);
    this.updateVisualEffects(deltaTime);
  }

  private updateBehavior(deltaTime: number): void {
    switch (this.behavior.type) {
      case 'rotating':
        this.updateRotating(deltaTime);
        break;
      case 'oscillating':
        this.updateOscillating(deltaTime);
        break;
      case 'pulsing':
        this.updatePulsing(deltaTime);
        break;
      case 'following':
        this.updateFollowing(deltaTime);
        break;
      case 'warning':
        this.updateWarning(deltaTime);
        break;
    }
  }

  private updateRotating(deltaTime: number): void {
    const rotatingData = this.behavior.data as RotatingBehavior;
    rotatingData.currentAngle += rotatingData.rotationSpeed * (deltaTime / 1000);

    if (rotatingData.currentAngle >= 360) {
      rotatingData.currentAngle -= 360;
    }

    this.currentAngle = rotatingData.currentAngle;
  }

  private updateOscillating(deltaTime: number): void {
    const oscData = this.behavior.data as OscillatingBehavior;
    oscData.phase += oscData.frequency * (deltaTime / 1000) * 2 * Math.PI;

    this.y = oscData.initialY + Math.sin(oscData.phase) * oscData.amplitude;
  }

  private updatePulsing(deltaTime: number): void {
    const pulseData = this.behavior.data as PulsingBehavior;
    const time = Date.now() / 1000;
    const pulseValue = Math.sin(time * pulseData.pulseSpeed);

    pulseData.currentScale = pulseData.minScale +
      (pulseData.maxScale - pulseData.minScale) * (pulseValue * 0.5 + 0.5);

    this.currentScale = pulseData.currentScale;
  }

  private updateFollowing(deltaTime: number): void {
    const followData = this.behavior.data as FollowingBehavior;

    // This would need player position to work properly
    // For now, simulate following behavior with random movement
    if (Math.random() < 0.01) { // 1% chance per frame to change target
      followData.targetY = this.y + (Math.random() - 0.5) * 100;
    }

    const deltaY = followData.targetY - this.y;
    const moveSpeed = followData.followSpeed * (deltaTime / 1000);

    if (Math.abs(deltaY) > moveSpeed) {
      this.y += Math.sign(deltaY) * moveSpeed;
    } else {
      this.y = followData.targetY;
    }
  }

  private updateWarning(deltaTime: number): void {
    const warningData = this.behavior.data as WarningBehavior;

    if (warningData.isWarning) {
      warningData.flashTimer += deltaTime;

      // Flash every 200ms during warning
      this.isFlashing = Math.floor(warningData.flashTimer / 200) % 2 === 0;
      this.currentAlpha = this.isFlashing ? 0.3 : 1.0;

      // End warning after warning time
      if (warningData.flashTimer >= warningData.warningTime) {
        warningData.isWarning = false;
        this.showWarning = false;
        this.currentAlpha = 1.0;
        this.isFlashing = false;

        // Remove warning effect
        if (this.warningEffectId) {
          this.visualEffects.removeEffect(this.warningEffectId);
          this.warningEffectId = null;
        }
      }
    }
  }

  private updateVisualEffects(deltaTime: number): void {
    // Create warning effect for laser
    if (this.behavior.type === 'warning' && this.showWarning && !this.warningEffectId) {
      this.warningEffectId = this.visualEffects.createFlashEffect(
        this.x - 20,
        this.y - 20,
        this.width + 40,
        this.height + 40,
        '#FF0000',
        1000
      );
    }

    // Create rotation trail for chainsaw
    if (this.behavior.type === 'rotating' && Math.random() < 0.1) {
      this.visualEffects.createParticleEffect(
        this.x + this.width / 2,
        this.y + this.height / 2,
        2,
        '#FFAA00',
        300
      );
    }

    // Create energy effect for pulsing sun
    if (this.behavior.type === 'pulsing' && Math.random() < 0.05) {
      this.visualEffects.createParticleEffect(
        this.x + this.width / 2,
        this.y + this.height / 2,
        3,
        '#FFFF00',
        500
      );
    }
  }

  // Enhanced collision detection with behavior-specific responses
  public onCollision(other: any): void {
    super.onCollision(other);

    if (other.type === 'player') {
      this.createCollisionEffect();
    }
  }

  private createCollisionEffect(): void {
    let effectColor = '#FF4444';

    switch (this.obstacleType) {
      case 'chainsaw':
        effectColor = '#FF0000';
        break;
      case 'laser':
        effectColor = '#00FFFF';
        break;
      case 'sun':
        effectColor = '#FFFF00';
        break;
    }

    this.visualEffects.createObstacleHitEffect(
      this.x + this.width / 2,
      this.y + this.height / 2
    );

    // Create behavior-specific collision effects
    this.visualEffects.createParticleEffect(
      this.x + this.width / 2,
      this.y + this.height / 2,
      8,
      effectColor,
      800
    );
  }

  // Factory method with enhanced behavior selection
  public static createWithBehavior(
    obstacleType: ObstacleType,
    screenHeight: number,
    visualEffects: VisualEffectSystem,
    difficultyLevel: number = 1
  ): EnhancedObstacle {
    const obstacle = new EnhancedObstacle(
      {
        obstacleType,
        x: GAME_CONFIG.SCREEN_WIDTH + 50,
        y: this.calculateSpawnY(obstacleType, screenHeight, difficultyLevel),
      },
      visualEffects
    );

    // Adjust behavior based on difficulty
    obstacle.adjustForDifficulty(difficultyLevel);

    return obstacle;
  }

  private static calculateSpawnY(
    type: ObstacleType,
    screenHeight: number,
    difficulty: number
  ): number {
    const groundY = screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);
    const safeZone = 60; // Minimum distance from edges

    let minY = safeZone;
    let maxY = groundY - 100;

    // Adjust spawn zones based on obstacle type
    switch (type) {
      case 'surfboard':
        // Surfboards prefer middle heights for oscillation
        minY = screenHeight * 0.3;
        maxY = screenHeight * 0.6;
        break;
      case 'sun':
        // Sun prefers upper areas
        minY = safeZone;
        maxY = screenHeight * 0.4;
        break;
      case 'laser':
        // Lasers can spawn anywhere but with warning
        minY = safeZone;
        maxY = groundY - 120;
        break;
    }

    // Higher difficulty = more challenging positions
    if (difficulty > 2) {
      const challengeRange = (maxY - minY) * 0.3;
      minY += challengeRange * 0.5;
      maxY -= challengeRange * 0.5;
    }

    return Math.random() * (maxY - minY) + minY;
  }

  private adjustForDifficulty(difficulty: number): void {
    // Increase speeds and make behaviors more aggressive
    this.speedX *= 1 + (difficulty - 1) * 0.2;

    switch (this.behavior.type) {
      case 'rotating':
        const rotData = this.behavior.data as RotatingBehavior;
        rotData.rotationSpeed *= 1 + (difficulty - 1) * 0.3;
        break;

      case 'oscillating':
        const oscData = this.behavior.data as OscillatingBehavior;
        oscData.frequency *= 1 + (difficulty - 1) * 0.2;
        break;

      case 'pulsing':
        const pulseData = this.behavior.data as PulsingBehavior;
        pulseData.pulseSpeed *= 1 + (difficulty - 1) * 0.3;
        break;

      case 'following':
        const followData = this.behavior.data as FollowingBehavior;
        followData.followSpeed *= 1 + (difficulty - 1) * 0.4;
        break;

      case 'warning':
        const warnData = this.behavior.data as WarningBehavior;
        warnData.warningTime = Math.max(300, warnData.warningTime - (difficulty - 1) * 200);
        break;
    }
  }

  // Visual state getters for rendering
  public getCurrentScale(): number {
    return this.currentScale;
  }

  public getCurrentAngle(): number {
    return this.currentAngle;
  }

  public getCurrentAlpha(): number {
    return this.currentAlpha;
  }

  public isShowingWarning(): boolean {
    return this.showWarning;
  }

  public getBehaviorType(): string {
    return this.behavior.type;
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      ...super.getDebugInfo(),
      behavior: {
        type: this.behavior.type,
        data: this.behavior.data,
      },
      visual: {
        scale: this.currentScale,
        angle: this.currentAngle,
        alpha: this.currentAlpha,
        isFlashing: this.isFlashing,
        showWarning: this.showWarning,
      },
    };
  }
}