// hearts that float up from a point: useHearts()({ x, y }, 12). no origin = middle of the screen.
// prototype floatUp: 1.6s, rise 190, drift ±60, rotate ±30, stagger 0–250ms.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Heart } from '@/components/Heart';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { color, motion } from '@/theme';

type Point = { x: number; y: number };
type Spawn = (from?: Point, count?: number) => void;
type Particle = { key: string; size: number; fill: string; dx: number; rot: number; delay: number };
type Burst = { id: number; at: Point; parts: Particle[] };

const COLORS = [color.pinkDeep, color.pink, color.lavDeep, color.mintDeep, color.butterDeep];
const { durationMs, rise, drift } = motion.hearts;
const ease = Easing.bezier(0.2, 0.7, 0.3, 1);

const Ctx = createContext<Spawn>(() => {});
export const useHearts = () => useContext(Ctx);

function FloatingHeart({ p }: { p: Particle }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(p.delay, withTiming(1, { duration: durationMs, easing: ease }));
  }, [p.delay, t]);

  const style = useAnimatedStyle(() => {
    const v = t.value;
    if (v < 0.15) {
      const k = v / 0.15;
      return {
        opacity: k,
        transform: [{ translateX: p.dx * 0.2 * k }, { translateY: -24 * k }, { scale: 0.3 + 0.7 * k }],
      };
    }
    const k = (v - 0.15) / 0.85;
    return {
      opacity: 1 - k,
      transform: [
        { translateX: p.dx * (0.2 + 0.8 * k) },
        { translateY: -24 - (rise - 24) * k },
        { scale: 1 - 0.15 * k },
        { rotate: `${p.rot * k}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.heart,
        { marginLeft: -p.size / 2, marginTop: -p.size / 2, filter: 'drop-shadow(0px 3px 6px rgba(255,143,191,0.4))' },
        style,
      ]}
    >
      <Heart size={p.size} fill={p.fill} />
    </Animated.View>
  );
}

let burstId = 0;

export function FloatingHeartsProvider({ children }: { children: ReactNode }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();

  const spawn = useCallback<Spawn>(
    (from, count = motion.hearts.count) => {
      if (reduced) return;
      const id = ++burstId;
      const at = from ?? { x: width / 2, y: height * 0.7 };
      const parts = Array.from({ length: count }, (_, i) => ({
        key: `${id}-${i}`,
        size: 14 + Math.random() * 16,
        fill: COLORS[i % COLORS.length],
        dx: Math.random() * drift * 2 - drift,
        rot: Math.random() * 60 - 30,
        delay: Math.random() * 250,
      }));
      setBursts((b) => [...b, { id, at, parts }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), durationMs + 500);
    },
    [reduced, width, height],
  );

  return (
    <Ctx.Provider value={spawn}>
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {bursts.map((b) => (
          <View key={b.id} style={[styles.origin, { left: b.at.x, top: b.at.y }]}>
            {b.parts.map((p) => (
              <FloatingHeart key={p.key} p={p} />
            ))}
          </View>
        ))}
      </View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  origin: { position: 'absolute', width: 0, height: 0 },
  heart: { position: 'absolute', left: 0, top: 0 },
});
