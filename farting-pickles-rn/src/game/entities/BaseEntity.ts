// Base Entity class - replaces the abstract Sprite class from legacy Android version
// Provides common functionality for all game objects

import { GAME_CONFIG } from '@/constants/gameConfig';

export interface EntityOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  speedX?: number;
  speedY?: number;
  visible?: boolean;
}

export abstract class BaseEntity {
  public id: string;
  public type: string;

  // Position and dimensions
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  // Movement
  public speedX: number;
  public speedY: number;

  // Rendering
  public visible: boolean;

  // Animation (if applicable)
  protected frameTime: number = 0;
  protected currentFrame: number = 0;
  protected maxFrames: number = 1;

  // Lifecycle flags
  protected isActive: boolean = true;
  protected markedForRemoval: boolean = false;

  constructor(type: string, options: EntityOptions = {}) {
    this.id = this.generateId();
    this.type = type;

    // Initialize with options or defaults
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width ?? 32;
    this.height = options.height ?? 32;
    this.speedX = options.speedX ?? 0;
    this.speedY = options.speedY ?? 0;
    this.visible = options.visible ?? true;
  }

  // Update method called every frame - equivalent to move() in legacy Sprite.java
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update position based on velocity
    this.x += this.speedX * (deltaTime / 16.67); // Normalize to 60fps
    this.y += this.speedY * (deltaTime / 16.67);

    // Update animation frame
    this.updateAnimation(deltaTime);

    // Call entity-specific update logic
    this.onUpdate(deltaTime);
  }

  // Abstract method for entity-specific update logic
  protected abstract onUpdate(deltaTime: number): void;

  // Animation system
  protected updateAnimation(deltaTime: number): void {
    if (this.maxFrames <= 1) return;

    this.frameTime += deltaTime;
    if (this.frameTime >= 200) { // 200ms per frame
      this.currentFrame = (this.currentFrame + 1) % this.maxFrames;
      this.frameTime = 0;
    }
  }

  // Collision detection - equivalent to isColliding from legacy Sprite.java
  public isCollidingWith(other: BaseEntity): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  // Circular collision detection for more precise collision (from legacy)
  public isCollidingRadius(other: BaseEntity, factor: number = 0.8): boolean {
    const centerX1 = this.x + this.width / 2;
    const centerY1 = this.y + this.height / 2;
    const centerX2 = other.x + other.width / 2;
    const centerY2 = other.y + other.height / 2;

    const dx = centerX1 - centerX2;
    const dy = centerY1 - centerY2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const combinedRadius = ((this.width + other.width) / 2) * factor;

    return distance < combinedRadius;
  }

  // Boundary checking - equivalent to isOutOfRange from legacy Sprite.java
  public isOutOfBounds(): boolean {
    const bounds = this.getScreenBounds();

    // Left boundary (most common for scrolling obstacles)
    if (this.x + this.width < 0) return true;

    // Right boundary
    if (this.x > bounds.width) return true;

    // Top boundary
    if (this.y + this.height < 0) return true;

    // Bottom boundary
    if (this.y > bounds.height) return true;

    return false;
  }

  // Ground and sky collision (from legacy Sprite.java)
  public isTouchingGround(): boolean {
    const bounds = this.getScreenBounds();
    return this.y + this.height >= bounds.groundY;
  }

  public isTouchingSky(): boolean {
    return this.y <= 0;
  }

  public isTouchingEdge(): boolean {
    return this.isTouchingGround() || this.isTouchingSky();
  }

  // Point collision detection (for touch input)
  public containsPoint(pointX: number, pointY: number): boolean {
    return (
      pointX >= this.x &&
      pointX <= this.x + this.width &&
      pointY >= this.y &&
      pointY <= this.y + this.height
    );
  }

  // Collision callback - override in subclasses
  public onCollision(other: BaseEntity): void {
    // Default implementation does nothing
  }

  // Lifecycle methods
  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public markForRemoval(): void {
    this.markedForRemoval = true;
    this.isActive = false;
  }

  public isMarkedForRemoval(): boolean {
    return this.markedForRemoval;
  }

  // Utility methods
  public getCenter(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public setVelocity(speedX: number, speedY: number): void {
    this.speedX = speedX;
    this.speedY = speedY;
  }

  // Get screen dimensions helper
  protected getScreenBounds() {
    return {
      width: GAME_CONFIG.SCREEN_WIDTH,
      height: GAME_CONFIG.SCREEN_HEIGHT,
      groundY: GAME_CONFIG.SCREEN_HEIGHT * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO),
    };
  }

  // Generate unique ID
  private generateId(): string {
    return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  public destroy(): void {
    this.isActive = false;
    this.markedForRemoval = true;
  }

  // Debug information
  public getDebugInfo(): any {
    return {
      id: this.id,
      type: this.type,
      position: { x: this.x, y: this.y },
      dimensions: { width: this.width, height: this.height },
      velocity: { x: this.speedX, y: this.speedY },
      visible: this.visible,
      active: this.isActive,
    };
  }
}