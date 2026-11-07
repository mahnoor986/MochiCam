import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { SPARK_P } from '@/components/shapes';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Props = {
  x: DimensionValue;
  y: DimensionValue;
  size: number;
  fill: string;
  /** seconds, like the prototype's animation-delay */
  delay?: number;
};

/** a 4-point twinkle, absolutely positioned inside its parent */
export function Sparkle({ x, y, size, fill, delay = 0 }: Props) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      t.value = 1;
      return;
    }
    t.value = withDelay(
      delay * 1000,
      withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [reduced, delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * t.value,
    transform: [{ scale: 0.6 + 0.4 * t.value }, { rotate: `${25 * t.value}deg` }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x, top: y }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={SPARK_P} fill={fill} />
      </Svg>
    </Animated.View>
  );
}
