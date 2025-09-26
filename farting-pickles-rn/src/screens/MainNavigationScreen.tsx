// Main Navigation Screen - Hub for the complete Farting Pickles experience
import React, { useState } from 'react';
import { View } from 'react-native';

// Import all screens
import LevelSelectionScreen from './LevelSelectionScreen';
import EnhancedLevelGameScreen from './EnhancedLevelGameScreen';
import SimpleGameScreen from './SimpleGameScreen'; // Keep as fallback/arcade mode
import MainMenuScreen from './MainMenuScreen';

type NavigationState =
  | { screen: 'main-menu' }
  | { screen: 'level-select' }
  | { screen: 'arcade-mode' }
  | { screen: 'level-game'; levelId: number };

export default function MainNavigationScreen() {
  const [navigation, setNavigation] = useState<NavigationState>({ screen: 'main-menu' });

  const handleLevelSelect = (levelId: number) => {
    setNavigation({ screen: 'level-game', levelId });
  };

  const handleGameComplete = (score: number, coins: number, completed: boolean) => {
    // Game completed, return to level select
    setNavigation({ screen: 'level-select' });
  };

  const handleBackToLevelSelect = () => {
    setNavigation({ screen: 'level-select' });
  };

  const handleBackToMainMenu = () => {
    setNavigation({ screen: 'main-menu' });
  };

  const handleStartArcadeMode = () => {
    setNavigation({ screen: 'arcade-mode' });
  };

  const handleShowLevelSelect = () => {
    setNavigation({ screen: 'level-select' });
  };

  switch (navigation.screen) {
    case 'main-menu':
      return (
        <MainMenuScreen
          onStartArcade={handleStartArcadeMode}
          onShowLevels={handleShowLevelSelect}
        />
      );

    case 'level-select':
      return (
        <LevelSelectionScreen
          onLevelSelect={handleLevelSelect}
          onBack={handleBackToMainMenu}
        />
      );

    case 'arcade-mode':
      return <SimpleGameScreen />;

    case 'level-game':
      return (
        <EnhancedLevelGameScreen
          levelId={navigation.levelId}
          onGameComplete={handleGameComplete}
          onBackToLevelSelect={handleBackToLevelSelect}
        />
      );

    default:
      return (
        <MainMenuScreen
          onStartArcade={handleStartArcadeMode}
          onShowLevels={handleShowLevelSelect}
        />
      );
  }
}