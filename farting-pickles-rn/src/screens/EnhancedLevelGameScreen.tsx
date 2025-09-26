// Enhanced Level Game Screen - Multi-level gameplay with difficulty scaling
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useGameStore, usePlayerStore } from '../services/gameStore';
import { IMAGES } from '../constants/assets';
import { OBSTACLE_CONFIGS, COLLECTIBLE_CONFIGS, GAME_LEVELS } from '../constants/gameData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LevelPlayer {
  x: number;
  y: number;
  velocityY: number;
  size: number;
}

interface LevelObstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: keyof typeof OBSTACLE_CONFIGS;
}

interface LevelCollectible {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: keyof typeof COLLECTIBLE_CONFIGS;
  value: number;
}

interface EnhancedLevelGameScreenProps {
  levelId: number;
  onGameComplete: (score: number, coins: number, completed: boolean) => void;
  onBackToLevelSelect: () => void;
}

export default function EnhancedLevelGameScreen({
  levelId,
  onGameComplete,
  onBackToLevelSelect
}: EnhancedLevelGameScreenProps) {
  // Store hooks
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Level data
  const currentLevel = GAME_LEVELS[levelId] || GAME_LEVELS[0];

  // Game entities
  const [player, setPlayer] = useState<LevelPlayer>({
    x: 100,
    y: SCREEN_HEIGHT * 0.5,
    velocityY: 0,
    size: 48,
  });

  const [obstacles, setObstacles] = useState<LevelObstacle[]>([]);
  const [collectibles, setCollectibles] = useState<LevelCollectible[]>([]);

  // Game timing and difficulty
  const [gameTime, setGameTime] = useState(0);
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1.0);

  // Refs for unique IDs and timing
  const obstacleIdRef = useRef(0);
  const collectibleIdRef = useRef(1000);
  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);
  const lastCollectibleSpawnRef = useRef(0);
  const gameStartTimeRef = useRef(0);

  // Obstacle and collectible type arrays
  const OBSTACLE_TYPES = Object.keys(OBSTACLE_CONFIGS) as Array<keyof typeof OBSTACLE_CONFIGS>;
  const COLLECTIBLE_TYPES = Object.keys(COLLECTIBLE_CONFIGS) as Array<keyof typeof COLLECTIBLE_CONFIGS>;

  // Game constants with level-based modifications
  const GRAVITY = 0.8;
  const JUMP_POWER = -15;
  const GROUND_Y = SCREEN_HEIGHT * 0.8;
  const BASE_OBSTACLE_SPEED = 4 + (levelId * 0.5); // Faster on higher levels
  const BASE_SPAWN_RATE = Math.max(1500, 2500 - (levelId * 200)); // More frequent spawning on higher levels

  useEffect(() => {
    if (gameStarted && !gameOver && !showPauseMenu) {
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
  }, [gameStarted, gameOver, showPauseMenu]);

  const startGameLoop = () => {
    const gameLoop = () => {
      const now = Date.now();
      const currentGameTime = now - gameStartTimeRef.current;
      setGameTime(currentGameTime);

      // Update difficulty over time
      const timeDifficultyMultiplier = 1.0 + Math.floor(currentGameTime / 30000) * 0.3; // Increase every 30 seconds
      setDifficultyMultiplier(timeDifficultyMultiplier);

      // Update player physics
      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };

        // Apply gravity
        newPlayer.velocityY += GRAVITY;
        newPlayer.y += newPlayer.velocityY;

        // Ground collision
        if (newPlayer.y + newPlayer.size >= GROUND_Y) {
          newPlayer.y = GROUND_Y - newPlayer.size;
          newPlayer.velocityY = 0;
        }

        // Death conditions
        if (newPlayer.y <= 0 || newPlayer.y >= SCREEN_HEIGHT) {
          handleGameOver();
          return newPlayer;
        }

        return newPlayer;
      });

      // Update obstacles
      setObstacles(prevObstacles => {
        const currentSpeed = BASE_OBSTACLE_SPEED * difficultyMultiplier;
        let newObstacles = prevObstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - currentSpeed,
        })).filter(obstacle => obstacle.x + obstacle.width > 0);

        // Check collisions
        const playerRect = {
          x: player.x,
          y: player.y,
          width: player.size,
          height: player.size,
        };

        const collision = newObstacles.some(obstacle => {
          return (
            playerRect.x < obstacle.x + obstacle.width &&
            playerRect.x + playerRect.width > obstacle.x &&
            playerRect.y < obstacle.y + obstacle.height &&
            playerRect.y + playerRect.height > obstacle.y
          );
        });

        if (collision) {
          handleGameOver();
        }

        return newObstacles;
      });

      // Update collectibles
      setCollectibles(prevCollectibles => {
        const currentSpeed = BASE_OBSTACLE_SPEED * difficultyMultiplier;
        let newCollectibles = prevCollectibles.map(collectible => ({
          ...collectible,
          x: collectible.x - currentSpeed,
        })).filter(collectible => collectible.x + collectible.width > 0);

        // Check collectible collisions
        const playerRect = {
          x: player.x,
          y: player.y,
          width: player.size,
          height: player.size,
        };

        newCollectibles = newCollectibles.filter(collectible => {
          const collected = (
            playerRect.x < collectible.x + collectible.width &&
            playerRect.x + playerRect.width > collectible.x &&
            playerRect.y < collectible.y + collectible.height &&
            playerRect.y + playerRect.height > collectible.y
          );

          if (collected) {
            setCoins(prev => prev + collectible.value);
            return false; // Remove collected item
          }
          return true;
        });

        return newCollectibles;
      });

      // Spawn obstacles and collectibles
      const adjustedSpawnRate = BASE_SPAWN_RATE / difficultyMultiplier;
      if (now - lastSpawnRef.current > adjustedSpawnRate) {
        spawnRandomObstacle();
        lastSpawnRef.current = now;
        setScore(prev => prev + 1);

        // Check for level completion (score-based)
        if (score + 1 >= 100 + (levelId * 50)) { // Level completion thresholds
          handleLevelComplete();
          return;
        }
      }

      // Spawn collectibles
      if (now - lastCollectibleSpawnRef.current > 4000 / difficultyMultiplier) {
        if (Math.random() < 0.7) {
          spawnRandomCollectible();
        }
        lastCollectibleSpawnRef.current = now;
      }

      if (!gameOver && !gameCompleted) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnRandomObstacle = () => {
    const randomType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const config = OBSTACLE_CONFIGS[randomType];

    const newId = obstacleIdRef.current;
    obstacleIdRef.current += 1;

    setObstacles(prev => [...prev, {
      id: newId,
      x: SCREEN_WIDTH,
      y: GROUND_Y - config.height,
      width: config.width,
      height: config.height,
      type: randomType,
    }]);
  };

  const spawnRandomCollectible = () => {
    const randomType = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
    const config = COLLECTIBLE_CONFIGS[randomType];

    const newId = collectibleIdRef.current;
    collectibleIdRef.current += 1;

    setCollectibles(prev => [...prev, {
      id: newId,
      x: SCREEN_WIDTH,
      y: Math.random() * (GROUND_Y - 150) + 100,
      width: config.width,
      height: config.height,
      type: randomType,
      value: config.value,
    }]);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);

    // Update player stats
    playerStore.updateHighScore(score);
    playerStore.addTotalCoins(coins);
    playerStore.incrementGamesPlayed();
    playerStore.checkAchievements(score, playerStore.totalCoins + coins);

    onGameComplete(score, coins, false);
  };

  const handleLevelComplete = () => {
    setGameCompleted(true);
    setGameStarted(false);

    // Unlock next level
    if (levelId + 1 < GAME_LEVELS.length) {
      playerStore.unlockLevel(levelId + 1);
    }

    // Update stats with completion bonus
    const completionBonus = 50;
    setCoins(prev => prev + completionBonus);
    playerStore.updateHighScore(score);
    playerStore.addTotalCoins(coins + completionBonus);
    playerStore.incrementGamesPlayed();
    playerStore.checkAchievements(score, playerStore.totalCoins + coins + completionBonus);

    onGameComplete(score, coins + completionBonus, true);
  };

  const jump = () => {
    if (!gameStarted && !gameOver && !gameCompleted) {
      startNewGame();
      return;
    }

    if (gameOver || gameCompleted) {
      onBackToLevelSelect();
      return;
    }

    setPlayer(prev => ({
      ...prev,
      velocityY: JUMP_POWER,
    }));
  };

  const startNewGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameCompleted(false);
    setScore(0);
    setCoins(0);
    setGameTime(0);
    setDifficultyMultiplier(1.0);
    setObstacles([]);
    setCollectibles([]);

    // Reset ID counters
    obstacleIdRef.current = 0;
    collectibleIdRef.current = 1000;
    gameStartTimeRef.current = Date.now();

    setPlayer({
      x: 100,
      y: SCREEN_HEIGHT * 0.5,
      velocityY: 0,
      size: 48,
    });

    gameStore.startGame(levelId);
  };

  const togglePause = () => {
    setShowPauseMenu(!showPauseMenu);
  };

  // Get level-specific backgrounds
  const getLevelBackground = () => {
    switch (currentLevel.background) {
      case 'BG00': return IMAGES.BACKGROUNDS.BG00;
      case 'BG01': return IMAGES.BACKGROUNDS.BG01;
      case 'BG02': return IMAGES.BACKGROUNDS.BG02;
      case 'BG03': return IMAGES.BACKGROUNDS.BG03;
      default: return IMAGES.BACKGROUNDS.BG00;
    }
  };

  const getLevelForeground = () => {
    switch (currentLevel.foreground) {
      case 'FG00': return IMAGES.BACKGROUNDS.FG00;
      case 'FG01': return IMAGES.BACKGROUNDS.FG01;
      case 'FG03': return IMAGES.BACKGROUNDS.FG03;
      default: return IMAGES.BACKGROUNDS.FG00;
    }
  };

  // Sprite helper functions
  const getObstacleSprite = (type: keyof typeof OBSTACLE_CONFIGS) => {
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
  };

  const getCollectibleSprite = (type: keyof typeof COLLECTIBLE_CONFIGS) => {
    switch (type) {
      case 'coin': return IMAGES.COLLECTIBLES.COIN;
      case 'beans': return IMAGES.COLLECTIBLES.BEANS;
      case 'fart': return IMAGES.COLLECTIBLES.FART;
      default: return IMAGES.COLLECTIBLES.COIN;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={jump} activeOpacity={1}>
      {/* Level-specific Background */}
      <Image source={getLevelBackground()} style={styles.background} resizeMode="cover" />

      {/* Ground */}
      <View style={[styles.ground, { top: GROUND_Y }]} />
      <Image
        source={getLevelForeground()}
        style={[styles.foreground, { top: GROUND_Y }]}
        resizeMode="cover"
      />

      {/* Game Entities */}
      {gameStarted && (
        <View
          style={[
            styles.player,
            {
              left: player.x,
              top: player.y,
              width: player.size,
              height: player.size,
            },
          ]}
        >
          <Image source={IMAGES.CHARACTERS.PICKLE} style={styles.playerSprite} resizeMode="contain" />
        </View>
      )}

      {obstacles.map(obstacle => (
        <View
          key={obstacle.id}
          style={[
            styles.obstacle,
            {
              left: obstacle.x,
              top: obstacle.y,
              width: obstacle.width,
              height: obstacle.height,
            },
          ]}
        >
          <Image
            source={getObstacleSprite(obstacle.type)}
            style={styles.obstacleSprite}
            resizeMode="contain"
          />
        </View>
      ))}

      {collectibles.map(collectible => (
        <View
          key={collectible.id}
          style={[
            styles.collectible,
            {
              left: collectible.x,
              top: collectible.y,
              width: collectible.width,
              height: collectible.height,
            },
          ]}
        >
          <Image
            source={getCollectibleSprite(collectible.type)}
            style={styles.collectibleSprite}
            resizeMode="contain"
          />
        </View>
      ))}

      {/* UI Overlays */}
      {!gameStarted && !gameOver && !gameCompleted && (
        <View style={styles.startScreen}>
          <Text style={styles.title}>{currentLevel.name}</Text>
          <Text style={styles.subtitle}>Tap to Start!</Text>
          <Text style={styles.levelGoal}>Goal: Score {100 + (levelId * 50)} to complete</Text>
          <TouchableOpacity style={styles.backToLevelsButton} onPress={onBackToLevelSelect}>
            <Text style={styles.backToLevelsText}>← Level Select</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameCompleted && (
        <View style={styles.gameCompletedScreen}>
          <Text style={styles.title}>Level Complete! 🎉</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.score}>Coins: {coins} (+50 bonus)</Text>
          <Text style={styles.subtitle}>Tap to Continue</Text>
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverScreen}>
          <Text style={styles.title}>Game Over!</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.score}>Coins: {coins}</Text>
          <Text style={styles.subtitle}>Tap to Return</Text>
        </View>
      )}

      {gameStarted && !gameOver && !gameCompleted && (
        <View style={styles.hud}>
          <View style={styles.hudLeft}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.coinText}>Coins: {coins}</Text>
            <Text style={styles.levelText}>{currentLevel.name}</Text>
          </View>
          <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
            <Text style={styles.pauseButtonText}>⏸️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pause Menu */}
      {showPauseMenu && (
        <View style={styles.pauseMenu}>
          <Text style={styles.pauseTitle}>Game Paused</Text>
          <TouchableOpacity style={styles.pauseOption} onPress={togglePause}>
            <Text style={styles.pauseOptionText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pauseOption} onPress={onBackToLevelSelect}>
            <Text style={styles.pauseOptionText}>Level Select</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Styles remain similar to SimpleGameScreen but with level-specific additions
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
    height: SCREEN_HEIGHT * 0.2,
  },
  player: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerSprite: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  obstacle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacleSprite: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  collectible: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectibleSprite: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  gameCompletedScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 100, 0, 0.9)',
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
  levelGoal: {
    fontSize: 18,
    color: '#FFFF00',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  backToLevelsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
  },
  backToLevelsText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelText: {
    fontSize: 16,
    color: '#CCCCCC',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    fontSize: 20,
    textAlign: 'center',
  },
  pauseMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 40,
  },
  pauseOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 200,
  },
  pauseOptionText: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});