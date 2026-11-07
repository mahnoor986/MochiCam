import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { color, motion, type } from '@/theme';

// cdPop: 0.2 → 1.22 (40%) → 0.9 (60%) → 1.05 (78%) → 1 over 720ms; fades in by 40%
const [k0, k1, k2, k3, k4] = motion.countdown.keyframes;
const ms = motion.countdown.popMs;
const ease = Easing.inOut(Easing.ease);

function Pop({ text, small }: { text: string; small: boolean }) {
  const s = useSharedValue<number>(k0);
  const o = useSharedValue(0);

  useEffect(() => {
    o.value = withTiming(1, { duration: ms * 0.4 });
    s.value = withSequence(
      withTiming(k1, { duration: ms * 0.4, easing: ease }),
      withTiming(k2, { duration: ms * 0.2, easing: ease }),
      withTiming(k3, { duration: ms * 0.18, easing: ease }),
      withTiming(k4, { duration: ms * 0.22, easing: ease }),
    );
  }, [o, s]);

  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }] }));

  return (
    <Animated.View style={style}>
      {/* react native allows one text shadow per text, so the soft pink glow is a second copy underneath */}
      <Text
        style={[styles.cd, styles.glow, small && styles.small, small && styles.glowSmall]}
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        {text}
      </Text>
      <Text style={[styles.cd, small && styles.small]} accessibilityLiveRegion="assertive">
        {text}
      </Text>
    </Animated.View>
  );
}

/** big bouncing 3-2-1, then "say cheese ♡". `value` null hides it. */
export function Countdown({ value, style }: { value: string | null; style?: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      {value ? <Pop key={value} text={value} small={!/^\d+$/.test(value)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  cd: {
    ...type.countdown,
    color: color.white,
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: color.pinkDeep,
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 1,
  },
  small: { fontSize: 64, lineHeight: 72, textShadowOffset: { width: 0, height: 4 } },
  // prototype: 0 0 50px rgba(255,143,191,.75) (30px on "say cheese")
  glow: {
    position: 'absolute',
    left: 0,
    right: 0,
    textShadowColor: 'rgba(255,143,191,0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  glowSmall: { textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 },
});
