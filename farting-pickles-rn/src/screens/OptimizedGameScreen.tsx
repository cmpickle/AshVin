// Optimized Game Screen - Premium mobile game experience with 60fps performance
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useGameStore, usePlayerStore } from '../services/gameStore';
import { useHapticFeedback } from '../services/hapticService';
import { IMAGES } from '../constants/assets';
import { OBSTACLE_CONFIGS, COLLECTIBLE_CONFIGS, GAME_LEVELS } from '../constants/gameData';
import { OptimizedGameEngine, GameEntity, ParticleEffect } from '../game/engine/OptimizedGameEngine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OptimizedGameScreenProps {
  levelId?: number;
  onGameComplete?: (score: number, coins: number, completed: boolean) => void;
  onBackToMenu?: () => void;
}

export default function OptimizedGameScreen({
  levelId = 0,
  onGameComplete,
  onBackToMenu,
}: OptimizedGameScreenProps) {
  // Store hooks
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const haptics = useHapticFeedback();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);

  // Performance tracking
  const [fps, setFps] = useState(60);
  const [showDebug, setShowDebug] = useState(false);

  // Game engine
  const gameEngineRef = useRef<OptimizedGameEngine>();
  const animationRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  // Animated values for smooth effects
  const backgroundScrollX = useRef(new Animated.Value(0)).current;
  const foregroundScrollX = useRef(new Animated.Value(0)).current;
  const screenShake = useRef(new Animated.Value(0)).current;
  const playerScale = useRef(new Animated.Value(1)).current;
  const coinGlow = useRef(new Animated.Value(0)).current;

  // Parallax background layers
  const cloudScrollX = useRef(new Animated.Value(0)).current;
  const mountainScrollX = useRef(new Animated.Value(0)).current;

  // Level configuration
  const currentLevel = GAME_LEVELS[levelId] || GAME_LEVELS[0];

  // Game constants
  const GRAVITY = 0.8;
  const JUMP_POWER = -15;
  const GROUND_Y = SCREEN_HEIGHT * 0.8;

  // Memoized sprite helpers for performance
  const spriteHelpers = useMemo(() => ({
    getObstacleSprite: (type: string) => {
      switch (type) {
        case 'chainsaw': return IMAGES.OBSTACLES.CHAINSAW;
        case 'knife': return IMAGES.OBSTACLES.KNIFE;
        case 'laser': return IMAGES.OBSTACLES.LASER;
        case 'picklejars': return IMAGES.OBSTACLES.PICKLE_JARS;
        case 'sun': return IMAGES.OBSTACLES.SUN;
        case 'surfboard': return IMAGES.OBSTACLES.SURFBOARD;
        case 'woodlog': return IMAGES.OBSTACLES.WOOD_LOG;
        default: return IMAGES.OBSTACLES.KNIFE;
      }
    },
    getCollectibleSprite: (type: string) => {
      switch (type) {
        case 'coin': return IMAGES.COLLECTIBLES.COIN;
        case 'beans': return IMAGES.COLLECTIBLES.BEANS;
        case 'fart': return IMAGES.COLLECTIBLES.FART;
        default: return IMAGES.COLLECTIBLES.COIN;
      }
    },
    getLevelBackground: () => {
      switch (currentLevel.background) {
        case 'BG00': return IMAGES.BACKGROUNDS.BG00;
        case 'BG01': return IMAGES.BACKGROUNDS.BG01;
        case 'BG02': return IMAGES.BACKGROUNDS.BG02;
        case 'BG03': return IMAGES.BACKGROUNDS.BG03;
        default: return IMAGES.BACKGROUNDS.BG00;
      }
    },
    getLevelForeground: () => {
      switch (currentLevel.foreground) {
        case 'FG00': return IMAGES.BACKGROUNDS.FG00;
        case 'FG01': return IMAGES.BACKGROUNDS.FG01;
        case 'FG03': return IMAGES.BACKGROUNDS.FG03;
        default: return IMAGES.BACKGROUNDS.FG00;
      }
    },
  }), [currentLevel]);

  // Initialize game engine
  useEffect(() => {
    const gameEngine = new OptimizedGameEngine();
    gameEngineRef.current = gameEngine;

    // Set up engine callbacks
    gameEngine.onCollision = (entity1, entity2) => {
      if (entity1.type === 'player' && entity2.type === 'obstacle') {
        handleCollision();
      } else if (entity1.type === 'player' && entity2.type === 'collectible') {
        handleCollectible(entity2);
      }
    };

    gameEngine.onEntitySpawned = (entity) => {
      // Add spawn effects
      if (entity.type === 'collectible') {
        gameEngine.spawnParticleEffect(entity.x, entity.y, 'coin', 3);
      }
    };

    // Start background animations
    startBackgroundAnimations();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gameEngine.stop();
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && gameEngineRef.current) {
      startGameLoop();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  const startBackgroundAnimations = () => {
    // Continuous background scrolling
    Animated.loop(
      Animated.timing(backgroundScrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Foreground scrolls faster for parallax
    Animated.loop(
      Animated.timing(foregroundScrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Cloud layer scrolls slowly
    Animated.loop(
      Animated.timing(cloudScrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Coin glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinGlow, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: false,
        }),
        Animated.timing(coinGlow, {
          toValue: 0,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startGameLoop = () => {
    const gameLoop = () => {
      if (!gameEngineRef.current || !gameStarted || gameOver) return;

      const now = performance.now();
      const deltaTime = now - lastUpdateTime.current;
      lastUpdateTime.current = now;

      // Update game engine
      gameEngineRef.current.update(deltaTime);

      // Get updated entities and particles
      const currentEntities = gameEngineRef.current.getEntities();
      const currentParticles = gameEngineRef.current.getParticles();

      setEntities([...currentEntities]);
      setParticles([...currentParticles]);
      setFps(gameEngineRef.current.getFPS());

      // Spawn entities based on time and level
      const spawnRate = 2000 - (levelId * 200); // Faster spawning on higher levels
      if (Math.random() < deltaTime / spawnRate) {
        spawnRandomObstacle();
      }

      if (Math.random() < deltaTime / 4000) {
        spawnRandomCollectible();
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastUpdateTime.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnRandomObstacle = () => {
    if (!gameEngineRef.current) return;

    const types = Object.keys(OBSTACLE_CONFIGS);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const config = OBSTACLE_CONFIGS[randomType as keyof typeof OBSTACLE_CONFIGS];

    gameEngineRef.current.spawnObstacle(
      SCREEN_WIDTH,
      GROUND_Y - config.height,
      randomType
    );
  };

  const spawnRandomCollectible = () => {
    if (!gameEngineRef.current) return;

    const types = Object.keys(COLLECTIBLE_CONFIGS);
    const randomType = types[Math.floor(Math.random() * types.length)];

    gameEngineRef.current.spawnCollectible(
      SCREEN_WIDTH,
      Math.random() * (GROUND_Y - 150) + 100,
      randomType
    );
  };

  const handleJump = async () => {
    if (!gameStarted && !gameOver) {
      startNewGame();
      return;
    }

    if (gameOver) {
      restartGame();
      return;
    }

    // Player jump logic here (simplified for this example)
    // In full implementation, this would be handled by the game engine

    // Trigger haptic feedback
    await haptics.triggerJumpSequence();

    // Visual effects
    triggerJumpAnimation();

    if (gameEngineRef.current) {
      // Spawn fart particles
      gameEngineRef.current.spawnParticleEffect(120, GROUND_Y - 50, 'fart', 8);
      gameEngineRef.current.triggerFartEffect();
    }
  };

  const handleCollision = async () => {
    if (gameOver) return;

    setGameOver(true);
    setGameStarted(false);

    // Haptic feedback
    await haptics.triggerCrashSequence();

    // Visual effects
    triggerCrashAnimation();

    if (gameEngineRef.current) {
      gameEngineRef.current.spawnParticleEffect(120, GROUND_Y - 50, 'explosion', 15);
      gameEngineRef.current.triggerScreenShake(10);
    }

    // Update stats
    playerStore.updateHighScore(score);
    playerStore.addTotalCoins(coins);
    playerStore.incrementGamesPlayed();

    onGameComplete?.(score, coins, false);
  };

  const handleCollectible = async (collectible: GameEntity) => {
    const type = collectible.spriteKey;
    let value = 1;

    switch (type) {
      case 'coin':
        value = 1;
        await haptics.triggerHaptic('collect_coin');
        break;
      case 'beans':
        value = 5;
        await haptics.triggerHaptic('collect_beans');
        break;
      case 'fart':
        value = 10;
        await haptics.triggerHaptic('collect_fart');
        break;
    }

    setCoins(prev => prev + value);

    // Visual collection effect
    if (gameEngineRef.current) {
      gameEngineRef.current.spawnParticleEffect(collectible.x, collectible.y, 'coin', 5);
    }

    triggerCoinCollectionAnimation();
  };

  const startNewGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCoins(0);
    setEntities([]);
    setParticles([]);

    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      gameEngineRef.current.start();
    }

    gameStore.startGame(levelId);
  };

  const restartGame = () => {
    startNewGame();
  };

  // Animation helpers
  const triggerJumpAnimation = () => {
    Animated.sequence([
      Animated.timing(playerScale, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(playerScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const triggerCrashAnimation = () => {
    // Screen shake
    Animated.sequence([
      Animated.timing(screenShake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(screenShake, {
        toValue: -10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(screenShake, {
        toValue: 5,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(screenShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const triggerCoinCollectionAnimation = () => {
    Animated.sequence([
      Animated.timing(coinGlow, {
        toValue: 2,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(coinGlow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Render particle effect
  const renderParticle = (particle: ParticleEffect, index: number) => (
    <View
      key={`particle-${particle.id}-${index}`}
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity: particle.life / particle.maxLife,
        },
      ]}
    />
  );

  return (
    <TouchableOpacity style={styles.container} onPress={handleJump} activeOpacity={1}>
      {/* Parallax Background Layers */}
      <Animated.View style={[styles.backgroundLayer, { transform: [{ translateX: cloudScrollX }] }]}>
        <Image source={spriteHelpers.getLevelBackground()} style={styles.backgroundImage} resizeMode="cover" />
        <Image source={spriteHelpers.getLevelBackground()} style={[styles.backgroundImage, { left: SCREEN_WIDTH }]} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[styles.backgroundLayer, { transform: [{ translateX: backgroundScrollX }] }]}>
        <Image source={spriteHelpers.getLevelBackground()} style={styles.backgroundImage} resizeMode="cover" />
        <Image source={spriteHelpers.getLevelBackground()} style={[styles.backgroundImage, { left: SCREEN_WIDTH }]} resizeMode="cover" />
      </Animated.View>

      {/* Game Container with Screen Shake */}
      <Animated.View style={[styles.gameContainer, { transform: [{ translateX: screenShake }] }]}>
        {/* Ground */}
        <View style={[styles.ground, { top: GROUND_Y }]} />

        {/* Foreground with Parallax */}
        <Animated.View style={[styles.foregroundLayer, { top: GROUND_Y, transform: [{ translateX: foregroundScrollX }] }]}>
          <Image source={spriteHelpers.getLevelForeground()} style={styles.foregroundImage} resizeMode="cover" />
          <Image source={spriteHelpers.getLevelForeground()} style={[styles.foregroundImage, { left: SCREEN_WIDTH }]} resizeMode="cover" />
        </Animated.View>

        {/* Game Entities */}
        {entities.map(entity => (
          <Animated.View
            key={entity.id}
            style={[
              styles.entity,
              {
                left: entity.x,
                top: entity.y,
                width: entity.width,
                height: entity.height,
                transform: [
                  { rotate: `${entity.rotation || 0}rad` },
                  { scale: entity.scale || 1 },
                ],
                opacity: entity.opacity || 1,
              },
            ]}
          >
            {entity.type === 'player' ? (
              <Animated.View style={{ transform: [{ scale: playerScale }] }}>
                <Image source={IMAGES.CHARACTERS.PICKLE} style={styles.entitySprite} resizeMode="contain" />
              </Animated.View>
            ) : entity.type === 'obstacle' ? (
              <Image source={spriteHelpers.getObstacleSprite(entity.spriteKey || 'knife')} style={styles.entitySprite} resizeMode="contain" />
            ) : (
              <Animated.View style={{ transform: [{ scale: coinGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }] }}>
                <Image source={spriteHelpers.getCollectibleSprite(entity.spriteKey || 'coin')} style={styles.entitySprite} resizeMode="contain" />
              </Animated.View>
            )}
          </Animated.View>
        ))}

        {/* Particle Effects */}
        {particles.map((particle, index) => renderParticle(particle, index))}
      </Animated.View>

      {/* UI Overlays */}
      {!gameStarted && !gameOver && (
        <View style={styles.startScreen}>
          <Text style={styles.title}>{currentLevel.name}</Text>
          <Text style={styles.subtitle}>Tap to Start!</Text>
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverScreen}>
          <Text style={styles.title}>Game Over!</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.score}>Coins: {coins}</Text>
          <Text style={styles.subtitle}>Tap to Restart</Text>
        </View>
      )}

      {gameStarted && !gameOver && (
        <View style={styles.hud}>
          <View style={styles.hudLeft}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Animated.View style={{ opacity: coinGlow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }}>
              <Text style={styles.coinText}>Coins: {coins}</Text>
            </Animated.View>
            {showDebug && (
              <Text style={styles.debugText}>FPS: {fps}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugButtonText}>🐛</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  gameContainer: {
    flex: 1,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B4513',
  },
  foregroundLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  foregroundImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.2,
  },
  entity: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entitySprite: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  startScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  score: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hud: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coinText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  debugText: {
    fontSize: 12,
    color: '#FFFF00',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  debugButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
});