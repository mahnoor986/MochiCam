import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Squishable } from '@/components/Squishable';
import { color, radius, springEase } from '@/theme';

type Props = { value: boolean; onChange: (v: boolean) => void; label: string };

export function Switch({ value, onChange, label }: Props) {
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    x.value = withTiming(value ? 1 : 0, { duration: 320, easing: springEase });
  }, [value, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 18 }] }));

  return (
    <Squishable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={[styles.track, value && styles.on]}
    >
      <Animated.View style={[styles.knob, knob]} />
    </Squishable>
  );
}

const styles = StyleSheet.create({
  track: { width: 46, height: 28, borderRadius: radius.pill, backgroundColor: '#EBDDE4' },
  on: { backgroundColor: color.pink },
  knob: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: color.white,
    boxShadow: '0px 2px 4px rgba(107,74,94,0.18)',
  },
});
