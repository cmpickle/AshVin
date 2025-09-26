// Physics System - Advanced physics calculations for the game
// Replaces the manual physics from legacy Android GameView and Sprite classes

import { BaseEntity } from '../entities/BaseEntity';
import { GAME_CONFIG } from '@/constants/gameConfig';

export interface PhysicsBody {
  entity: BaseEntity;
  mass: number;
  drag: number;
  bounce: number;
  gravityScale: number;
  isStatic: boolean;
  isGrounded: boolean;
}

export class PhysicsSystem {
  private physicsBodies: Map<string, PhysicsBody> = new Map();
  private gravity: number = GAME_CONFIG.GRAVITY;
  private groundY: number;

  constructor(screenHeight: number) {
    this.groundY = screenHeight * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);
  }

  // Add entity to physics system
  public addBody(entity: BaseEntity, options: Partial<PhysicsBody> = {}): void {
    const physicsBody: PhysicsBody = {
      entity,
      mass: options.mass ?? 1,
      drag: options.drag ?? 0.95,
      bounce: options.bounce ?? 0,
      gravityScale: options.gravityScale ?? 1,
      isStatic: options.isStatic ?? false,
      isGrounded: false,
    };

    this.physicsBodies.set(entity.id, physicsBody);
  }

  // Remove entity from physics system
  public removeBody(entityId: string): void {
    this.physicsBodies.delete(entityId);
  }

  // Update all physics bodies
  public update(deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds

    this.physicsBodies.forEach(body => {
      if (body.isStatic || !body.entity.isActive) return;

      this.updateGravity(body, dt);
      this.updateMovement(body, dt);
      this.checkGroundCollision(body);
      this.applyDrag(body);
    });
  }

  // Apply gravity to non-static bodies
  private updateGravity(body: PhysicsBody, deltaTime: number): void {
    if (body.isGrounded) return;

    const gravityForce = this.gravity * body.gravityScale * body.mass;
    body.entity.speedY += gravityForce * deltaTime * 60; // Scale for 60fps

    // Terminal velocity
    const maxFallSpeed = 15;
    body.entity.speedY = Math.min(body.entity.speedY, maxFallSpeed);
  }

  // Update entity position based on velocity
  private updateMovement(body: PhysicsBody, deltaTime: number): void {
    const entity = body.entity;

    entity.x += entity.speedX * deltaTime * 60;
    entity.y += entity.speedY * deltaTime * 60;
  }

  // Check collision with ground
  private checkGroundCollision(body: PhysicsBody): void {
    const entity = body.entity;
    const bottomY = entity.y + entity.height;

    if (bottomY >= this.groundY) {
      // Entity is on or below ground
      entity.y = this.groundY - entity.height;

      if (entity.speedY > 0) {
        // Landing on ground
        if (body.bounce > 0) {
          entity.speedY = -entity.speedY * body.bounce;
        } else {
          entity.speedY = 0;
        }
      }

      body.isGrounded = true;
    } else {
      body.isGrounded = false;
    }
  }

  // Apply air resistance/drag
  private applyDrag(body: PhysicsBody): void {
    if (body.drag < 1) {
      body.entity.speedX *= body.drag;
      if (!body.isGrounded) {
        body.entity.speedY *= body.drag;
      }
    }
  }

  // Apply impulse force (for jumping)
  public applyImpulse(entityId: string, forceX: number, forceY: number): void {
    const body = this.physicsBodies.get(entityId);
    if (!body || body.isStatic) return;

    body.entity.speedX += forceX / body.mass;
    body.entity.speedY += forceY / body.mass;

    // If jumping upward, no longer grounded
    if (forceY < 0) {
      body.isGrounded = false;
    }
  }

  // Set velocity directly
  public setVelocity(entityId: string, velocityX: number, velocityY: number): void {
    const body = this.physicsBodies.get(entityId);
    if (!body || body.isStatic) return;

    body.entity.speedX = velocityX;
    body.entity.speedY = velocityY;
  }

  // Check if entity is grounded
  public isGrounded(entityId: string): boolean {
    const body = this.physicsBodies.get(entityId);
    return body ? body.isGrounded : false;
  }

  // Get physics body for an entity
  public getBody(entityId: string): PhysicsBody | undefined {
    return this.physicsBodies.get(entityId);
  }

  // Advanced collision detection with physics response
  public checkCollision(entity1: BaseEntity, entity2: BaseEntity): boolean {
    const body1 = this.physicsBodies.get(entity1.id);
    const body2 = this.physicsBodies.get(entity2.id);

    if (!body1 || !body2) {
      // Fall back to basic collision detection
      return entity1.isCollidingWith(entity2);
    }

    // Enhanced collision with physics properties
    const isColliding = entity1.isCollidingWith(entity2);

    if (isColliding) {
      this.resolveCollision(body1, body2);
    }

    return isColliding;
  }

  // Resolve collision between two physics bodies
  private resolveCollision(body1: PhysicsBody, body2: PhysicsBody): void {
    if (body1.isStatic && body2.isStatic) return;

    const entity1 = body1.entity;
    const entity2 = body2.entity;

    // Calculate collision normal (simplified)
    const dx = (entity1.x + entity1.width / 2) - (entity2.x + entity2.width / 2);
    const dy = (entity1.y + entity1.height / 2) - (entity2.y + entity2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const normalX = dx / distance;
    const normalY = dy / distance;

    // Separate entities
    const overlap = (entity1.width + entity2.width) / 2 + (entity1.height + entity2.height) / 2 - distance;

    if (overlap > 0) {
      const separation = overlap / 2;

      if (!body1.isStatic) {
        entity1.x += normalX * separation;
        entity1.y += normalY * separation;
      }

      if (!body2.isStatic) {
        entity2.x -= normalX * separation;
        entity2.y -= normalY * separation;
      }
    }

    // Calculate relative velocity
    const relativeVelocityX = entity1.speedX - entity2.speedX;
    const relativeVelocityY = entity1.speedY - entity2.speedY;

    // Velocity along collision normal
    const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

    // Do not resolve if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Calculate restitution (bounce)
    const restitution = Math.min(body1.bounce, body2.bounce);

    // Calculate impulse scalar
    let impulseScalar = -(1 + restitution) * velocityAlongNormal;
    impulseScalar /= (1 / body1.mass) + (1 / body2.mass);

    // Apply impulse
    const impulseX = impulseScalar * normalX;
    const impulseY = impulseScalar * normalY;

    if (!body1.isStatic) {
      entity1.speedX += impulseX / body1.mass;
      entity1.speedY += impulseY / body1.mass;
    }

    if (!body2.isStatic) {
      entity2.speedX -= impulseX / body2.mass;
      entity2.speedY -= impulseY / body2.mass;
    }
  }

  // Update ground level (for dynamic levels)
  public setGroundLevel(groundY: number): void {
    this.groundY = groundY;
  }

  // Get ground level
  public getGroundLevel(): number {
    return this.groundY;
  }

  // Clear all physics bodies
  public clear(): void {
    this.physicsBodies.clear();
  }

  // Debug information
  public getDebugInfo(): any {
    const bodies = Array.from(this.physicsBodies.values()).map(body => ({
      id: body.entity.id,
      type: body.entity.type,
      position: { x: body.entity.x, y: body.entity.y },
      velocity: { x: body.entity.speedX, y: body.entity.speedY },
      isGrounded: body.isGrounded,
      mass: body.mass,
    }));

    return {
      bodyCount: this.physicsBodies.size,
      gravity: this.gravity,
      groundY: this.groundY,
      bodies: bodies,
    };
  }
}