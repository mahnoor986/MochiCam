import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Heart } from '@/components/Heart';
import { Squishable } from '@/components/Squishable';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { color, radius, shadow, useLayout } from '@/theme';

type Props = { onPress: () => void; busy: boolean; disabled?: boolean };

/** giant pink shutter; throbs while a countdown is running */
export function ShutterButton({ onPress, busy, disabled }: Props) {
  const { shutter } = useLayout();
  const reduced = useReducedMotion();
  const s = useSharedValue(1);

  useEffect(() => {
    if (busy && !reduced) {
      const half = { duration: 450, easing: Easing.inOut(Easing.ease) };
      s.value = withRepeat(withSequence(withTiming(0.84, half), withTiming(1, half)), -1);
    } else {
      cancelAnimation(s);
      s.value = withTiming(1, { duration: 200 });
    }
  }, [busy, reduced, s]);

  const inner = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Squishable
      onPress={onPress}
      disabled={busy || disabled}
      accessibilityRole="button"
      accessibilityLabel="take photo"
      accessibilityState={{ busy, disabled: busy || disabled }}
      style={[styles.ring, { width: shutter, height: shutter }]}
    >
      <Animated.View style={[styles.inner, inner]}>
        <View style={styles.heart}>
          <Heart size={26} fill={color.white} />
        </View>
      </Animated.View>
    </Squishable>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: radius.pill,
    backgroundColor: color.white,
    padding: 6,
    boxShadow: `${shadow.glow}, 0px 0px 0px 5px rgba(255,183,213,0.5)`,
  },
  inner: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundImage: `radial-gradient(circle at 35% 30%, #FFD7E8, ${color.pink} 55%, ${color.pinkDeep})`,
  },
  heart: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
