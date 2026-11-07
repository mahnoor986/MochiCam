// page shell: cream background, safe areas, side gutter and the "fade + 10 rise" enter animation
import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, withTiming, type EntryExitAnimationFunction } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, motion, useLayout } from '@/theme';

const { rise, ms } = motion.screenEnter;

export const screenEnter: EntryExitAnimationFunction = () => {
  'worklet';
  const cfg = { duration: ms, easing: Easing.out(Easing.ease) };
  return {
    initialValues: { opacity: 0, transform: [{ translateY: rise }] },
    animations: { opacity: withTiming(1, cfg), transform: [{ translateY: withTiming(0, cfg) }] },
  };
};

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** extra space under the status bar / above the gesture bar */
  top?: number;
  bottom?: number;
};

export function Screen({ children, style, top = 12, bottom = 12 }: Props) {
  const insets = useSafeAreaInsets();
  const { gutter } = useLayout();
  return (
    <Animated.View
      entering={screenEnter}
      style={[
        {
          flex: 1,
          backgroundColor: color.cream,
          paddingTop: insets.top + top,
          paddingBottom: insets.bottom + bottom,
          paddingHorizontal: gutter,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
