// mochi, our original bunny mascot. ported 1:1 from bunny() in design/mochicam.html.
// the ears are separate svg layers so they can wiggle from their base on the ui thread.
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { color, motion } from '@/theme';

export type MochiMood = 'happy' | 'wink' | 'sleep';

type Props = {
  size?: number;
  mood?: MochiMood;
  /** idle bob + ear wiggle (splash, permissions, name, home hero) */
  bob?: boolean;
  style?: StyleProp<ViewStyle>;
};

const P = color.plum;
const VB = '0 0 120 120';
const ease = Easing.inOut(Easing.ease);

function Ear({ side }: { side: 'l' | 'r' }) {
  const l = side === 'l';
  const x = l ? 34 : 66;
  return (
    <G transform={l ? 'rotate(-10 44 52)' : 'rotate(12 76 52)'}>
      <Rect x={x} y={6} width={20} height={52} rx={10} fill={color.white} stroke={P} strokeWidth={3} />
      <Rect x={x + 5.5} y={14} width={9} height={34} rx={4.5} fill={color.pink} />
    </G>
  );
}

function Face({ mood }: { mood: MochiMood }) {
  return (
    <>
      <Ellipse cx={60} cy={111} rx={30} ry={4.5} fill={P} opacity={0.08} />
      <Ellipse cx={60} cy={75} rx={40} ry={33} fill={color.white} stroke={P} strokeWidth={3} />
      {mood === 'sleep' ? (
        <Path d="M39 70q7 6 14 0M67 70q7 6 14 0" stroke={P} strokeWidth={3} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <Ellipse cx={46} cy={70} rx={4.2} ry={5} fill={P} />
          <Circle cx={47.6} cy={68} r={1.5} fill={color.white} />
          {mood === 'wink' ? (
            <Path d="M68 71q6-6 12 0" stroke={P} strokeWidth={3} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <Ellipse cx={74} cy={70} rx={4.2} ry={5} fill={P} />
              <Circle cx={75.6} cy={68} r={1.5} fill={color.white} />
            </>
          )}
        </>
      )}
      <Ellipse cx={35} cy={82} rx={7} ry={4.5} fill={color.pink} opacity={0.9} />
      <Ellipse cx={85} cy={82} rx={7} ry={4.5} fill={color.pink} opacity={0.9} />
      {mood === 'sleep' ? (
        <Ellipse cx={60} cy={83} rx={2.6} ry={2} fill={P} />
      ) : (
        <Path
          d="M54 80q3 4 6 0q3 4 6 0"
          stroke={P}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* butter sparkle clip on the right ear */}
      <Path
        d="M86 34q2 7 9 9q-7 2-9 9q-2-7-9-9q7-2 9-9z"
        fill={color.butterDeep}
        stroke={P}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </>
  );
}

// ear wiggle keyframes from the prototype (wigL / wigR), as [rotation, ms] steps over 3.6s
const T = motion.mascot.earMs;
const wiggle = (hold: number, steps: [number, number][]) =>
  withRepeat(
    withSequence(
      withDelay(hold * T, withTiming(steps[0][0], { duration: steps[0][1] * T, easing: ease })),
      ...steps.slice(1).map(([deg, f]) => withTiming(deg, { duration: f * T, easing: ease })),
    ),
    -1,
  );

export function Mochi({ size = 120, mood = 'happy', bob = false, style }: Props) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  const earL = useSharedValue(0);
  const earR = useSharedValue(0);
  const animate = bob && !reduced;

  useEffect(() => {
    if (!animate) {
      [y, earL, earR].forEach((v) => {
        cancelAnimation(v);
        v.value = 0;
      });
      return;
    }
    const half = motion.mascot.bobMs / 2;
    y.value = withRepeat(
      withSequence(
        withTiming(-motion.mascot.bob, { duration: half, easing: ease }),
        withTiming(0, { duration: half, easing: ease }),
      ),
      -1,
    );
    earL.value = wiggle(0.78, [[-12, 0.06], [5, 0.08], [0, 0.08]]);
    earR.value = withDelay(200, wiggle(0.8, [[12, 0.06], [-4, 0.08], [0, 0.06]]));
  }, [animate, y, earL, earR]);

  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const earLStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${earL.value}deg` }] }));
  const earRStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${earR.value}deg` }] }));

  return (
    <Animated.View
      style={[{ width: size, height: size }, bobStyle, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* pivots sit at the bottom-centre of each ear: (44,58) and (76,58) in the 120 viewBox */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.pivotL, earLStyle]}>
        <Svg width={size} height={size} viewBox={VB}>
          <Ear side="l" />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.pivotR, earRStyle]}>
        <Svg width={size} height={size} viewBox={VB}>
          <Ear side="r" />
        </Svg>
      </Animated.View>
      <View style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size} viewBox={VB}>
          <Face mood={mood} />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pivotL: { transformOrigin: '36.667% 48.333%' },
  pivotR: { transformOrigin: '63.333% 48.333%' },
});
