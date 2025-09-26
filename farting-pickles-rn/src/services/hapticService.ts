// Haptic Feedback Service - Enhanced tactile game experience
// Provides contextual haptic feedback for different game events

import * as Haptics from 'expo-haptics';
import { useSettingsStore } from './gameStore';

export type HapticEvent =
  | 'jump'
  | 'collect_coin'
  | 'collect_beans'
  | 'collect_fart'
  | 'collision'
  | 'level_complete'
  | 'game_over'
  | 'button_press'
  | 'achievement'
  | 'level_unlock';

class HapticService {
  private enabled = true;

  constructor() {
    // Check if device supports haptics
    this.checkHapticSupport();
  }

  private async checkHapticSupport(): Promise<boolean> {
    try {
      // Test if haptics are supported
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch (error) {
      console.log('Haptics not supported on this device');
      this.enabled = false;
      return false;
    }
  }

  public async triggerHaptic(event: HapticEvent): Promise<void> {
    // Check if haptics are enabled in settings
    const settings = useSettingsStore.getState();
    if (!settings.vibrationEnabled || !this.enabled) {
      return;
    }

    try {
      switch (event) {
        case 'jump':
          // Light tap for jumping - feels responsive
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'collect_coin':
          // Gentle success feedback for coins
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'collect_beans':
          // Medium feedback for beans (worth more)
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'collect_fart':
          // Strong feedback for fart power-ups (highest value)
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        case 'collision':
          // Strong negative feedback for crashes
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case 'level_complete':
          // Positive completion feedback
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Add a secondary celebratory vibration
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 100);
          break;

        case 'game_over':
          // Strong game over feedback
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case 'button_press':
          // Light feedback for UI interactions
          await Haptics.selectionAsync();
          break;

        case 'achievement':
          // Special pattern for achievements
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }, 150);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }, 300);
          break;

        case 'level_unlock':
          // Exciting unlock sequence
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 100);
          setTimeout(async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 200);
          break;

        default:
          // Default light feedback
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      // Silently handle haptic errors - device might not support specific feedback types
      console.log('Haptic feedback error:', error);
    }
  }

  // Complex haptic patterns
  public async triggerJumpSequence(): Promise<void> {
    if (!this.enabled) return;

    const settings = useSettingsStore.getState();
    if (!settings.vibrationEnabled) return;

    try {
      // Light tap for jump initiation
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Subtle feedback pattern for fart effect
      setTimeout(async () => {
        await Haptics.selectionAsync();
      }, 50);
    } catch (error) {
      console.log('Jump sequence haptic error:', error);
    }
  }

  public async triggerCrashSequence(): Promise<void> {
    if (!this.enabled) return;

    const settings = useSettingsStore.getState();
    if (!settings.vibrationEnabled) return;

    try {
      // Strong initial impact
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Follow-up impacts to simulate crash
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 100);

      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 200);
    } catch (error) {
      console.log('Crash sequence haptic error:', error);
    }
  }

  public async triggerCollectionCombo(itemsCollected: number): Promise<void> {
    if (!this.enabled || itemsCollected <= 1) return;

    const settings = useSettingsStore.getState();
    if (!settings.vibrationEnabled) return;

    try {
      // Escalating feedback for combo collections
      for (let i = 0; i < Math.min(itemsCollected, 5); i++) {
        setTimeout(async () => {
          const intensity = i < 2 ?
            Haptics.ImpactFeedbackStyle.Light :
            i < 4 ?
            Haptics.ImpactFeedbackStyle.Medium :
            Haptics.ImpactFeedbackStyle.Heavy;

          await Haptics.impactAsync(intensity);
        }, i * 100);
      }
    } catch (error) {
      console.log('Collection combo haptic error:', error);
    }
  }

  // Continuous feedback for sustained actions
  public async startContinuousHaptic(): Promise<void> {
    // For special power-ups or sustained effects
    if (!this.enabled) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Continuous haptic error:', error);
    }
  }

  public stopContinuousHaptic(): void {
    // Stop any ongoing haptic patterns
    // Note: Expo Haptics doesn't have a stop method, but we can track state
  }

  // Utility methods
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled && useSettingsStore.getState().vibrationEnabled;
  }

  public async testHaptic(): Promise<boolean> {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get device haptic capabilities
  public getCapabilities(): {
    impact: boolean;
    notification: boolean;
    selection: boolean;
  } {
    // Note: Expo doesn't provide capability detection, so we assume basic support
    return {
      impact: this.enabled,
      notification: this.enabled,
      selection: this.enabled,
    };
  }
}

// Export singleton instance
export const hapticService = new HapticService();

// React hook for components
export function useHapticFeedback() {
  return {
    triggerHaptic: hapticService.triggerHaptic.bind(hapticService),
    triggerJumpSequence: hapticService.triggerJumpSequence.bind(hapticService),
    triggerCrashSequence: hapticService.triggerCrashSequence.bind(hapticService),
    triggerCollectionCombo: hapticService.triggerCollectionCombo.bind(hapticService),
    isEnabled: hapticService.isEnabled.bind(hapticService),
    testHaptic: hapticService.testHaptic.bind(hapticService),
  };
}