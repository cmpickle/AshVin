// Hybrid Game Screen - Enhanced SimpleGameScreen with multiple obstacles and collectibles
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
import { GAME_CONFIG } from '../constants/gameConfig';
import { IMAGES } from '../constants/assets';
import { OBSTACLE_CONFIGS, COLLECTIBLE_CONFIGS } from '../constants/gameData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Player {
  x: number;
  y: number;
  velocityY: number;
  size: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: keyof typeof OBSTACLE_CONFIGS;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: keyof typeof COLLECTIBLE_CONFIGS;
  value: number;
}

export default function HybridGameScreen() {
  // Store hooks
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: SCREEN_HEIGHT * 0.5,
    velocityY: 0,
    size: 48,
  });

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [nextObstacleId, setNextObstacleId] = useState(0);
  const [nextCollectibleId, setNextCollectibleId] = useState(1000);

  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);
  const lastCollectibleSpawnRef = useRef(0);

  // Game constants
  const GRAVITY = 0.8;
  const JUMP_POWER = -15;
  const GROUND_Y = SCREEN_HEIGHT * (1 - GAME_CONFIG.GROUND_HEIGHT_RATIO);
  const OBSTACLE_SPEED = 4;

  // Obstacle types array for random selection
  const OBSTACLE_TYPES = Object.keys(OBSTACLE_CONFIGS) as Array<keyof typeof OBSTACLE_CONFIGS>;
  const COLLECTIBLE_TYPES = Object.keys(COLLECTIBLE_CONFIGS) as Array<keyof typeof COLLECTIBLE_CONFIGS>;

  useEffect(() => {
    if (gameStarted && !gameOver) {
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

  const startGameLoop = () => {
    const gameLoop = () => {
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
          setGameOver(true);
          return newPlayer;
        }

        return newPlayer;
      });

      // Update obstacles
      setObstacles(prevObstacles => {
        let newObstacles = prevObstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - OBSTACLE_SPEED,
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
          setGameOver(true);
        }

        return newObstacles;
      });

      // Update collectibles
      setCollectibles(prevCollectibles => {
        let newCollectibles = prevCollectibles.map(collectible => ({
          ...collectible,
          x: collectible.x - OBSTACLE_SPEED,
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

      // Spawn obstacles
      const now = Date.now();
      if (now - lastSpawnRef.current > 2500) { // Every 2.5 seconds
        spawnRandomObstacle();
        lastSpawnRef.current = now;
        setScore(prev => prev + 1);
      }

      // Spawn collectibles (less frequently)
      if (now - lastCollectibleSpawnRef.current > 4000) { // Every 4 seconds
        if (Math.random() < 0.7) { // 70% chance
          spawnRandomCollectible();
        }
        lastCollectibleSpawnRef.current = now;
      }

      if (!gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnRandomObstacle = () => {
    const randomType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const config = OBSTACLE_CONFIGS[randomType];

    setObstacles(prev => [...prev, {
      id: nextObstacleId,
      x: SCREEN_WIDTH,
      y: GROUND_Y - config.height,
      width: config.width,
      height: config.height,
      type: randomType,
    }]);
    setNextObstacleId(prev => prev + 1);
  };

  const spawnRandomCollectible = () => {
    const randomType = COLLECTIBLE_TYPES[Math.floor(Math.random() * COLLECTIBLE_TYPES.length)];
    const config = COLLECTIBLE_CONFIGS[randomType];

    setCollectibles(prev => [...prev, {
      id: nextCollectibleId,
      x: SCREEN_WIDTH,
      y: Math.random() * (GROUND_Y - 150) + 100, // Random height in playable area
      width: config.width,
      height: config.height,
      type: randomType,
      value: config.value,
    }]);
    setNextCollectibleId(prev => prev + 1);
  };

  const jump = () => {
    if (!gameStarted) {
      startNewGame();
      return;
    }

    if (gameOver) {
      restartGame();
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
    setScore(0);
    setCoins(0);
    setObstacles([]);
    setCollectibles([]);
    setPlayer({
      x: 100,
      y: SCREEN_HEIGHT * 0.5,
      velocityY: 0,
      size: 48,
    });
    gameStore.startGame(0);
  };

  const restartGame = () => {
    // Update player stats before restart
    playerStore.updateHighScore(score);
    playerStore.addTotalCoins(coins);
    playerStore.incrementGamesPlayed();
    playerStore.checkAchievements(score, playerStore.totalCoins + coins);

    startNewGame();
  };

  const getObstacleSprite = (type: keyof typeof OBSTACLE_CONFIGS) => {
    switch (type) {
      case 'chainsaw': return IMAGES.CHAINSAW;
      case 'knife': return IMAGES.KNIFE;
      case 'laser': return IMAGES.LASER;
      case 'picklejars': return IMAGES.PICKLE_JARS;
      case 'sun': return IMAGES.SUNBEAM;
      case 'surfboard': return IMAGES.SURFBOARD;
      case 'woodlog': return IMAGES.LOG_FULL;
      default: return IMAGES.KNIFE;
    }
  };

  const getCollectibleSprite = (type: keyof typeof COLLECTIBLE_CONFIGS) => {
    switch (type) {
      case 'coin': return IMAGES.COIN;
      case 'beans': return IMAGES.BEANS;
      case 'fart': return IMAGES.FART;
      default: return IMAGES.COIN;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={jump} activeOpacity={1}>
      {/* Background */}
      <Image source={IMAGES.BG00} style={styles.background} resizeMode="cover" />

      {/* Ground */}
      <View style={[styles.ground, { top: GROUND_Y }]} />
      <Image
        source={IMAGES.FG00}
        style={[styles.foreground, { top: GROUND_Y }]}
        resizeMode="cover"
      />

      {/* Player */}
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
          <Image source={IMAGES.PICKLE} style={styles.playerSprite} resizeMode="contain" />
        </View>
      )}

      {/* Obstacles */}
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

      {/* Collectibles */}
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

      {/* UI */}
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