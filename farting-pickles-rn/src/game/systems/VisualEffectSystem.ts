// Visual Effect System - Handles animations, particle effects, and visual states
// Replaces the manual sprite animation from legacy Android Sprite classes

export interface VisualEffect {
  id: string;
  type: 'particle' | 'animation' | 'tween' | 'flash';
  x: number;
  y: number;
  duration: number;
  elapsed: number;
  isActive: boolean;
  data: any;
}

export interface ParticleData {
  velocityX: number;
  velocityY: number;
  color: string;
  size: number;
  life: number;
  gravity: number;
}

export interface AnimationData {
  frames: number[];
  frameTime: number;
  currentFrame: number;
  loop: boolean;
}

export interface TweenData {
  startValue: number;
  endValue: number;
  property: string;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'bounce';
}

export class VisualEffectSystem {
  private effects: Map<string, VisualEffect> = new Map();
  private nextId: number = 0;

  // Update all visual effects
  public update(deltaTime: number): void {
    const effectsToRemove: string[] = [];

    this.effects.forEach((effect, id) => {
      if (!effect.isActive) return;

      effect.elapsed += deltaTime;

      switch (effect.type) {
        case 'particle':
          this.updateParticle(effect, deltaTime);
          break;
        case 'animation':
          this.updateAnimation(effect, deltaTime);
          break;
        case 'tween':
          this.updateTween(effect, deltaTime);
          break;
        case 'flash':
          this.updateFlash(effect, deltaTime);
          break;
      }

      // Remove expired effects
      if (effect.elapsed >= effect.duration) {
        effect.isActive = false;
        effectsToRemove.push(id);
      }
    });

    // Clean up expired effects
    effectsToRemove.forEach(id => this.effects.delete(id));
  }

  // Create particle effect (for coin collection, fart trails, etc.)
  public createParticleEffect(
    x: number,
    y: number,
    count: number = 5,
    color: string = '#FFD700',
    duration: number = 1000
  ): string {
    const effectId = this.generateId();

    const particles: ParticleData[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        velocityX: (Math.random() - 0.5) * 200,
        velocityY: (Math.random() - 0.5) * 200 - 100,
        color: color,
        size: Math.random() * 4 + 2,
        life: 1.0,
        gravity: 300,
      });
    }

    const effect: VisualEffect = {
      id: effectId,
      type: 'particle',
      x,
      y,
      duration,
      elapsed: 0,
      isActive: true,
      data: { particles },
    };

    this.effects.set(effectId, effect);
    return effectId;
  }

  // Create animation effect (for sprite animations)
  public createAnimationEffect(
    x: number,
    y: number,
    frames: number[],
    frameTime: number = 100,
    loop: boolean = true,
    duration: number = 1000
  ): string {
    const effectId = this.generateId();

    const effect: VisualEffect = {
      id: effectId,
      type: 'animation',
      x,
      y,
      duration,
      elapsed: 0,
      isActive: true,
      data: {
        frames,
        frameTime,
        currentFrame: 0,
        loop,
        lastFrameTime: 0,
      },
    };

    this.effects.set(effectId, effect);
    return effectId;
  }

  // Create tween effect (for smooth value transitions)
  public createTweenEffect(
    startValue: number,
    endValue: number,
    duration: number,
    property: string = 'value',
    easing: 'linear' | 'ease-in' | 'ease-out' | 'bounce' = 'linear'
  ): string {
    const effectId = this.generateId();

    const effect: VisualEffect = {
      id: effectId,
      type: 'tween',
      x: 0,
      y: 0,
      duration,
      elapsed: 0,
      isActive: true,
      data: {
        startValue,
        endValue,
        property,
        easing,
        currentValue: startValue,
      },
    };

    this.effects.set(effectId, effect);
    return effectId;
  }

  // Create flash effect (for hit feedback, achievements)
  public createFlashEffect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = '#FFFFFF',
    duration: number = 200
  ): string {
    const effectId = this.generateId();

    const effect: VisualEffect = {
      id: effectId,
      type: 'flash',
      x,
      y,
      duration,
      elapsed: 0,
      isActive: true,
      data: {
        width,
        height,
        color,
        intensity: 1.0,
      },
    };

    this.effects.set(effectId, effect);
    return effectId;
  }

  // Update particle effects
  private updateParticle(effect: VisualEffect, deltaTime: number): void {
    const particles = effect.data.particles as ParticleData[];

    particles.forEach((particle: ParticleData) => {
      const dt = deltaTime / 1000;

      // Update position
      particle.velocityY += particle.gravity * dt;

      // Update life
      particle.life = 1.0 - (effect.elapsed / effect.duration);

      // Fade out over time
      particle.size = particle.size * particle.life;
    });
  }

  // Update animation effects
  private updateAnimation(effect: VisualEffect, deltaTime: number): void {
    const animData = effect.data as AnimationData & { lastFrameTime: number };

    animData.lastFrameTime += deltaTime;

    if (animData.lastFrameTime >= animData.frameTime) {
      animData.currentFrame++;

      if (animData.currentFrame >= animData.frames.length) {
        if (animData.loop) {
          animData.currentFrame = 0;
        } else {
          animData.currentFrame = animData.frames.length - 1;
          effect.isActive = false;
        }
      }

      animData.lastFrameTime = 0;
    }
  }

  // Update tween effects
  private updateTween(effect: VisualEffect, deltaTime: number): void {
    const tweenData = effect.data as TweenData & { currentValue: number };
    const progress = Math.min(effect.elapsed / effect.duration, 1.0);

    let easedProgress = progress;

    // Apply easing
    switch (tweenData.easing) {
      case 'ease-in':
        easedProgress = progress * progress;
        break;
      case 'ease-out':
        easedProgress = 1 - Math.pow(1 - progress, 2);
        break;
      case 'bounce':
        easedProgress = this.bounceEasing(progress);
        break;
      default: // linear
        easedProgress = progress;
    }

    tweenData.currentValue = tweenData.startValue +
      (tweenData.endValue - tweenData.startValue) * easedProgress;
  }

  // Update flash effects
  private updateFlash(effect: VisualEffect, deltaTime: number): void {
    const flashData = effect.data;
    const progress = effect.elapsed / effect.duration;

    // Fade out the flash
    flashData.intensity = 1.0 - progress;
  }

  // Bounce easing function
  private bounceEasing(t: number): number {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }

  // Get effect by ID
  public getEffect(id: string): VisualEffect | undefined {
    return this.effects.get(id);
  }

  // Remove effect
  public removeEffect(id: string): void {
    this.effects.delete(id);
  }

  // Get all active effects
  public getActiveEffects(): VisualEffect[] {
    return Array.from(this.effects.values()).filter(effect => effect.isActive);
  }

  // Get effects by type
  public getEffectsByType(type: VisualEffect['type']): VisualEffect[] {
    return Array.from(this.effects.values()).filter(
      effect => effect.type === type && effect.isActive
    );
  }

  // Clear all effects
  public clearAllEffects(): void {
    this.effects.clear();
  }

  // Preset effect creators for common game events
  public createCoinCollectionEffect(x: number, y: number): string {
    return this.createParticleEffect(x, y, 8, '#FFD700', 800);
  }

  public createFartEffect(x: number, y: number): string {
    return this.createParticleEffect(x, y, 12, '#90EE90', 600);
  }

  public createObstacleHitEffect(x: number, y: number): string {
    return this.createFlashEffect(x - 10, y - 10, 64, 64, '#FF4444', 300);
  }

  public createAchievementEffect(x: number, y: number): string {
    // Create a golden particle burst for achievements
    return this.createParticleEffect(x, y, 15, '#FFD700', 1500);
  }

  public createPowerUpEffect(x: number, y: number): string {
    return this.createParticleEffect(x, y, 10, '#FF69B4', 1000);
  }

  // Generate unique ID
  private generateId(): string {
    return `effect_${this.nextId++}_${Date.now()}`;
  }

  // Get debug information
  public getDebugInfo(): any {
    return {
      activeEffects: this.effects.size,
      effectsByType: {
        particle: this.getEffectsByType('particle').length,
        animation: this.getEffectsByType('animation').length,
        tween: this.getEffectsByType('tween').length,
        flash: this.getEffectsByType('flash').length,
      },
    };
  }
}