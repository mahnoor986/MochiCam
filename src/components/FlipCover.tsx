// camera flip transition. the prototype rotates the preview in 3d, but android draws the camera on its own
// surface that ignores view transforms, so instead a plum cover fades over the preview while a flip icon
// turns in 3d. the camera switches while the cover is fully opaque, hiding android's black frame.
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { color, radius } from '@/theme';

export const FLIP_IN_MS = 200;
const HOLD_MS = 300;
const OUT_MS = 250;
const ease = Easing.inOut(Easing.ease);

/** bump `flips` to play it once */
export function FlipCover({ flips }: { flips: number }) {
  const cover = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (!flips) return;
    cover.value = withSequence(
      withTiming(1, { duration: FLIP_IN_MS, easing: ease }),
      withTiming(1, { duration: HOLD_MS }),
      withTiming(0, { duration: OUT_MS, easing: ease }),
    );
    spin.value = 0;
    spin.value = withTiming(1, { duration: FLIP_IN_MS + HOLD_MS, easing: ease });
  }, [flips, cover, spin]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 600 }, { rotateY: `${spin.value * 180}deg` }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.cover, coverStyle]}>
      <Animated.View style={[styles.badge, iconStyle]}>
        <Icon name="flip" size={34} color={color.white} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: { backgroundColor: '#3A2A35', alignItems: 'center', justifyContent: 'center', paddingBottom: '40%' },
  badge: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    boxShadow: 'inset 0px 0px 0px 1px rgba(255,255,255,0.35)',
  },
});
