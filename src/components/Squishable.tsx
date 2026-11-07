import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from '@/theme';

const APressable = Animated.createAnimatedComponent(Pressable);
const { pressScale, pressMs, spring } = motion.squish;

export type SquishableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

/** every tappable thing in mochicam: scales to 0.92 on press, springs back on release */
export function Squishable({ style, onPressIn, onPressOut, disabled, ...rest }: SquishableProps) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <APressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!reduced) scale.value = withTiming(pressScale, { duration: pressMs });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, spring);
        onPressOut?.(e);
      }}
      style={[style, animated]}
    />
  );
}
