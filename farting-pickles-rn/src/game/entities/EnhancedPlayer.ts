// Enhanced Player System - Advanced player with visual upgrades and progression
// Extends the base Player class with visual effects and upgrade mechanics

import { Player, PlayerOptions } from './Player';
import { VisualEffectSystem } from '../systems/VisualEffectSystem';
import { PLAYER_CONFIG } from '@/constants/gameData';

export interface PlayerVisualState {
  currentSprite: 'normal' | 'fart' | 'upgraded';
  accessoryVisible: boolean;
  glowEffect: boolean;
  trailEffect: boolean;
  scale: number;
}

export interface PlayerUpgrade {
  id: string;
  name: string;
  description: string;
  requiredScore: number;
  unlocked: boolean;
  visualEffect?: string;
}

export class EnhancedPlayer extends Player {
  // Visual state management
  private visualState: PlayerVisualState;
  private visualEffects: VisualEffectSystem;

  // Upgrade system
  private upgrades: Map<string, PlayerUpgrade> = new Map();
  private currentUpgradeLevel: number = 0;

  // Visual effect timers
  private fartTrailTimer: number = 0;
  private glowTimer: number = 0;
  private bounceTimer: number = 0;

  // Animation states
  private isLanding: boolean = false;
  private landingTimer: number = 0;
  private isSuperFarting: boolean = false;
  private superFartTimer: number = 0;

  constructor(options: PlayerOptions = {}, visualEffects: VisualEffectSystem) {
    super(options);

    this.visualEffects = visualEffects;

    this.visualState = {
      currentSprite: 'normal',
      accessoryVisible: false,
      glowEffect: false,
      trailEffect: false,
      scale: 1.0,
    };

    this.initializeUpgrades();
  }

  // Initialize upgrade system
  private initializeUpgrades(): void {
    const upgradeData = [
      {
        id: 'fart_trail',
        name: 'Fart Trail',
        description: 'Leave a trail of fart particles when jumping',
        requiredScore: 25,
        visualEffect: 'trail',
      },
      {
        id: 'golden_glow',
        name: 'Golden Glow',
        description: 'Emit a golden glow around the character',
        requiredScore: 50,
        visualEffect: 'glow',
      },
      {
        id: 'super_size',
        name: 'Super Size',
        description: 'Character becomes 20% larger',
        requiredScore: 100,
        visualEffect: 'scale',
      },
      {
        id: 'rainbow_fart',
        name: 'Rainbow Fart',
        description: 'Fart effects become rainbow colored',
        requiredScore: 200,
        visualEffect: 'rainbow',
      },
    ];

    upgradeData.forEach(upgrade => {
      this.upgrades.set(upgrade.id, {
        ...upgrade,
        unlocked: false,
      });
    });
  }

  // Enhanced update with visual effects
  protected onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    this.updateVisualEffects(deltaTime);
    this.updateUpgradeEffects(deltaTime);
    this.updateAnimationStates(deltaTime);
  }

  // Update visual effects
  private updateVisualEffects(deltaTime: number): void {
    // Fart trail effect
    if (this.visualState.trailEffect && (this.isJumping || this.speedY !== 0)) {
      this.fartTrailTimer += deltaTime;
      if (this.fartTrailTimer >= 100) { // Every 100ms
        this.createFartTrail();
        this.fartTrailTimer = 0;
      }
    }

    // Glow effect pulsing
    if (this.visualState.glowEffect) {
      this.glowTimer += deltaTime;
      const intensity = 0.5 + 0.3 * Math.sin(this.glowTimer / 500);
      // Glow intensity varies between 0.2 and 0.8
    }

    // Landing bounce effect
    if (this.isLanding) {
      this.landingTimer += deltaTime;
      if (this.landingTimer >= 200) {
        this.isLanding = false;
        this.landingTimer = 0;
        this.visualState.scale = 1.0;
      } else {
        // Squash and stretch on landing
        const progress = this.landingTimer / 200;
        this.visualState.scale = 1.0 + 0.2 * Math.sin(progress * Math.PI);
      }
    }

    // Super fart effect
    if (this.isSuperFarting) {
      this.superFartTimer += deltaTime;
      if (this.superFartTimer >= 500) {
        this.isSuperFarting = false;
        this.superFartTimer = 0;
        this.visualState.currentSprite = 'normal';
      }
    }
  }

  // Update upgrade-specific effects
  private updateUpgradeEffects(deltaTime: number): void {
    this.upgrades.forEach(upgrade => {
      if (!upgrade.unlocked) return;

      switch (upgrade.visualEffect) {
        case 'trail':
          this.visualState.trailEffect = true;
          break;
        case 'glow':
          this.visualState.glowEffect = true;
          break;
        case 'scale':
          if (!this.isLanding) {
            this.visualState.scale = 1.2;
          }
          break;
      }
    });
  }

  // Update animation states
  private updateAnimationStates(deltaTime: number): void {
    // Update sprite based on current state
    if (this.isSuperFarting) {
      this.visualState.currentSprite = 'upgraded';
    } else if (this.isFarting) {
      this.visualState.currentSprite = 'fart';
    } else {
      this.visualState.currentSprite = 'normal';
    }

    // Show accessory if player has one
    this.visualState.accessoryVisible = !!this.accessory;
  }

  // Enhanced jump with visual effects
  public jump(): void {
    super.jump();

    // Create jump effect
    this.createJumpEffect();

    // Landing detection for bounce effect
    this.isLanding = true;
    this.landingTimer = 0;
  }

  // Enhanced collision handling with visual feedback
  public onCollision(other: any): void {
    super.onCollision(other);

    switch (other.type) {
      case 'collectible':
        this.handleCollectibleCollision(other);
        break;
      case 'obstacle':
        this.handleObstacleCollision(other);
        break;
    }
  }

  private handleCollectibleCollision(collectible: any): void {
    // Create collection effect
    this.visualEffects.createCoinCollectionEffect(
      collectible.x + collectible.width / 2,
      collectible.y + collectible.height / 2
    );

    // Special effects for different collectibles
    if (collectible.collectibleType === 'fart') {
      this.triggerSuperFart();
    }
  }

  private handleObstacleCollision(obstacle: any): void {
    // Create hit effect
    this.visualEffects.createObstacleHitEffect(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  // Visual effect creation methods
  private createJumpEffect(): void {
    this.visualEffects.createFartEffect(
      this.x + this.width / 2,
      this.y + this.height
    );
  }

  private createFartTrail(): void {
    if (!this.upgrades.get('fart_trail')?.unlocked) return;

    const isRainbow = this.upgrades.get('rainbow_fart')?.unlocked;
    const color = isRainbow ? this.getRandomRainbowColor() : '#90EE90';

    this.visualEffects.createParticleEffect(
      this.x + this.width / 2,
      this.y + this.height,
      3, // Smaller trail
      color,
      400 // Shorter duration
    );
  }

  private getRandomRainbowColor(): string {
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private triggerSuperFart(): void {
    this.isSuperFarting = true;
    this.superFartTimer = 0;

    // Create super fart effect
    this.visualEffects.createPowerUpEffect(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  // Upgrade system methods
  public checkForUpgrades(currentScore: number): PlayerUpgrade[] {
    const newUpgrades: PlayerUpgrade[] = [];

    this.upgrades.forEach(upgrade => {
      if (!upgrade.unlocked && currentScore >= upgrade.requiredScore) {
        upgrade.unlocked = true;
        newUpgrades.push(upgrade);

        // Create upgrade unlock effect
        this.visualEffects.createAchievementEffect(
          this.x + this.width / 2,
          this.y + this.height / 2
        );
      }
    });

    return newUpgrades;
  }

  public getUnlockedUpgrades(): PlayerUpgrade[] {
    return Array.from(this.upgrades.values()).filter(upgrade => upgrade.unlocked);
  }

  public hasUpgrade(upgradeId: string): boolean {
    return this.upgrades.get(upgradeId)?.unlocked ?? false;
  }

  // Visual state getters for rendering
  public getVisualState(): PlayerVisualState {
    return { ...this.visualState };
  }

  public getCurrentSpriteKey(): string {
    let spriteKey = 'pickle'; // Base sprite

    // Add upgrade modifications
    if (this.hasUpgrade('super_size')) {
      spriteKey += '_large';
    }

    if (this.visualState.currentSprite === 'fart') {
      spriteKey = 'fart_pickle';
    }

    return spriteKey;
  }

  public getAccessorySpriteKey(): string | null {
    if (!this.visualState.accessoryVisible || !this.accessory) {
      return null;
    }

    return `accessory_${this.accessory}`;
  }

  public shouldShowGlow(): boolean {
    return this.visualState.glowEffect;
  }

  public getScale(): number {
    return this.visualState.scale;
  }

  // Enhanced reset with visual state
  public reset(x?: number, y?: number): void {
    super.reset(x, y);

    // Reset visual state
    this.visualState = {
      currentSprite: 'normal',
      accessoryVisible: false,
      glowEffect: false,
      trailEffect: false,
      scale: 1.0,
    };

    // Reset timers
    this.fartTrailTimer = 0;
    this.glowTimer = 0;
    this.bounceTimer = 0;
    this.landingTimer = 0;
    this.superFartTimer = 0;

    // Reset animation states
    this.isLanding = false;
    this.isSuperFarting = false;
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      ...super.getDebugInfo(),
      visual: {
        visualState: this.visualState,
        upgrades: Array.from(this.upgrades.values()),
        timers: {
          fartTrail: this.fartTrailTimer,
          glow: this.glowTimer,
          landing: this.landingTimer,
          superFart: this.superFartTimer,
        },
        animationStates: {
          isLanding: this.isLanding,
          isSuperFarting: this.isSuperFarting,
        },
      },
    };
  }
}