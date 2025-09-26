// Level Selection Screen - Choose your farting adventure!
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { usePlayerStore } from '../services/gameStore';
import { IMAGES } from '../constants/assets';
import { GAME_LEVELS } from '../constants/gameData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LevelSelectionScreenProps {
  onLevelSelect: (levelId: number) => void;
  onBack: () => void;
}

export default function LevelSelectionScreen({ onLevelSelect, onBack }: LevelSelectionScreenProps) {
  const playerStore = usePlayerStore();

  const getLevelBackgroundImage = (levelId: number) => {
    switch (levelId) {
      case 0: return IMAGES.BACKGROUNDS.BG00;
      case 1: return IMAGES.BACKGROUNDS.BG01;
      case 2: return IMAGES.BACKGROUNDS.BG02;
      case 3: return IMAGES.BACKGROUNDS.BG03;
      default: return IMAGES.BACKGROUNDS.BG00;
    }
  };

  const getLevelPreviewImage = (levelId: number) => {
    switch (levelId) {
      case 0: return IMAGES.UI.LEVEL00;
      case 1: return IMAGES.UI.LEVEL01;
      case 2: return IMAGES.UI.LEVEL02;
      case 3: return IMAGES.UI.LEVEL03;
      default: return IMAGES.UI.LEVEL00;
    }
  };

  const isLevelUnlocked = (levelId: number) => {
    return levelId < playerStore.levelsUnlocked;
  };

  const getLevelScore = (levelId: number) => {
    // In a full implementation, we'd track high scores per level
    // For now, return the overall high score for unlocked levels
    return isLevelUnlocked(levelId) ? playerStore.highScore : 0;
  };

  const getMedalType = (score: number) => {
    if (score >= 100) return 'gold';
    if (score >= 50) return 'silver';
    if (score >= 10) return 'bronze';
    return null;
  };

  const getMedalImage = (medalType: string | null) => {
    switch (medalType) {
      case 'gold': return IMAGES.UI.GOLD;
      case 'silver': return IMAGES.UI.SILVER;
      case 'bronze': return IMAGES.UI.BRONCE;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image source={IMAGES.BACKGROUNDS.BG00} style={styles.background} resizeMode="cover" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Level</Text>
        <View style={styles.spacer} />
      </View>

      {/* Level Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.levelGrid}>
        {GAME_LEVELS.map((level) => {
          const isUnlocked = isLevelUnlocked(level.id);
          const levelScore = getLevelScore(level.id);
          const medalType = getMedalType(levelScore);
          const medalImage = getMedalImage(medalType);

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                !isUnlocked && styles.levelCardLocked
              ]}
              onPress={() => isUnlocked && onLevelSelect(level.id)}
              disabled={!isUnlocked}
            >
              {/* Level Preview Background */}
              <Image
                source={getLevelBackgroundImage(level.id)}
                style={styles.levelCardBackground}
                resizeMode="cover"
              />

              {/* Level Preview Image */}
              <Image
                source={getLevelPreviewImage(level.id)}
                style={styles.levelPreview}
                resizeMode="contain"
              />

              {/* Lock Overlay */}
              {!isUnlocked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockText}>
                    Score {level.id * 25} to unlock
                  </Text>
                </View>
              )}

              {/* Level Info */}
              <View style={styles.levelInfo}>
                <Text style={styles.levelName}>{level.name}</Text>

                {isUnlocked && (
                  <View style={styles.levelStats}>
                    <Text style={styles.levelScore}>
                      Best: {levelScore}
                    </Text>

                    {medalImage && (
                      <Image source={medalImage} style={styles.medal} resizeMode="contain" />
                    )}
                  </View>
                )}
              </View>

              {/* Star Rating (based on score) */}
              {isUnlocked && (
                <View style={styles.starContainer}>
                  {[1, 2, 3].map((star) => (
                    <Text
                      key={star}
                      style={[
                        styles.star,
                        levelScore >= star * 33 ? styles.starFilled : styles.starEmpty
                      ]}
                    >
                      ⭐
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Player Stats */}
      <View style={styles.playerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>High Score</Text>
          <Text style={styles.statValue}>{playerStore.highScore}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Coins</Text>
          <Text style={styles.statValue}>{playerStore.totalCoins}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Games Played</Text>
          <Text style={styles.statValue}>{playerStore.gamesPlayed}</Text>
        </View>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  spacer: {
    width: 60, // Balance the back button
  },
  scrollView: {
    flex: 1,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  levelCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  levelCardLocked: {
    borderColor: '#666666',
    opacity: 0.6,
  },
  levelCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  levelPreview: {
    width: '100%',
    height: 80,
    marginTop: 10,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  lockText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  levelInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelScore: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  medal: {
    width: 24,
    height: 24,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  star: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  starFilled: {
    opacity: 1,
  },
  starEmpty: {
    opacity: 0.3,
  },
  playerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});