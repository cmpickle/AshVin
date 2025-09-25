# Farting Pickles - React Native Migration Plan

## Phase 1: Project Setup & Architecture Foundation

### 1.1 Initialize React Native Expo Project
- [ ] Create new Expo project with TypeScript template
- [ ] Set up project structure following modern React Native patterns
- [ ] Configure development environment (ESLint, Prettier, TypeScript)
- [ ] Set up version control and initial commit

### 1.2 Modern Tech Stack Selection
**Game Engine**: React Native Game Engine or Expo GL for 2D rendering
**State Management**: Zustand (lightweight alternative to Redux)
**Storage**: AsyncStorage + MMKV for high-performance data persistence
**Audio**: expo-av for music and sound effects
**Navigation**: React Navigation v6 for screen transitions
**Animations**: React Native Reanimated v3 for smooth game animations
**Testing**: Jest + React Native Testing Library

### 1.3 Project Structure
```
src/
├── components/        # Reusable UI components
├── screens/          # Game screens (Menu, Game, Settings, etc.)
├── game/             # Core game logic
│   ├── entities/     # Game objects (Player, Obstacles, Collectibles)
│   ├── systems/      # Game systems (Physics, Collision, Audio)
│   ├── engine/       # Game loop and rendering
│   └── utils/        # Game utilities
├── services/         # External services (storage, analytics)
├── hooks/           # Custom React hooks
├── assets/          # Images, sounds, fonts
├── types/           # TypeScript type definitions
└── constants/       # Game constants and configuration
```

## Phase 2: Asset Migration & Preparation

### 2.1 Visual Assets Migration
- [ ] Extract all PNG assets from legacy/app/src/main/res/drawable-nodpi/
- [ ] Optimize images for mobile (compress, resize if needed)
- [ ] Convert sprite sheets to individual frames or keep as sheets
- [ ] Organize assets by category:
  - Characters: pickle.png, fart_pickle.png, accessories
  - Obstacles: chainsaw.png, knife.png, laser.png, etc.
  - Collectibles: coin.png, beans.png
  - Backgrounds: bg00-03.png, fg00-03.png
  - UI elements: buttons, medals, tutorial

### 2.2 Audio Assets Migration
- [ ] Extract audio files from legacy/app/src/main/res/raw/
- [ ] Convert/optimize audio formats for React Native compatibility:
  - songfart.mp3 (background music)
  - fart0-3.wav (fart sound effects)
  - crash.wav, coin.ogg, belch.mp3
- [ ] Implement audio preloading system

### 2.3 Game Configuration Data
- [ ] Extract game constants from Java classes:
  - Achievement thresholds (Bronze: 10, Silver: 50, Gold: 100)
  - Game physics constants (gravity, jump force, speeds)
  - Level configuration data
  - Collision detection parameters

## Phase 3: Core Game Architecture

### 3.1 Game State Management
- [ ] Create Zustand store for game state:
  - Player progress (score, coins, levels unlocked)
  - Game settings (sound, vibration)
  - Achievement tracking
  - Current game session data

### 3.2 Game Loop Implementation
- [ ] Implement requestAnimationFrame-based game loop
- [ ] Create update/render cycle similar to Android GameView
- [ ] Handle pause/resume functionality
- [ ] Implement fixed timestep for consistent physics

### 3.3 Entity System Architecture
- [ ] Create base Entity class (equivalent to Sprite.java)
- [ ] Implement entity lifecycle management
- [ ] Create entity pooling for performance optimization
- [ ] Implement component-based architecture for game objects

## Phase 4: Core Game Components

### 4.1 Player Character System
- [ ] Migrate PlayableCharacter logic to React Native
- [ ] Implement tap-to-jump physics
- [ ] Create animation system for character sprites
- [ ] Add accessory system (hats, sunglasses, etc.)
- [ ] Implement visual upgrades based on score

### 4.2 Obstacle System
- [ ] Create base Obstacle class
- [ ] Implement all obstacle types:
  - Chainsaw, Knife, Laser
  - PickleJars, Sun, SurfBoard, WoodLog
- [ ] Add obstacle spawning and movement logic
- [ ] Implement obstacle-specific behaviors

### 4.3 Collectibles System
- [ ] Implement Coin collection with sound effects
- [ ] Add Beans power-up functionality
- [ ] Create Fart boost mechanics
- [ ] Add collectible spawn patterns

### 4.4 Background & Environment
- [ ] Implement parallax scrolling backgrounds
- [ ] Create level-specific background themes
- [ ] Add foreground elements (ground, obstacles)
- [ ] Implement seamless background looping

## Phase 5: Game Mechanics

### 5.1 Physics System
- [ ] Implement gravity and jump physics
- [ ] Create collision detection system (circular and rectangular)
- [ ] Add boundary checking (ground/sky limits)
- [ ] Optimize collision detection for mobile performance

### 5.2 Scoring & Progression
- [ ] Implement point system for passing obstacles
- [ ] Create medal system (Bronze/Silver/Gold)
- [ ] Add coin collection and spending mechanics
- [ ] Implement level unlocking system

### 5.3 Achievement System
- [ ] Create achievement tracking infrastructure
- [ ] Implement achievements:
  - 50 coins collected
  - Score-based medals (Bronze/Silver/Gold)
  - "Super Fart" achievement
- [ ] Add achievement notifications and UI

## Phase 6: User Interface

### 6.1 Main Menu Screen
- [ ] Create splash screen with game logo
- [ ] Implement main menu with play button
- [ ] Add settings screen (sound toggle, etc.)
- [ ] Create level selection screen
- [ ] Add achievement/medal display

### 6.2 Game HUD
- [ ] Implement in-game score display
- [ ] Add pause button functionality
- [ ] Create coin counter display
- [ ] Add current level indicator

### 6.3 Game Over System
- [ ] Create game over screen with score summary
- [ ] Add medal award display
- [ ] Implement restart and menu navigation
- [ ] Add social sharing functionality (optional)

## Phase 7: Data Persistence

### 7.1 Local Storage System
- [ ] Replace DBFlow with AsyncStorage + MMKV
- [ ] Implement score persistence
- [ ] Create settings storage system
- [ ] Add achievement progress tracking
- [ ] Implement level unlock persistence

### 7.2 Data Migration Utilities
- [ ] Create data initialization scripts
- [ ] Add data validation and error handling
- [ ] Implement backup/restore functionality

## Phase 8: Audio & Effects

### 8.1 Audio System
- [ ] Implement background music playback with looping
- [ ] Create sound effects system with volume control
- [ ] Add sound pooling for performance
- [ ] Implement audio settings (mute/unmute)

### 8.2 Visual Effects
- [ ] Add particle effects for collisions
- [ ] Implement screen shake on crashes
- [ ] Create smooth transition animations
- [ ] Add visual feedback for achievements

## Phase 9: Performance & Polish

### 9.1 Performance Optimization
- [ ] Implement object pooling for sprites
- [ ] Optimize rendering with sprite batching
- [ ] Add frame rate monitoring and optimization
- [ ] Memory leak detection and prevention

### 9.2 Platform-Specific Features
- [ ] Implement haptic feedback for iOS/Android
- [ ] Add platform-specific UI adjustments
- [ ] Handle device orientation changes
- [ ] Add safe area handling for modern devices

### 9.3 Testing & Quality Assurance
- [ ] Create unit tests for game logic
- [ ] Add integration tests for game flow
- [ ] Performance testing on various devices
- [ ] User acceptance testing

## Phase 10: Deployment Preparation

### 10.1 App Configuration
- [ ] Set up app icons and splash screens
- [ ] Configure app metadata and descriptions
- [ ] Set up proper app versioning
- [ ] Create build configurations for different environments

### 10.2 Store Deployment
- [ ] Prepare for App Store and Google Play deployment
- [ ] Create app store assets (screenshots, descriptions)
- [ ] Set up analytics tracking (optional)
- [ ] Configure crash reporting (Sentry/Bugsnag)

## Implementation Notes

### Key Differences from Legacy
- **No Crashlytics**: Use Sentry or built-in Expo crash reporting
- **No DBFlow**: Use AsyncStorage + MMKV for better RN performance
- **No Google Ads**: Consider Expo AdMob or remove ads entirely
- **Modern State Management**: Zustand instead of manual state handling
- **TypeScript**: Full type safety throughout the application
- **Component Architecture**: Modern React patterns with hooks

### Development Strategy
1. **Incremental Development**: Build and test each phase independently
2. **Asset-First Approach**: Get assets working early for visual feedback
3. **Core Game Loop**: Prioritize getting basic gameplay working
4. **Polish Last**: Add visual effects and polish after core functionality
5. **Testing Throughout**: Add tests as you build each component

### Estimated Timeline
- **Phase 1-2**: 1-2 weeks (Setup & Assets)
- **Phase 3-4**: 2-3 weeks (Core Architecture & Components)
- **Phase 5-6**: 2-3 weeks (Game Mechanics & UI)
- **Phase 7-8**: 1-2 weeks (Storage & Audio)
- **Phase 9-10**: 1-2 weeks (Polish & Deployment)

**Total Estimated Time**: 7-12 weeks depending on complexity and polish level

### Success Criteria
- [ ] Game plays identically to original Android version
- [ ] Smooth 60fps performance on target devices
- [ ] All original assets and sounds integrated
- [ ] Save/load functionality working correctly
- [ ] Achievement system fully functional
- [ ] Ready for app store deployment