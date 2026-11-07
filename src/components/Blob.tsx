// soft organic background blob. recreates the prototype's border-radius "morph" keyframes
// (42% 58% 63% 37% / 41% 44% 56% 59%  <->  58% 42% 38% 62% / 55% 60% 40% 45%) as an svg path.
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/useReducedMotion';

const APath = Animated.createAnimatedComponent(Path);

// corner radii [tlH, tlV, trH, trV, brH, brV, blH, blV] in a 100×100 box
const A = [42, 41, 58, 44, 63, 56, 37, 59];
const B = [58, 55, 42, 60, 38, 40, 62, 45];

function blobPath(t: number) {
  'worklet';
  const r = (i: number) => A[i] + (B[i] - A[i]) * t;
  const [tlh, tlv, trh, trv, brh, brv, blh, blv] = [r(0), r(1), r(2), r(3), r(4), r(5), r(6), r(7)];
  return (
    `M${tlh} 0A${trh} ${trv} 0 0 1 100 ${trv}` +
    `A${brh} ${brv} 0 0 1 ${100 - brh} 100` +
    `A${blh} ${blv} 0 0 1 0 ${100 - blv}` +
    `A${tlh} ${tlv} 0 0 1 ${tlh} 0Z`
  );
}

type Props = {
  fill: string;
  /** full morph cycle in ms (prototype: 9000 on splash, 10000 on home) */
  duration?: number;
  /** 0..1, where in the cycle this blob starts */
  phase?: number;
  /** position + size; give it a width and aspectRatio: 1 */
  style?: StyleProp<ViewStyle>;
};

export function Blob({ fill, duration = 9000, phase = 0, style }: Props) {
  const reduced = useReducedMotion();
  const t = useSharedValue(phase);

  useEffect(() => {
    if (reduced) return;
    const half = duration / 2;
    // finish the current half-cycle from `phase`, then ping-pong forever
    t.value = withTiming(1, { duration: half * (1 - phase), easing: Easing.inOut(Easing.ease) }, () => {
      t.value = withRepeat(withTiming(0, { duration: half, easing: Easing.inOut(Easing.ease) }), -1, true);
    });
  }, [reduced, duration, phase, t]);

  const props = useAnimatedProps(() => ({ d: blobPath(t.value) }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <APath animatedProps={props} fill={fill} />
      </Svg>
    </Animated.View>
  );
}
