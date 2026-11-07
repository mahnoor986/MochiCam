import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Squishable } from '@/components/Squishable';
import type { BoothMode } from '@/lib/storage';
import { color, layout, radius, shadow, springEase, type } from '@/theme';

const PAD = 5;
const OPTIONS: { mode: BoothMode; label: string; icon: 'single' | 'strip' }[] = [
  { mode: 'single', label: 'single', icon: 'single' },
  { mode: 'four', label: '4-cut', icon: 'strip' },
];

type Props = { value: BoothMode; onChange: (m: BoothMode) => void };

/** pill segmented control with a sliding white thumb */
export function ModeToggle({ value, onChange }: Props) {
  const [w, setW] = useState(0);
  const half = (w - PAD * 2) / 2;
  const x = useSharedValue(value === 'four' ? 1 : 0);

  useEffect(() => {
    x.value = withTiming(value === 'four' ? 1 : 0, { duration: 380, easing: springEase });
  }, [value, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * half }] }));

  return (
    <View style={styles.track} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="radiogroup">
      {w > 0 && <Animated.View style={[styles.thumb, { width: half }, thumb]} />}
      {OPTIONS.map((o) => {
        const on = o.mode === value;
        const c = on ? color.plum : color.plumSoft;
        return (
          <Squishable
            key={o.mode}
            style={styles.opt}
            onPress={() => onChange(o.mode)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.label}
          >
            <Icon name={o.icon} size={20} color={c} />
            <Text style={[styles.label, { color: c }]}>{o.label}</Text>
          </Squishable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: layout.toggle,
    padding: PAD,
    borderRadius: radius.pill,
    backgroundColor: color.pinkSoft,
    flexDirection: 'row',
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: radius.pill,
    backgroundColor: color.white,
    boxShadow: `${shadow.soft}, inset 0px -3px 0px rgba(255,183,213,0.5)`,
  },
  opt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
  },
  label: { ...type.heading, fontSize: 17, lineHeight: 20, includeFontPadding: false },
});
