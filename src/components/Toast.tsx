// one global toast: useToast()('saved to your gallery!')
import { usePathname } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heart } from '@/components/Heart';
import { color, layout, motion, radius, shadow, springEase, type } from '@/theme';

type ShowToast = (message: string, holdMs?: number) => void;

const Ctx = createContext<ShowToast>(() => {});
export const useToast = () => useContext(Ctx);

// distance from the bottom of the screen, per the prototype (it sits above the camera sheet there)
function offsetFor(path: string) {
  if (path.startsWith('/camera')) return 262;
  if (path.startsWith('/strip')) return 120;
  return 100;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null);
  const hideT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const t = useSharedValue(0);

  const show = useCallback<ShowToast>((text, holdMs = motion.toast.holdMs) => {
    clearTimeout(hideT.current);
    setMsg((m) => ({ text, n: (m?.n ?? 0) + 1 }));
    hideT.current = setTimeout(() => {
      t.value = withTiming(0, { duration: 200 });
    }, holdMs);
  }, [t]);

  useEffect(() => {
    if (!msg) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 320, easing: springEase });
  }, [msg, t]);

  useEffect(() => () => clearTimeout(hideT.current), []);

  const anim = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 1.6),
    transform: [
      { translateY: (1 - t.value) * motion.toast.rise },
      { scale: motion.toast.fromScale + (1 - motion.toast.fromScale) * t.value },
    ],
  }));

  // prototype offsets include the 24dp gesture bar; swap that for the real inset
  const bottom = offsetFor(path) - 24 + insets.bottom;

  return (
    <Ctx.Provider value={show}>
      {children}
      <View pointerEvents="none" style={[styles.wrap, { bottom }]}>
        {msg && (
          <Animated.View style={[styles.toast, anim]} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Heart size={18} />
            <Text style={styles.text} numberOfLines={1}>
              {msg.text}
            </Text>
          </Animated.View>
        )}
      </View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  toast: {
    height: layout.toast,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: radius.pill,
    backgroundColor: color.white,
    boxShadow: shadow.glow,
  },
  text: { ...type.toast, color: color.plum, includeFontPadding: false },
});
