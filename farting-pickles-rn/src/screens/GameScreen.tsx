// Game Screen - Main game rendering and interaction
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { GameWorld } from '../game/systems/GameWorld';
import { VisualEffectSystem } from '../game/systems/VisualEffectSystem';
import { PhysicsSystem } from '../game/systems/PhysicsSystem';
import { EnhancedPlayer } from '../game/entities/EnhancedPlayer';
import { useGameStore } from '../services/gameStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const [gameWorld, setGameWorld] = useState<GameWorld | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [entities, setEntities] = useState<any[]>([]);
  const animationFrameId = useRef<number>();

  const gameStore = useGameStore();

  useEffect(() => {
    // Initialize game world
    const visualEffects = new VisualEffectSystem();

    const world = new GameWorld({
      onScoreUpdate: (newScore) => setScore(newScore),
      onCoinCollected: (newCoins) => setCoins(newCoins),
      onGameOver: (finalScore, finalCoins) => {
        setGameStarted(false);
        alert(`Game Over! Score: ${finalScore}, Coins: ${finalCoins}`);
      },
      onAchievementUnlocked: (achievement) => {
        alert(`Achievement Unlocked: ${achievement.name}`);
      },
    });

    setGameWorld(world);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      world.destroy();
    };
  }, []);

  const startGame = () => {
    if (!gameWorld) return;

    setGameStarted(true);
    setScore(0);
    setCoins(0);

    gameWorld.startGame(0);

    // Start render loop
    const renderLoop = () => {
      if (gameWorld) {
        const allEntities = gameWorld.getAllEntities();
        setEntities(allEntities);
      }
      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  };

  const handleScreenPress = () => {
    if (!gameStarted) {
      startGame();
    } else if (gameWorld) {
      // Jump action
      gameWorld.onPlayerJump();
    }
  };

  const renderEntity = (entity: any, index: number) => {
    const style = {
      position: 'absolute' as const,
      left: entity.x,
      top: entity.y,
      width: entity.width,
      height: entity.height,
    };

    let backgroundColor = '#999';
    let content = entity.type;

    switch (entity.type) {
      case 'player':
        backgroundColor = '#4CAF50';
        content = '🥒';
        break;
      case 'obstacle':
        backgroundColor = '#f44336';
        content = getObstacleEmoji(entity.obstacleType);
        break;
      case 'collectible':
        backgroundColor = '#FFD700';
        content = getCollectibleEmoji(entity.collectibleType);
        break;
    }

    return (
      <View
        key={`${entity.id}-${index}`}
        style={[
          style,
          {
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: entity.type === 'collectible' ? entity.width / 2 : 4,
          },
        ]}
      >
        <Text style={{ fontSize: entity.width / 3, textAlign: 'center' }}>
          {content}
        </Text>
      </View>
    );
  };

  const getObstacleEmoji = (type: string) => {
    switch (type) {
      case 'chainsaw': return '⚙️';
      case 'knife': return '🔪';
      case 'laser': return '🔴';
      case 'picklejars': return '🏺';
      case 'sun': return '☀️';
      case 'surfboard': return '🏄';
      case 'woodlog': return '🪵';
      default: return '❌';
    }
  };

  const getCollectibleEmoji = (type: string) => {
    switch (type) {
      case 'coin': return '🪙';
      case 'beans': return '🫘';
      case 'fart': return '💨';
      default: return '✨';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Game Area */}
      <TouchableOpacity
        style={styles.gameArea}
        onPress={handleScreenPress}
        activeOpacity={1}
      >
        {/* Sky */}
        <View style={styles.sky} />

        {/* Ground */}
        <View style={styles.ground} />

        {/* Entities */}
        {entities.map((entity, index) => renderEntity(entity, index))}

        {/* Start Screen */}
        {!gameStarted && (
          <View style={styles.startScreen}>
            <Text style={styles.title}>🥒 Farting Pickles 💨</Text>
            <Text style={styles.subtitle}>Tap to Start!</Text>
            <Text style={styles.instructions}>
              Tap anywhere to jump and avoid obstacles!
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* HUD */}
      {gameStarted && (
        <View style={styles.hud}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.coinsText}>🪙 {coins}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#87CEEB', // Sky blue
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.2,
    backgroundColor: '#8B4513', // Brown ground
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
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  hud: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  coinsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});