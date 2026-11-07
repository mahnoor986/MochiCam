import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { CLOUD_P } from '@/components/shapes';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { color } from '@/theme';

type Props = {
  width: number;
  /** full drift cycle in ms (-6 → +10 → -6); omit for a still cloud */
  drift?: number;
  reverse?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Cloud({ width, drift, reverse, style }: Props) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reverse ? 1 : 0);

  useEffect(() => {
    if (!drift || reduced) return;
    t.value = withRepeat(
      withTiming(reverse ? 0 : 1, { duration: drift / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [drift, reverse, reduced, t]);

  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: -6 + 16 * t.value }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ filter: 'drop-shadow(0px 4px 8px rgba(107,74,94,0.08))' }, style, anim]}
    >
      <Svg width={width} height={width * 0.625} viewBox="0 0 64 40">
        <Path d={CLOUD_P} fill={color.white} />
      </Svg>
    </Animated.View>
  );
}
