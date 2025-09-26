// Main Menu Screen - Welcome to Farting Pickles!
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { usePlayerStore } from '../services/gameStore';
import { IMAGES } from '../constants/assets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MainMenuScreenProps {
  onStartArcade: () => void;
  onShowLevels: () => void;
}

export default function MainMenuScreen({ onStartArcade, onShowLevels }: MainMenuScreenProps) {
  const playerStore = usePlayerStore();

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image source={IMAGES.UI.SPLASH} style={styles.background} resizeMode="cover" />

      {/* Main Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>🥒 FARTING</Text>
        <Text style={styles.mainTitle}>PICKLES 💨</Text>
        <Text style={styles.subtitle}>React Native Edition</Text>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={onShowLevels}>
          <Text style={styles.menuButtonText}>🏆 Adventure Mode</Text>
          <Text style={styles.menuButtonSubtext}>Play through levels</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={onStartArcade}>
          <Text style={styles.menuButtonText}>⚡ Arcade Mode</Text>
          <Text style={styles.menuButtonSubtext}>Endless gameplay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
          <Text style={styles.menuButtonText}>🏅 Achievements</Text>
          <Text style={styles.menuButtonSubtext}>View your progress</Text>
        </TouchableOpacity>
      </View>

      {/* Player Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>High Score</Text>
          <Text style={styles.statValue}>{playerStore.highScore}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Coins</Text>
          <Text style={styles.statValue}>{playerStore.totalCoins}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Games Played</Text>
          <Text style={styles.statValue}>{playerStore.gamesPlayed}</Text>
        </View>
      </View>

      {/* Floating Pickle Character */}
      <View style={styles.floatingPickle}>
        <Image source={IMAGES.CHARACTERS.PICKLE} style={styles.pickleImage} resizeMode="contain" />
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>v1.0.0 - React Native Port</Text>
        <Text style={styles.versionText}>Based on the original Android game</Text>
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
  titleContainer: {
    marginTop: 80,
    alignItems: 'center',
    marginBottom: 50,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
  },
  menuButtonSubtext: {
    fontSize: 14,
    color: '#654321',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
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
  floatingPickle: {
    position: 'absolute',
    right: 30,
    top: 200,
    width: 80,
    height: 80,
  },
  pickleImage: {
    width: '100%',
    height: '100%',
  },
  versionInfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});