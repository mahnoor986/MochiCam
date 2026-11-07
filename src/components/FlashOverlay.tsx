import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { color, motion } from '@/theme';

/** white camera flash: bump `shot` to fire it. 0 → 1 (12%) → 0, 500ms or 800ms when bright */
export function FlashOverlay({ shot, bright }: { shot: number; bright: boolean }) {
  const o = useSharedValue(0);
  const brightRef = useRef(bright);
  brightRef.current = bright;

  useEffect(() => {
    if (!shot) return;
    const total = brightRef.current ? motion.flashOnMs : motion.flashMs;
    o.value = withSequence(
      withTiming(1, { duration: total * 0.12 }),
      withTiming(0, { duration: total * 0.88, easing: Easing.out(Easing.ease) }),
    );
  }, [shot, o]);

  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, style]} />;
}

const styles = StyleSheet.create({ flash: { backgroundColor: color.white } });
