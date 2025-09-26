// Enhanced Game Screen - Full game engine integration
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useGameStore, usePlayerStore, useSettingsStore } from '../services/gameStore';
// Temporarily use simplified imports until full engine is ready
// import { GameEngine } from '../game/engine/GameEngine';
// import { Player } from '../game/entities/Player';
import { GAME_CONFIG } from '../constants/gameConfig';
import { IMAGES } from '../constants/assets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GameEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  spriteKey?: string;
  obstacleType?: string;
  collectibleType?: string;
  isActive: boolean;
}

export default function EnhancedGameScreen() {
  // Store hooks
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const settingsStore = useSettingsStore();

  // Game state
  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);

  // Game engine
  const gameEngineRef = useRef<GameEngine | null>(null);
  const playerRef = useRef<Player | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const animationRef = useRef<number>();

  // Initialize game engine
  useEffect(() => {
    const gameEngine = new GameEngine();
    gameEngineRef.current = gameEngine;

    // Create player
    const player = new Player({
      x: GAME_CONFIG.PLAYER_START_X || 100,
      y: SCREEN_HEIGHT * 0.6,
    });
    playerRef.current = player;

    // Add player to engine
    gameEngine.entityManager.addEntity(player);

    // Set up game callbacks
    gameEngine.onScoreChange = (newScore: number) => {
      setScore(newScore);
      gameStore.increaseScore(newScore - score);
    };

    gameEngine.onCoinsChange = (newCoins: number) => {
      setCoins(newCoins);
      gameStore.addCoins(newCoins - coins);
    };

    gameEngine.onGameOver = () => {
      setGameOver(true);
      setGameStarted(false);
      gameStore.endGame();

      // Update player stats
      playerStore.updateHighScore(score);
      playerStore.addTotalCoins(coins);
      playerStore.incrementGamesPlayed();

      // Check achievements
      playerStore.checkAchievements(score, playerStore.totalCoins + coins);
    };

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gameEngine.destroy();
    };
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameEngineRef.current || !gameStarted || gameOver) return;

    const now = performance.now();
    const deltaTime = now - lastUpdateRef.current;
    lastUpdateRef.current = now;

    // Update game engine
    gameEngineRef.current.update(deltaTime);

    // Get all entities for rendering
    const allEntities = gameEngineRef.current.entityManager.getAllEntities();
    const renderEntities: GameEntity[] = allEntities
      .filter(entity => entity.isActive)
      .map(entity => ({
        id: entity.id,
        type: entity.type,
        x: entity.x,
        y: entity.y,
        width: entity.width,
        height: entity.height,
        spriteKey: entity.spriteKey,
        obstacleType: (entity as any).obstacleType,
        collectibleType: (entity as any).collectibleType,
        isActive: entity.isActive,
      }));

    setEntities(renderEntities);

    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, score, coins]);

  // Start game loop when game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      lastUpdateRef.current = performance.now();
      gameLoop();
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
  }, [gameStarted, gameOver, gameLoop]);

  // Handle input
  const handleTap = () => {
    if (!gameStarted && !gameOver) {
      // Start game
      startNewGame();
    } else if (gameOver) {
      // Restart game
      restartGame();
    } else if (playerRef.current) {
      // Jump
      playerRef.current.requestJump();
    }
  };

  const startNewGame = () => {
    if (!gameEngineRef.current) return;

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCoins(0);
    setEntities([]);

    gameStore.startGame(0);
    gameEngineRef.current.startGame();

    // Reset player
    if (playerRef.current) {
      playerRef.current.reset();
    }
  };

  const restartGame = () => {
    if (!gameEngineRef.current) return;

    gameEngineRef.current.resetGame();
    startNewGame();
  };

  // Render sprite for entity
  const renderEntitySprite = (entity: GameEntity) => {
    let imageSource;
    let style = {};

    switch (entity.type) {
      case 'player':
        imageSource = IMAGES.PICKLE;
        style = styles.playerSprite;
        break;
      case 'obstacle':
        switch (entity.obstacleType) {
          case 'chainsaw':
            imageSource = IMAGES.CHAINSAW;
            break;
          case 'knife':
            imageSource = IMAGES.KNIFE;
            break;
          case 'laser':
            imageSource = IMAGES.LASER;
            break;
          case 'picklejars':
            imageSource = IMAGES.PICKLE_JARS;
            break;
          case 'sun':
            imageSource = IMAGES.SUNBEAM;
            break;
          case 'surfboard':
            imageSource = IMAGES.SURFBOARD;
            break;
          case 'woodlog':
            imageSource = IMAGES.LOG_FULL;
            break;
          default:
            imageSource = IMAGES.KNIFE;
        }
        style = styles.obstacleSprite;
        break;
      case 'collectible':
        switch (entity.collectibleType) {
          case 'coin':
            imageSource = IMAGES.COIN;
            break;
          case 'beans':
            imageSource = IMAGES.BEANS;
            break;
          case 'fart':
            imageSource = IMAGES.FART;
            break;
          default:
            imageSource = IMAGES.COIN;
        }
        style = styles.collectibleSprite;
        break;
      default:
        return <Text style={styles.fallbackText}>?</Text>;
    }

    return (
      <Image
        source={imageSource}
        style={[
          style,
          {
            width: entity.width,
            height: entity.height,
          },
        ]}
        resizeMode="contain"
      />
    );
  };

  const groundY = SCREEN_HEIGHT * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);

  return (
    <TouchableOpacity style={styles.container} onPress={handleTap} activeOpacity={1}>
      {/* Background */}
      <Image source={IMAGES.BG00} style={styles.background} resizeMode="cover" />

      {/* Ground */}
      <View style={[styles.ground, { top: groundY }]} />
      <Image
        source={IMAGES.FG00}
        style={[styles.foreground, { top: groundY }]}
        resizeMode="cover"
      />

      {/* Game Entities */}
      {entities.map(entity => (
        <View
          key={entity.id}
          style={[
            styles.entity,
            {
              left: entity.x,
              top: entity.y,
              width: entity.width,
              height: entity.height,
            },
          ]}
        >
          {renderEntitySprite(entity)}
        </View>
      ))}

      {/* UI Overlays */}
      {!gameStarted && !gameOver && (
        <View style={styles.startScreen}>
          <Text style={styles.title}>🥒 Farting Pickles 💨</Text>
          <Text style={styles.subtitle}>Tap to Start!</Text>
          <Text style={styles.highScore}>High Score: {playerStore.highScore}</Text>
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
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.coinText}>Coins: {coins}</Text>
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
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8B4513',
  },
  foreground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * GAME_CONFIG.GROUND_HEIGHT_RATIO,
  },
  entity: {
    position: 'absolute',
  },
  playerSprite: {
    flex: 1,
  },
  obstacleSprite: {
    flex: 1,
  },
  collectibleSprite: {
    flex: 1,
  },
  fallbackText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
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
    marginBottom: 10,
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
  highScore: {
    fontSize: 18,
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hud: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});