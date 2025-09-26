// Enhanced Collectible System - Advanced collectibles with magnetic attraction and special effects
// Extends the base Collectible class with visual effects and enhanced gameplay mechanics

import { Collectible, CollectibleType, CollectibleOptions } from './Collectible';
import { VisualEffectSystem } from '../systems/VisualEffectSystem';
import { BaseEntity } from './BaseEntity';
import { GAME_CONFIG } from '@/constants/gameConfig';

export interface CollectibleEffects {
  magneticAttraction: boolean;
  glowEffect: boolean;
  sparkleTrail: boolean;
  pulseEffect: boolean;
}

export interface MagneticData {
  attractionRadius: number;
  attractionForce: number;
  isBeingAttracted: boolean;
  targetEntity: BaseEntity | null;
}

export class EnhancedCollectible extends Collectible {
  private visualEffects: VisualEffectSystem;
  private effects: CollectibleEffects;
  private magneticData: MagneticData;

  // Visual state
  private glowIntensity: number = 0.5;
  private sparkleTimer: number = 0;
  private pulseTimer: number = 0;
  private currentScale: number = 1.0;
  private rotationAngle: number = 0;

  // Collection animation
  private isCollecting: boolean = false;
  private collectionTimer: number = 0;
  private collectionStartY: number = 0;

  // Special effects
  private comboMultiplier: number = 1;
  private isComboItem: boolean = false;

  constructor(options: CollectibleOptions, visualEffects: VisualEffectSystem) {
    super(options);
    this.visualEffects = visualEffects;

    this.effects = this.createEffectsForType(options.collectibleType);
    this.magneticData = this.createMagneticData(options.collectibleType);
  }

  private createEffectsForType(type: CollectibleType): CollectibleEffects {
    switch (type) {
      case 'coin':
        return {
          magneticAttraction: true,
          glowEffect: true,
          sparkleTrail: false,
          pulseEffect: false,
        };

      case 'beans':
        return {
          magneticAttraction: true,
          glowEffect: true,
          sparkleTrail: true,
          pulseEffect: true,
        };

      case 'fart':
        return {
          magneticAttraction: true,
          glowEffect: true,
          sparkleTrail: true,
          pulseEffect: true,
        };

      default:
        return {
          magneticAttraction: false,
          glowEffect: false,
          sparkleTrail: false,
          pulseEffect: false,
        };
    }
  }

  private createMagneticData(type: CollectibleType): MagneticData {
    const baseRadius = 60;
    const baseForce = 150;

    switch (type) {
      case 'coin':
        return {
          attractionRadius: baseRadius,
          attractionForce: baseForce,
          isBeingAttracted: false,
          targetEntity: null,
        };

      case 'beans':
        return {
          attractionRadius: baseRadius * 1.2,
          attractionForce: baseForce * 1.3,
          isBeingAttracted: false,
          targetEntity: null,
        };

      case 'fart':
        return {
          attractionRadius: baseRadius * 1.5,
          attractionForce: baseForce * 2,
          isBeingAttracted: false,
          targetEntity: null,
        };

      default:
        return {
          attractionRadius: 0,
          attractionForce: 0,
          isBeingAttracted: false,
          targetEntity: null,
        };
    }
  }

  protected onUpdate(deltaTime: number): void {
    if (this.collected) {
      this.updateCollectionAnimation(deltaTime);
      return;
    }

    super.onUpdate(deltaTime);

    this.updateVisualEffects(deltaTime);
    this.updateMagneticAttraction(deltaTime);
    this.updateRotation(deltaTime);
  }

  private updateVisualEffects(deltaTime: number): void {
    // Glow effect pulsing
    if (this.effects.glowEffect) {
      this.glowIntensity = 0.3 + 0.4 * Math.sin(Date.now() / 800);
    }

    // Sparkle trail
    if (this.effects.sparkleTrail) {
      this.sparkleTimer += deltaTime;
      if (this.sparkleTimer >= 200) {
        this.createSparkleEffect();
        this.sparkleTimer = 0;
      }
    }

    // Pulse effect
    if (this.effects.pulseEffect) {
      this.pulseTimer += deltaTime;
      const pulseValue = Math.sin(this.pulseTimer / 600);
      this.currentScale = 1.0 + 0.1 * pulseValue;
    }
  }

  private updateMagneticAttraction(deltaTime: number): void {
    if (!this.effects.magneticAttraction || this.collected) return;

    // This would need player position in a real implementation
    // For now, simulate magnetic attraction behavior
    if (this.magneticData.isBeingAttracted && this.magneticData.targetEntity) {
      const target = this.magneticData.targetEntity;
      const dx = (target.x + target.width / 2) - (this.x + this.width / 2);
      const dy = (target.y + target.height / 2) - (this.y + this.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < this.magneticData.attractionRadius) {
        const force = this.magneticData.attractionForce / distance;
        const normalX = dx / distance;
        const normalY = dy / distance;

        this.speedX += normalX * force * (deltaTime / 1000);
        this.speedY += normalY * force * (deltaTime / 1000);

        // Create magnetic trail effect
        if (Math.random() < 0.3) {
          this.createMagneticTrailEffect();
        }
      }
    }
  }

  private updateRotation(deltaTime: number): void {
    // Slow rotation for visual appeal
    this.rotationAngle += 90 * (deltaTime / 1000); // 90 degrees per second
    if (this.rotationAngle >= 360) {
      this.rotationAngle -= 360;
    }
  }

  private updateCollectionAnimation(deltaTime: number): void {
    if (!this.isCollecting) return;

    this.collectionTimer += deltaTime;

    // Float upward during collection
    const progress = this.collectionTimer / 800; // 800ms collection animation
    this.y = this.collectionStartY - progress * 60; // Float up 60 pixels

    // Fade out
    this.currentScale = 1.0 + progress * 0.5; // Scale up slightly

    if (this.collectionTimer >= 800) {
      this.markForRemoval();
    }
  }

  // Enhanced collection with visual effects
  public collect(): void {
    if (this.collected) return;

    super.collect();

    this.isCollecting = true;
    this.collectionTimer = 0;
    this.collectionStartY = this.y;

    this.createCollectionEffect();
  }

  private createCollectionEffect(): void {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    switch (this.collectibleType) {
      case 'coin':
        this.visualEffects.createCoinCollectionEffect(centerX, centerY);
        break;

      case 'beans':
        this.visualEffects.createParticleEffect(centerX, centerY, 10, '#8B4513', 1000);
        break;

      case 'fart':
        this.visualEffects.createPowerUpEffect(centerX, centerY);
        break;
    }

    // Combo effect if this is part of a combo
    if (this.isComboItem) {
      this.createComboEffect();
    }
  }

  private createSparkleEffect(): void {
    const colors = ['#FFD700', '#FFFF00', '#FFA500'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.visualEffects.createParticleEffect(
      this.x + Math.random() * this.width,
      this.y + Math.random() * this.height,
      2,
      color,
      400
    );
  }

  private createMagneticTrailEffect(): void {
    this.visualEffects.createParticleEffect(
      this.x + this.width / 2,
      this.y + this.height / 2,
      1,
      '#00FFFF',
      200
    );
  }

  private createComboEffect(): void {
    // Create special effect for combo collections
    this.visualEffects.createParticleEffect(
      this.x + this.width / 2,
      this.y + this.height / 2,
      15,
      '#FF69B4',
      1200
    );

    // Flash effect for combo
    this.visualEffects.createFlashEffect(
      this.x - 10,
      this.y - 10,
      this.width + 20,
      this.height + 20,
      '#FFFFFF',
      300
    );
  }

  // Magnetic attraction system
  public checkMagneticAttraction(target: BaseEntity): boolean {
    if (!this.effects.magneticAttraction || this.collected) return false;

    const dx = (target.x + target.width / 2) - (this.x + this.width / 2);
    const dy = (target.y + target.height / 2) - (this.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.magneticData.attractionRadius) {
      this.magneticData.isBeingAttracted = true;
      this.magneticData.targetEntity = target;
      return true;
    }

    this.magneticData.isBeingAttracted = false;
    this.magneticData.targetEntity = null;
    return false;
  }

  // Combo system
  public setComboMultiplier(multiplier: number): void {
    this.comboMultiplier = multiplier;
    this.isComboItem = multiplier > 1;

    if (this.isComboItem) {
      // Enhance visual effects for combo items
      this.effects.glowEffect = true;
      this.effects.sparkleTrail = true;
    }
  }

  public getValue(): number {
    return super.getValue() * this.comboMultiplier;
  }

  // Factory method with enhanced positioning
  public static createEnhanced(
    type: CollectibleType,
    screenHeight: number,
    visualEffects: VisualEffectSystem,
    nearObstacle: boolean = false,
    comboMultiplier: number = 1
  ): EnhancedCollectible {
    const groundY = screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);

    let spawnY: number;

    if (nearObstacle) {
      // Smart positioning near obstacles but in safe collection zones
      spawnY = this.calculateSafeSpawnY(screenHeight, type);
    } else {
      // Free-floating collectible
      const minY = 80;
      const maxY = groundY - 80;
      spawnY = Math.random() * (maxY - minY) + minY;
    }

    const collectible = new EnhancedCollectible(
      {
        collectibleType: type,
        x: GAME_CONFIG.SCREEN_WIDTH + Math.random() * 100,
        y: spawnY,
      },
      visualEffects
    );

    collectible.setComboMultiplier(comboMultiplier);

    return collectible;
  }

  private static calculateSafeSpawnY(screenHeight: number, type: CollectibleType): number {
    const groundY = screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);

    // Create safe zones for different collectible types
    switch (type) {
      case 'fart':
        // Fart powerups in middle-upper area (easier to reach)
        return screenHeight * 0.25 + Math.random() * screenHeight * 0.3;

      case 'beans':
        // Beans in middle area
        return screenHeight * 0.35 + Math.random() * screenHeight * 0.25;

      case 'coin':
      default:
        // Coins anywhere safe
        const minY = 60;
        const maxY = groundY - 60;
        return Math.random() * (maxY - minY) + minY;
    }
  }

  // Visual state getters for rendering
  public getGlowIntensity(): number {
    return this.glowIntensity;
  }

  public getCurrentScale(): number {
    return this.currentScale;
  }

  public getRotationAngle(): number {
    return this.rotationAngle;
  }

  public isBeingAttracted(): boolean {
    return this.magneticData.isBeingAttracted;
  }

  public hasGlowEffect(): boolean {
    return this.effects.glowEffect;
  }

  public isCollecting(): boolean {
    return this.isCollecting;
  }

  public getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  // Enhanced reset with visual state
  public reset(x: number, y: number, type?: CollectibleType): void {
    super.reset(x, y, type);

    // Reset visual state
    this.glowIntensity = 0.5;
    this.sparkleTimer = 0;
    this.pulseTimer = 0;
    this.currentScale = 1.0;
    this.rotationAngle = 0;

    // Reset collection animation
    this.isCollecting = false;
    this.collectionTimer = 0;
    this.collectionStartY = y;

    // Reset magnetic data
    this.magneticData.isBeingAttracted = false;
    this.magneticData.targetEntity = null;

    // Reset combo data
    this.comboMultiplier = 1;
    this.isComboItem = false;

    // Reset effects based on new type
    if (type) {
      this.effects = this.createEffectsForType(type);
      this.magneticData = this.createMagneticData(type);
    }
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      ...super.getDebugInfo(),
      effects: this.effects,
      magnetic: {
        ...this.magneticData,
        targetId: this.magneticData.targetEntity?.id || null,
      },
      visual: {
        glowIntensity: this.glowIntensity,
        currentScale: this.currentScale,
        rotationAngle: this.rotationAngle,
        isCollecting: this.isCollecting,
      },
      combo: {
        multiplier: this.comboMultiplier,
        isComboItem: this.isComboItem,
      },
    };
  }
}