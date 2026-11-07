// white bottom sheet over a plum scrim; slides up on the prototype's spring. render it conditionally.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, radius, shadow, springEase, useLayout } from '@/theme';

type Props = { onClose: () => void; children: ReactNode; label: string };

export function BottomSheet({ onClose, children, label }: Props) {
  const insets = useSafeAreaInsets();
  const { gutter } = useLayout();
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={StyleSheet.absoluteFill}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="close" />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.duration(420).easing(springEase)}
        exiting={SlideOutDown.duration(260).easing(Easing.in(Easing.ease))}
        accessibilityViewIsModal
        accessibilityLabel={label}
        style={[styles.sheet, { paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(107,74,94,0.3)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    gap: 14,
    backgroundColor: color.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    boxShadow: shadow.lift,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 5, backgroundColor: color.line },
});
