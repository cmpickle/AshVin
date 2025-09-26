// Enhanced Collision System - Advanced collision detection with spatial optimization
// Replaces the basic collision detection from legacy Android Sprite classes

import { BaseEntity } from '../entities/BaseEntity';
import { EnhancedPlayer } from '../entities/EnhancedPlayer';
import { EnhancedObstacle } from '../entities/EnhancedObstacle';
import { EnhancedCollectible } from '../entities/EnhancedCollectible';

export interface CollisionResult {
  entity1: BaseEntity;
  entity2: BaseEntity;
  collisionPoint: { x: number; y: number };
  penetrationDepth: number;
  normal: { x: number; y: number };
}

export interface SpatialGrid {
  cellSize: number;
  cols: number;
  rows: number;
  cells: Map<string, BaseEntity[]>;
}

export class CollisionSystem {
  private spatialGrid: SpatialGrid;
  private collisionCallbacks: Map<string, (result: CollisionResult) => void> = new Map();

  // Performance tracking
  private collisionChecks: number = 0;
  private actualCollisions: number = 0;

  constructor(screenWidth: number, screenHeight: number, cellSize: number = 64) {
    this.spatialGrid = {
      cellSize,
      cols: Math.ceil(screenWidth / cellSize),
      rows: Math.ceil(screenHeight / cellSize),
      cells: new Map(),
    };
  }

  // Update collision system
  public update(entities: BaseEntity[]): CollisionResult[] {
    this.collisionChecks = 0;
    this.actualCollisions = 0;

    // Clear and populate spatial grid
    this.updateSpatialGrid(entities);

    // Detect collisions using spatial partitioning
    const collisions = this.detectCollisions();

    // Process collision responses
    collisions.forEach(collision => {
      this.processCollision(collision);
    });

    return collisions;
  }

  // Update spatial grid with current entity positions
  private updateSpatialGrid(entities: BaseEntity[]): void {
    this.spatialGrid.cells.clear();

    entities.forEach(entity => {
      if (!entity.isActive) return;

      const cellKeys = this.getCellKeysForEntity(entity);

      cellKeys.forEach(key => {
        if (!this.spatialGrid.cells.has(key)) {
          this.spatialGrid.cells.set(key, []);
        }
        this.spatialGrid.cells.get(key)!.push(entity);
      });
    });
  }

  // Get all grid cells that an entity occupies
  private getCellKeysForEntity(entity: BaseEntity): string[] {
    const leftCol = Math.floor(entity.x / this.spatialGrid.cellSize);
    const rightCol = Math.floor((entity.x + entity.width) / this.spatialGrid.cellSize);
    const topRow = Math.floor(entity.y / this.spatialGrid.cellSize);
    const bottomRow = Math.floor((entity.y + entity.height) / this.spatialGrid.cellSize);

    const keys: string[] = [];

    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = topRow; row <= bottomRow; row++) {
        if (col >= 0 && col < this.spatialGrid.cols &&
            row >= 0 && row < this.spatialGrid.rows) {
          keys.push(`${col},${row}`);
        }
      }
    }

    return keys;
  }

  // Detect collisions using spatial partitioning
  private detectCollisions(): CollisionResult[] {
    const collisions: CollisionResult[] = [];
    const checkedPairs = new Set<string>();

    this.spatialGrid.cells.forEach(entities => {
      // Check all entity pairs in this cell
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const entity1 = entities[i];
          const entity2 = entities[j];

          // Create unique pair identifier
          const pairKey = entity1.id < entity2.id
            ? `${entity1.id}-${entity2.id}`
            : `${entity2.id}-${entity1.id}`;

          if (checkedPairs.has(pairKey)) continue;
          checkedPairs.add(pairKey);

          // Check if collision is relevant
          if (this.shouldCheckCollision(entity1, entity2)) {
            this.collisionChecks++;

            const collision = this.checkDetailedCollision(entity1, entity2);
            if (collision) {
              collisions.push(collision);
              this.actualCollisions++;
            }
          }
        }
      }
    });

    return collisions;
  }

  // Determine if two entities should be checked for collision
  private shouldCheckCollision(entity1: BaseEntity, entity2: BaseEntity): boolean {
    // Skip if either entity is inactive
    if (!entity1.isActive || !entity2.isActive) return false;

    // Skip if both are static
    if (entity1.type === 'obstacle' && entity2.type === 'obstacle') return false;
    if (entity1.type === 'collectible' && entity2.type === 'collectible') return false;

    // Check relevant collision pairs
    const relevantPairs = [
      ['player', 'obstacle'],
      ['player', 'collectible'],
    ];

    return relevantPairs.some(([type1, type2]) =>
      (entity1.type === type1 && entity2.type === type2) ||
      (entity1.type === type2 && entity2.type === type1)
    );
  }

  // Perform detailed collision detection
  private checkDetailedCollision(entity1: BaseEntity, entity2: BaseEntity): CollisionResult | null {
    // Use different collision methods based on entity types
    const isColliding = this.getCollisionMethod(entity1, entity2)(entity1, entity2);

    if (!isColliding) return null;

    // Calculate collision details
    const collisionPoint = this.calculateCollisionPoint(entity1, entity2);
    const normal = this.calculateCollisionNormal(entity1, entity2);
    const penetrationDepth = this.calculatePenetrationDepth(entity1, entity2, normal);

    return {
      entity1,
      entity2,
      collisionPoint,
      normal,
      penetrationDepth,
    };
  }

  // Get appropriate collision detection method
  private getCollisionMethod(entity1: BaseEntity, entity2: BaseEntity): (e1: BaseEntity, e2: BaseEntity) => boolean {
    // Use circular collision for player vs collectibles (more forgiving)
    if ((entity1.type === 'player' && entity2.type === 'collectible') ||
        (entity1.type === 'collectible' && entity2.type === 'player')) {
      return this.circularCollision;
    }

    // Use precise collision for player vs obstacles
    if ((entity1.type === 'player' && entity2.type === 'obstacle') ||
        (entity1.type === 'obstacle' && entity2.type === 'player')) {
      return this.preciseCollision;
    }

    // Default to AABB collision
    return this.aabbCollision;
  }

  // AABB (Axis-Aligned Bounding Box) collision detection
  private aabbCollision(entity1: BaseEntity, entity2: BaseEntity): boolean {
    return entity1.x < entity2.x + entity2.width &&
           entity1.x + entity1.width > entity2.x &&
           entity1.y < entity2.y + entity2.height &&
           entity1.y + entity1.height > entity2.y;
  }

  // Circular collision detection (more forgiving for collectibles)
  private circularCollision(entity1: BaseEntity, entity2: BaseEntity): boolean {
    const centerX1 = entity1.x + entity1.width / 2;
    const centerY1 = entity1.y + entity1.height / 2;
    const centerX2 = entity2.x + entity2.width / 2;
    const centerY2 = entity2.y + entity2.height / 2;

    const dx = centerX1 - centerX2;
    const dy = centerY1 - centerY2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const radius1 = Math.min(entity1.width, entity1.height) / 2;
    const radius2 = Math.min(entity2.width, entity2.height) / 2;

    return distance < (radius1 + radius2) * 0.8; // 0.8 factor for more forgiving collision
  }

  // Precise collision detection with tolerance
  private preciseCollision(entity1: BaseEntity, entity2: BaseEntity): boolean {
    const tolerance = 3; // 3 pixel tolerance

    return entity1.x + tolerance < entity2.x + entity2.width &&
           entity1.x + entity1.width - tolerance > entity2.x &&
           entity1.y + tolerance < entity2.y + entity2.height &&
           entity1.y + entity1.height - tolerance > entity2.y;
  }

  // Calculate collision point
  private calculateCollisionPoint(entity1: BaseEntity, entity2: BaseEntity): { x: number; y: number } {
    const x1 = entity1.x + entity1.width / 2;
    const y1 = entity1.y + entity1.height / 2;
    const x2 = entity2.x + entity2.width / 2;
    const y2 = entity2.y + entity2.height / 2;

    return {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };
  }

  // Calculate collision normal vector
  private calculateCollisionNormal(entity1: BaseEntity, entity2: BaseEntity): { x: number; y: number } {
    const dx = (entity1.x + entity1.width / 2) - (entity2.x + entity2.width / 2);
    const dy = (entity1.y + entity1.height / 2) - (entity2.y + entity2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 1, y: 0 };

    return {
      x: dx / distance,
      y: dy / distance,
    };
  }

  // Calculate penetration depth
  private calculatePenetrationDepth(
    entity1: BaseEntity,
    entity2: BaseEntity,
    normal: { x: number; y: number }
  ): number {
    // Simplified penetration calculation
    const overlapX = Math.min(
      entity1.x + entity1.width - entity2.x,
      entity2.x + entity2.width - entity1.x
    );

    const overlapY = Math.min(
      entity1.y + entity1.height - entity2.y,
      entity2.y + entity2.height - entity1.y
    );

    return Math.min(overlapX, overlapY);
  }

  // Process collision with appropriate response
  private processCollision(collision: CollisionResult): void {
    const { entity1, entity2 } = collision;

    // Determine collision type and handle appropriately
    if (entity1.type === 'player' || entity2.type === 'player') {
      this.handlePlayerCollision(collision);
    }

    // Call registered collision callbacks
    const callbackKey = `${entity1.type}-${entity2.type}`;
    const callback = this.collisionCallbacks.get(callbackKey);
    if (callback) {
      callback(collision);
    }

    // Call entity collision methods
    entity1.onCollision(entity2);
    entity2.onCollision(entity1);
  }

  // Handle player-specific collisions
  private handlePlayerCollision(collision: CollisionResult): void {
    const { entity1, entity2 } = collision;
    const player = entity1.type === 'player' ? entity1 as EnhancedPlayer : entity2 as EnhancedPlayer;
    const other = entity1.type === 'player' ? entity2 : entity1;

    switch (other.type) {
      case 'obstacle':
        this.handlePlayerObstacleCollision(player, other as EnhancedObstacle);
        break;
      case 'collectible':
        this.handlePlayerCollectibleCollision(player, other as EnhancedCollectible);
        break;
    }
  }

  private handlePlayerObstacleCollision(player: EnhancedPlayer, obstacle: EnhancedObstacle): void {
    // Player dies on obstacle collision
    // Visual effects are handled by the entities themselves
  }

  private handlePlayerCollectibleCollision(player: EnhancedPlayer, collectible: EnhancedCollectible): void {
    if (!collectible.collected) {
      // Collectible pickup logic is handled by the entities
      // But we can add additional effects here
    }
  }

  // Register collision callback
  public onCollision(entityType1: string, entityType2: string, callback: (result: CollisionResult) => void): void {
    const key = `${entityType1}-${entityType2}`;
    this.collisionCallbacks.set(key, callback);

    // Also register reverse key
    const reverseKey = `${entityType2}-${entityType1}`;
    this.collisionCallbacks.set(reverseKey, callback);
  }

  // Check magnetic attraction for collectibles
  public updateMagneticAttractions(entities: BaseEntity[]): void {
    const players = entities.filter(e => e.type === 'player') as EnhancedPlayer[];
    const collectibles = entities.filter(e => e.type === 'collectible') as EnhancedCollectible[];

    players.forEach(player => {
      collectibles.forEach(collectible => {
        if (!collectible.collected) {
          collectible.checkMagneticAttraction(player);
        }
      });
    });
  }

  // Get collision statistics
  public getStats(): { checks: number; collisions: number; efficiency: number } {
    return {
      checks: this.collisionChecks,
      collisions: this.actualCollisions,
      efficiency: this.collisionChecks > 0 ? this.actualCollisions / this.collisionChecks : 0,
    };
  }

  // Debug visualization data
  public getDebugInfo(): any {
    return {
      spatialGrid: {
        cellSize: this.spatialGrid.cellSize,
        cols: this.spatialGrid.cols,
        rows: this.spatialGrid.rows,
        occupiedCells: this.spatialGrid.cells.size,
      },
      performance: this.getStats(),
      callbacks: this.collisionCallbacks.size,
    };
  }

  // Clear system
  public clear(): void {
    this.spatialGrid.cells.clear();
    this.collisionCallbacks.clear();
    this.collisionChecks = 0;
    this.actualCollisions = 0;
  }
}