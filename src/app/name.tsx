// "what should we call you?" — first launch, and later from the pencil on home (?edit=1)
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Heart } from '@/components/Heart';
import { Mochi } from '@/components/Mochi';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { Squishable } from '@/components/Squishable';
import { useToast } from '@/components/Toast';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { displayName, useApp } from '@/state/AppState';
import { color, radius, shadow, type } from '@/theme';

const PICKS = ['sara', 'bestie', 'sunshine'];
const MAX = 14;

function BeatingHeart() {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    // beat keyframes: 1 → 1.22 at 15% → 1 at 30%, rest until 1.6s
    s.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 240, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 240, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 1120 }),
      ),
      -1,
    );
  }, [reduced, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={[styles.heart, style]} pointerEvents="none">
      <Heart size={22} />
    </Animated.View>
  );
}

export default function Name() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const app = useApp();
  const toast = useToast();
  const [draft, setDraft] = useState(edit ? app.name : '');
  const [focused, setFocused] = useState(false);
  const name = displayName(draft);

  const save = () => {
    if (!name) return;
    app.setName(name);
    if (edit && router.canGoBack()) router.back();
    else router.replace('/home');
    toast(edit ? `hi again, ${name}! ✨` : `nice to meet you, ${name}!`);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <Screen top={0} bottom={0}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grow} />
          <View style={styles.mochi}>
            <View style={styles.bubble}>
              <Text style={[type.title, styles.plum, styles.center]}>what should we call you? ♡</Text>
              <View style={styles.tail} />
            </View>
            <Mochi size={130} bob />
          </View>

          <View>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              maxLength={MAX}
              placeholder="type your name"
              placeholderTextColor="#C9B2BE"
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={save}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              selectionColor={color.pinkDeep}
              cursorColor={color.pinkDeep}
              accessibilityLabel="your name"
              style={[styles.input, focused && styles.inputFocus]}
            />
            <BeatingHeart />
          </View>

          <View style={styles.picks}>
            <Text style={[type.caption, styles.sub]}>quick picks</Text>
            {PICKS.map((n) => (
              <Squishable
                key={n}
                onPress={() => setDraft(n)}
                style={styles.pick}
                accessibilityRole="button"
                accessibilityLabel={n}
              >
                <Text style={styles.pickText}>{n}</Text>
              </Squishable>
            ))}
          </View>

          <Text style={[type.body, styles.sub, styles.center]}>
            we&apos;ll say <Text style={styles.preview}>hi, {name || '…'}! ✨</Text>
          </Text>

          <View style={styles.grow} />
          <PillButton xl label="that's me! ✨" disabled={!name} onPress={save} />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.cream },
  content: { flexGrow: 1, gap: 16, paddingTop: 12, paddingBottom: 16 },
  grow: { flexGrow: 1 },
  mochi: { alignItems: 'center', gap: 6 },
  bubble: {
    backgroundColor: color.white,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: radius.card,
    boxShadow: shadow.soft,
    maxWidth: 290,
  },
  tail: {
    position: 'absolute',
    left: '50%',
    bottom: -9,
    width: 20,
    height: 20,
    marginLeft: -10,
    backgroundColor: color.white,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: color.line,
    backgroundColor: color.white,
    paddingLeft: 26,
    paddingRight: 56,
    ...type.buttonLg,
    lineHeight: undefined,
    color: color.plum,
  },
  inputFocus: { borderColor: color.pink, boxShadow: '0px 0px 0px 6px rgba(255,183,213,0.3)' },
  heart: { position: 'absolute', right: 22, top: 0, bottom: 0, justifyContent: 'center' },
  picks: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pick: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: color.lavSoft,
    justifyContent: 'center',
  },
  pickText: { ...type.caption, fontSize: 14, color: color.plum },
  preview: { fontFamily: 'Nunito_800ExtraBold', color: color.plum },
  plum: { color: color.plum },
  sub: { color: color.plumSoft },
  center: { textAlign: 'center' },
});
