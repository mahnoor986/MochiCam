import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Squishable } from '@/components/Squishable';
import { tintStyle, type Filter } from '@/lib/filters';
import { color, layout, radius, shadow, type } from '@/theme';

// a tiny pastel "selfie" so each chip previews its filter (grey version for soft b&w)
function Sample({ gray }: { gray: boolean }) {
  const [a, b, cheek] = gray ? ['#E6E2E4', '#F4F2F3', '#D4CFD2'] : ['#FFE1EC', '#FFF6D6', color.pink];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 50 50">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={a} />
          <Stop offset="1" stopColor={b} />
        </LinearGradient>
      </Defs>
      <Rect width="50" height="50" fill="url(#bg)" />
      <Ellipse cx="25" cy="50" rx="17" ry="13" fill="rgba(255,255,255,0.8)" />
      <Circle cx="25" cy="26" r="10" fill="rgba(255,255,255,0.85)" />
      <Ellipse cx="20" cy="29" rx="2" ry="1.2" fill={cheek} />
      <Ellipse cx="30" cy="29" rx="2" ry="1.2" fill={cheek} />
    </Svg>
  );
}

type Props = { filter: Filter; selected: boolean; onPress: () => void };

export const CHIP_WIDTH = 64;

export function FilterChip({ filter, selected, onPress }: Props) {
  return (
    <Squishable
      onPress={onPress}
      style={styles.chip}
      accessibilityRole="button"
      accessibilityLabel={`${filter.name} filter`}
      accessibilityState={{ selected }}
    >
      <View style={[styles.ring, selected && styles.ringOn]}>
        <View style={styles.inner}>
          <Sample gray={filter.id === 'bw'} />
          <View style={[StyleSheet.absoluteFill, tintStyle(filter.tint)]} />
        </View>
      </View>
      <Text style={[styles.label, selected && { color: color.plum }]} numberOfLines={2}>
        {filter.name}
      </Text>
    </Squishable>
  );
}

const styles = StyleSheet.create({
  chip: { width: CHIP_WIDTH, alignItems: 'center', gap: 5 },
  ring: { width: layout.chip, height: layout.chip, borderRadius: radius.pill, padding: 3 },
  ringOn: { backgroundColor: color.pinkDeep, boxShadow: shadow.glow },
  inner: {
    flex: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: color.white,
    backgroundColor: color.white,
  },
  label: { ...type.micro, lineHeight: 13, textAlign: 'center', color: color.plumSoft },
});
