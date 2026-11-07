import { StyleSheet, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { color, radius, springEase, type } from '@/theme';

/** small status pill ("auto-saved ✓"); pops in 250ms after mount */
export function Badge({ label, tint = color.mint }: { label: string; tint?: string }) {
  return (
    <Animated.View
      entering={ZoomIn.delay(250).duration(600).easing(springEase)}
      style={[styles.badge, { backgroundColor: tint }]}
    >
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: { height: 28, paddingHorizontal: 12, borderRadius: radius.pill, justifyContent: 'center' },
  text: { ...type.micro, fontSize: 12, lineHeight: 16, color: color.plum, includeFontPadding: false },
});
