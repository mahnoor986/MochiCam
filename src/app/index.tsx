// splash: bouncing mochi, wordmark, loader dots. moves on after ~2.4s.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Blob } from '@/components/Blob';
import { Mochi } from '@/components/Mochi';
import { Sparkle } from '@/components/Sparkle';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useApp } from '@/state/AppState';
import { color, radius, springEase, type } from '@/theme';

const SPLASH_MS = 2400;

function Dot({ fill, delay }: { fill: string; delay: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    // dots keyframes: up 8 at 40%, back down by 80%, rest until 100% (1.1s)
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 440, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 440, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 220 }),
        ),
        -1,
      ),
    );
  }, [reduced, delay, t]);
  const s = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * t.value, transform: [{ translateY: -8 * t.value }] }));
  return <Animated.View style={[styles.dot, { backgroundColor: fill }, s]} />;
}

export default function Splash() {
  const { ready, firstLaunch } = useApp();
  const insets = useSafeAreaInsets();
  const [timeUp, setTimeUp] = useState(false);
  const pop = useSharedValue(0);

  useEffect(() => {
    pop.value = withTiming(1, { duration: 800, easing: springEase });
    const id = setTimeout(() => setTimeUp(true), SPLASH_MS);
    return () => clearTimeout(id);
  }, [pop]);

  useEffect(() => {
    if (ready && timeUp) router.replace(firstLaunch ? '/permissions' : '/home');
  }, [ready, timeUp, firstLaunch]);

  const popStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value),
    transform: [{ scale: 0.6 + 0.4 * pop.value }],
  }));

  return (
    <View style={styles.screen}>
      <Blob fill={color.pinkSoft} style={{ width: '62%', aspectRatio: 1, left: '-18%', top: '6%' }} />
      <Blob fill={color.lavSoft} phase={0.66} style={{ width: '54%', aspectRatio: 1, right: '-20%', top: '52%' }} />
      <Blob fill="#E6FAF1" phase={0.33} style={{ width: '30%', aspectRatio: 1, right: '6%', top: '12%' }} />
      <Sparkle x="16%" y="20%" size={20} fill={color.butterDeep} />
      <Sparkle x="80%" y="26%" size={14} fill={color.pinkDeep} delay={0.6} />
      <Sparkle x="76%" y="68%" size={22} fill={color.lavDeep} delay={1.1} />
      <Sparkle x="14%" y="64%" size={12} fill={color.mintDeep} delay={0.3} />

      <Animated.View style={[styles.center, popStyle]}>
        <Mochi size={156} bob />
        <Text style={[type.display, styles.wordmark]} accessibilityRole="header">
          mochi<Text style={{ color: color.pinkDeep }}>cam</Text>
        </Text>
        <View style={styles.tagpill}>
          <Text style={styles.tagText}>kawaii booth ♡</Text>
        </View>
      </Animated.View>

      <View style={[styles.loader, { bottom: 60 + insets.bottom }]} accessibilityLabel="loading">
        <Dot fill={color.pink} delay={0} />
        <Dot fill={color.lavender} delay={150} />
        <Dot fill={color.mint} delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: color.cream,
    backgroundImage: `radial-gradient(circle at 50% 42%, #FFEAF3 0%, ${color.cream} 62%)`,
  },
  center: { alignItems: 'center', gap: 6 },
  wordmark: { color: color.plum, marginTop: 10, letterSpacing: -0.44 },
  tagpill: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: color.butter,
    justifyContent: 'center',
  },
  tagText: { ...type.micro, fontSize: 13, lineHeight: 16, letterSpacing: 0.26, color: color.plum },
  loader: { position: 'absolute', flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
