// Simple Game Demo - Basic working version to test the setup
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SimplePlayer {
  x: number;
  y: number;
  velocityY: number;
  size: number;
}

interface SimpleObstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SimpleGameScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [player, setPlayer] = useState<SimplePlayer>({
    x: 100,
    y: SCREEN_HEIGHT * 0.5,
    velocityY: 0,
    size: 40,
  });

  const [obstacles, setObstacles] = useState<SimpleObstacle[]>([]);
  const [nextObstacleId, setNextObstacleId] = useState(0);

  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);

  // Game constants
  const GRAVITY = 0.8;
  const JUMP_POWER = -15;
  const GROUND_Y = SCREEN_HEIGHT * 0.8;
  const OBSTACLE_SPEED = 4;

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

      // Spawn obstacles
      const now = Date.now();
      if (now - lastSpawnRef.current > 2000) { // Every 2 seconds
        setObstacles(prev => [...prev, {
          id: nextObstacleId,
          x: SCREEN_WIDTH,
          y: GROUND_Y - 60,
          width: 30,
          height: 60,
        }]);
        setNextObstacleId(prev => prev + 1);
        lastSpawnRef.current = now;
        setScore(prev => prev + 1);
      }

      if (!gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setObstacles([]);
      setPlayer({
        x: 100,
        y: SCREEN_HEIGHT * 0.5,
        velocityY: 0,
        size: 40,
      });
      return;
    }

    if (gameOver) {
      // Restart game
      setGameStarted(false);
      setGameOver(false);
      return;
    }

    setPlayer(prev => ({
      ...prev,
      velocityY: JUMP_POWER,
    }));
  };

  return (
    <TouchableOpacity style={styles.container} onPress={jump} activeOpacity={1}>
      {/* Sky */}
      <View style={styles.sky} />

      {/* Ground */}
      <View style={styles.ground} />

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
          <Text style={styles.emoji}>🥒</Text>
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
          <Text style={styles.emoji}>🔪</Text>
        </View>
      ))}

      {/* UI */}
      {!gameStarted && !gameOver && (
        <View style={styles.startScreen}>
          <Text style={styles.title}>🥒 Farting Pickles 💨</Text>
          <Text style={styles.subtitle}>Tap to Start!</Text>
        </View>
      )}

      {gameOver && (
        <View style={styles.gameOverScreen}>
          <Text style={styles.title}>Game Over!</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.subtitle}>Tap to Restart</Text>
        </View>
      )}

      {gameStarted && !gameOver && (
        <View style={styles.hud}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#87CEEB',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.2,
    backgroundColor: '#8B4513',
  },
  player: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacle: {
    position: 'absolute',
    backgroundColor: '#f44336',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
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
  },
  subtitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  score: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  hud: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});