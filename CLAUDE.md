# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
"Farting Pickles" is a legacy Android game built in Java that mimics Flappy Bird gameplay. The project uses Android SDK 25 with Gradle build system and includes both free (ad-supported) and paid versions.

## Build Commands
```bash
# Build the project (from legacy/ directory)
cd legacy && ./gradlew build

# Build release APK
cd legacy && ./gradlew assembleRelease

# Build debug APK
cd legacy && ./gradlew assembleDebug

# Clean build artifacts
cd legacy && ./gradlew clean

# Run tests
cd legacy && ./gradlew test
```

## Architecture Overview

### Core Game Components
- **MainActivity**: Entry point with splash screen, handles audio settings and level progress
- **Game**: Main game activity that manages gameplay, ads, sound effects, and game state
- **GameView**: Custom view that handles the game rendering loop and touch input
- **Sprite**: Base class for all game objects with collision detection, movement, and rendering

### Game Object Hierarchy
```
Sprite (abstract base)
├── PlayableCharacter (player pickle)
├── Obstacle (base for hazards)
│   ├── Chainsaw, Knife, Laser
│   ├── PickleJars, Sun, SurfBoard, WoodLog
├── PowerUp (collectibles)
├── Coin, Beans, Fart
├── Background, Foreground
└── UI elements (PauseButton, Tutorial)
```

### Database Layer
- Uses DBFlow ORM for local storage
- **FartingDatabase**: Main database configuration
- **Score**: Stores game progress, coins, medals, unlocked levels
- **Achievements**: Tracks player accomplishments

### Product Flavors
- **freeWithAds**: Free version with Google Ads integration
- **paid**: Premium version without ads

## Development Notes

### Key Constants
- `Game.PAID_VERSION`: Controls ad display
- `Game.DEV_MODE`: Enables development features (extra coins)
- `Game.GAMES_PER_AD`: Frequency of interstitial ads (3 games)

### Audio System
- **MediaPlayer**: Background music (looping fart song)
- **SoundPool**: Sound effects (farts, crashes, coins)
- Global volume control via `MainActivity.volume`

### Collision Detection
- Region-based collision system in Sprite class
- Radius-based collision for circular objects
- Edge detection for ground/sky boundaries

### Memory Management
- Manual bitmap recycling in GameView cleanup
- View unbinding in Game.onDestroy()
- Explicit nullification of static references

### Dependencies
- Google Play Services (Ads)
- Crashlytics (crash reporting)
- DBFlow (database ORM)
- ButterKnife (view binding)
- Stetho (debug inspection)

## File Structure
```
legacy/app/src/main/java/com/pickle/ashvin/
├── MainActivity.java           # App entry point
├── Game.java                  # Main game logic
├── GameView.java              # Game rendering
├── SelectLevelActivity.java   # Level selection
├── db/                        # Database models
├── sprites/                   # Game objects
│   ├── Sprite.java           # Base sprite class
│   ├── PlayableCharacter.java
│   ├── Obstacle/             # All hazard types
│   └── [other sprites]
└── [dialogs and utilities]
```

## Legacy Status
This project is archived and all source files are marked for deletion in git. The codebase uses older Android APIs and build tools that may require updates for modern development.