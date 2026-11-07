// light haptics for the shutter, countdown ticks and saves. never throws (web, no vibrator, etc).
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const safe = (p: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  p().catch(() => {});
};

export const haptic = {
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  tick: () => safe(() => Haptics.selectionAsync()),
  saved: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
