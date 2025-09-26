// Player entity class - replaces PlayableCharacter.java from legacy Android version
// Handles player movement, jumping physics, and collision responses

import { BaseEntity, EntityOptions } from './BaseEntity';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { PLAYER_CONFIG } from '../../constants/gameData';

export interface PlayerOptions extends EntityOptions {
  accessory?: 'scumbag' | 'sir' | 'sunglasses';
}

export class Player extends BaseEntity {
  // Player-specific properties
  public isJumping: boolean = false;
  public jumpPower: number = PLAYER_CONFIG.jumpPower;
  public gravity: number = PLAYER_CONFIG.gravity;
  public maxFallSpeed: number = PLAYER_CONFIG.maxFallSpeed;
  public accessory?: string;

  // Physics state
  private onGround: boolean = false;
  private jumpPressed: boolean = false;

  // Visual state (for sprite selection)
  public isFarting: boolean = false;
  private fartTime: number = 0;

  constructor(options: PlayerOptions = {}) {
    super('player', {
      x: options.x ?? PLAYER_CONFIG.startX,
      y: options.y ?? PLAYER_CONFIG.startY,
      width: options.width ?? PLAYER_CONFIG.width,
      height: options.height ?? PLAYER_CONFIG.height,
      speedX: 0, // Player doesn't move horizontally, world moves around player
      speedY: 0,
      ...options,
    });

    this.accessory = options.accessory;
  }

  // Update player physics and state
  protected onUpdate(deltaTime: number): void {
    this.updatePhysics(deltaTime);
    this.updateVisualState(deltaTime);
    this.checkBoundaries();
  }

  // Physics update - gravity, jumping, ground collision
  private updatePhysics(deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds

    // Apply gravity
    if (!this.onGround) {
      this.speedY += this.gravity * dt * 60; // Scale for 60fps equivalence
      this.speedY = Math.min(this.speedY, this.maxFallSpeed);
    }

    // Handle jump input
    if (this.jumpPressed && this.onGround) {
      this.jump();
      this.jumpPressed = false;
    }

    // Check ground collision
    const bounds = this.getScreenBounds();
    this.onGround = this.y + this.height >= bounds.groundY;

    if (this.onGround) {
      this.y = bounds.groundY - this.height;
      this.speedY = 0;
      this.isJumping = false;
    }
  }

  // Visual state management
  private updateVisualState(deltaTime: number): void {
    // Update fart animation timer
    if (this.isFarting) {
      this.fartTime += deltaTime;
      if (this.fartTime >= 300) { // 300ms fart animation
        this.isFarting = false;
        this.fartTime = 0;
      }
    }
  }

  // Boundary checking - prevent player from leaving screen
  private checkBoundaries(): void {
    const bounds = this.getScreenBounds();

    // Keep player on screen horizontally (though player typically doesn't move)
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > bounds.width) {
      this.x = bounds.width - this.width;
    }

    // Sky collision (death condition)
    if (this.y < 0) {
      this.onDeath();
    }
  }

  // Player actions
  public jump(): void {
    if (!this.onGround) return;

    this.speedY = this.jumpPower;
    this.isJumping = true;
    this.onGround = false;
    this.triggerFart();
  }

  public requestJump(): void {
    this.jumpPressed = true;
  }

  // Visual effects
  private triggerFart(): void {
    this.isFarting = true;
    this.fartTime = 0;
  }

  // Collision handling
  public onCollision(other: BaseEntity): void {
    switch (other.type) {
      case 'obstacle':
        this.onObstacleHit(other);
        break;
      case 'collectible':
        this.onCollectiblePickup(other);
        break;
    }
  }

  private onObstacleHit(obstacle: BaseEntity): void {
    // Player dies on obstacle collision
    this.onDeath();
  }

  private onCollectiblePickup(collectible: any): void {
    // Mark collectible as collected
    if (collectible.collect) {
      collectible.collect();
    }

    // Trigger visual effect
    this.triggerFart();
  }

  // Death handling
  private onDeath(): void {
    // Visual death state
    this.deactivate();

    // Trigger game over through callback system
    // This will be handled by the game engine callbacks
  }

  // Accessory management
  public setAccessory(accessory: string | undefined): void {
    this.accessory = accessory;
  }

  public getAccessory(): string | undefined {
    return this.accessory;
  }

  // Get current sprite state for rendering
  public getSpriteState(): {
    isNormal: boolean;
    isFarting: boolean;
    accessory?: string;
  } {
    return {
      isNormal: !this.isFarting,
      isFarting: this.isFarting,
      accessory: this.accessory,
    };
  }

  // Player state queries
  public isOnGround(): boolean {
    return this.onGround;
  }

  public isDead(): boolean {
    return !this.isActive;
  }

  // Reset player state
  public reset(x?: number, y?: number): void {
    this.x = x ?? PLAYER_CONFIG.startX;
    this.y = y ?? PLAYER_CONFIG.startY;
    this.speedX = 0;
    this.speedY = 0;
    this.isJumping = false;
    this.onGround = false;
    this.jumpPressed = false;
    this.isFarting = false;
    this.fartTime = 0;
    this.activate();
    this.markedForRemoval = false;
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      ...super.getDebugInfo(),
      physics: {
        isJumping: this.isJumping,
        onGround: this.onGround,
        gravity: this.gravity,
        jumpPower: this.jumpPower,
      },
      visual: {
        isFarting: this.isFarting,
        accessory: this.accessory,
      },
    };
  }
}