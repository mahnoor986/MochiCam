// "your strip!": tilted strip on a lavender stage, frame picker, date/caption toggles.
// the strip auto-saves on open; edits re-export and replace the saved copy (debounced).
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { BackHandler, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { screenEnter } from '@/components/Screen';
import { Card } from '@/components/Card';
import { FrameBackground } from '@/components/FrameBackground';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PillButton } from '@/components/PillButton';
import { Sparkle } from '@/components/Sparkle';
import { Squishable } from '@/components/Squishable';
import { StripFrame, type StripLook } from '@/components/StripFrame';
import { Switch } from '@/components/Switch';
import { useToast } from '@/components/Toast';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { exportStripImage } from '@/lib/exportStrip';
import { deleteFromAlbum, removeFile, saveToAlbum } from '@/lib/files';
import { asFrame, FRAMES, type FrameId } from '@/lib/frames';
import { shareImage } from '@/lib/share';
import type { GalleryItem } from '@/lib/storage';
import { useApp } from '@/state/AppState';
import { color, radius, springEase, type, useLayout } from '@/theme';

/** width of the hidden full-size copy that gets snapshotted (≈1100px on most phones) */
const EXPORT_W = 400;
const EXPORT_PAD = 28;
const DEBOUNCE_MS = 800;

export default function StripRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useApp().gallery.find((g) => g.id === id);
  if (!item || item.type !== 'strip') return <Redirect href="/home" />;
  return <StripEditor item={item} />;
}

function StripEditor({ item }: { item: GalleryItem }) {
  const app = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { gutter, stripWidth } = useLayout();
  const reduced = useReducedMotion();

  const [frame, setFrame] = useState<FrameId>(asFrame(item.frame));
  const [caption, setCaption] = useState(item.caption);
  const [showDate, setShowDate] = useState(item.showDate);
  const [showCaption, setShowCaption] = useState(item.showCaption);
  const [loaded, setLoaded] = useState(0);
  const shots = item.shots ?? [];

  const look: StripLook = { shots, frame, caption, showCaption, showDate, createdAt: item.createdAt };
  const version = `${frame}|${caption}|${showDate}|${showCaption}`;

  // ---- export bookkeeping (refs so async work always sees the latest values)
  const exportRef = useRef<ComponentRef<typeof View>>(null);
  const itemRef = useRef(item);
  itemRef.current = item;
  const versionRef = useRef(version);
  versionRef.current = version;
  const exported = useRef<string | null>(item.uri ? version : null);
  const job = useRef<Promise<void>>(Promise.resolve());
  const ready = loaded >= shots.length && shots.length > 0;

  const { updateItem, setMode } = app;

  // the look is saved right away; only the image lags behind (debounced)
  useEffect(() => {
    updateItem(item.id, { frame, caption, showDate, showCaption });
  }, [frame, caption, showDate, showCaption, item.id, updateItem]);

  const runExport = useCallback(() => {
    job.current = job.current.then(async () => {
      const v = versionRef.current;
      if (exported.current === v) return;
      const cur = itemRef.current;
      try {
        const uri = await exportStripImage(exportRef, cur.id);
        if (!uri) {
          exported.current = v; // web preview: nothing to save
          return;
        }
        await deleteFromAlbum(cur.assetId);
        const assetId = await saveToAlbum(uri);
        if (cur.uri) removeFile(cur.uri);
        updateItem(cur.id, { uri, assetId });
        itemRef.current = { ...cur, uri, assetId };
        exported.current = v;
      } catch (e) {
        console.warn('[mochicam] strip export failed', e);
      }
    });
    return job.current;
  }, [updateItem]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(runExport, exported.current === null ? 150 : DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [ready, version, runExport]);

  /** wait for any pending edit to land in the saved copy */
  const flush = useCallback(async () => {
    if (ready) await runExport();
  }, [ready, runExport]);

  const leave = useCallback(() => {
    flush().then(() => (router.canGoBack() ? router.back() : router.replace('/home')));
  }, [flush]);

  // android back button / gesture: save first, then go
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        leave();
        return true;
      });
      return () => sub.remove();
    }, [leave]),
  );

  const share = async () => {
    await flush();
    const ok = await shareImage(itemRef.current.uri, 'strip').catch(() => false);
    if (!ok) toast("can't share right now ♡");
  };

  const again = async () => {
    await flush();
    setMode('four');
    router.replace('/camera');
  };

  // ---- strip motion: drops in on open, little wobble on each frame change
  const enter = useSharedValue(reduced ? 1 : 0);
  const swap = useSharedValue(1);
  useEffect(() => {
    enter.value = withTiming(1, { duration: 700, easing: springEase });
  }, [enter]);
  const pickFrame = (f: FrameId) => {
    if (f === frame) return;
    setFrame(f);
    if (!reduced) {
      swap.value = 0;
      swap.value = withTiming(1, { duration: 450, easing: springEase });
    }
  };
  const stripStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value),
    transform: [
      { translateY: (1 - enter.value) * 40 },
      { rotate: `${-8 + 6 * enter.value - 3 * (1 - swap.value)}deg` },
      { scale: (0.9 + 0.1 * enter.value) * (0.93 + 0.07 * swap.value) },
    ],
  }));

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex}>
      <Animated.ScrollView
        entering={screenEnter}
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 22, paddingHorizontal: gutter },
        ]}
      >
        <View style={styles.bar}>
          <IconButton icon="back" label="back" strokeWidth={2.6} onPress={leave} />
          <Text style={[type.title, styles.plum, styles.flex]} accessibilityRole="header" numberOfLines={1}>
            your strip!
          </Text>
          <Badge label="auto-saved ✓" />
        </View>

        <View style={styles.stage}>
          <Sparkle x="12%" y="14%" size={18} fill={color.butterDeep} />
          <Sparkle x="84%" y="22%" size={14} fill={color.pinkDeep} delay={0.5} />
          <Sparkle x="80%" y="76%" size={20} fill={color.lavDeep} delay={1} />
          <Sparkle x="14%" y="70%" size={12} fill={color.mintDeep} delay={0.8} />
          <Animated.View style={stripStyle}>
            <StripFrame look={look} width={stripWidth} />
          </Animated.View>
        </View>

        <Card style={styles.ctl}>
          <View style={styles.ctlRow}>
            <Text style={[type.heading, styles.plum]}>frame</Text>
            <Text style={[type.micro, styles.sub]}>swipe for more →</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frames}>
            {FRAMES.map((f) => {
              const on = f.id === frame;
              return (
                <Squishable
                  key={f.id}
                  onPress={() => pickFrame(f.id)}
                  style={styles.fchip}
                  accessibilityRole="button"
                  accessibilityLabel={`${f.name} frame`}
                  accessibilityState={{ selected: on }}
                >
                  <View style={[styles.swatch, on && styles.swatchOn]}>
                    <View style={styles.swatchClip}>
                      <FrameBackground frame={f.id} />
                    </View>
                  </View>
                  <Text style={[type.micro, styles.fchipLabel, on && styles.plum]} numberOfLines={2}>
                    {f.name}
                  </Text>
                </Squishable>
              );
            })}
          </ScrollView>

          <View style={styles.toggles}>
            <View style={styles.tog}>
              <Text style={styles.togText}>date stamp</Text>
              <Switch value={showDate} onChange={setShowDate} label="date stamp" />
            </View>
            <View style={styles.tog}>
              <Text style={styles.togText}>caption</Text>
              <Switch value={showCaption} onChange={setShowCaption} label="caption" />
            </View>
          </View>

          {showCaption && (
            <View style={styles.capWrap}>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                maxLength={26}
                placeholder="write a cute caption"
                placeholderTextColor="#C9B2BE"
                selectionColor={color.pinkDeep}
                cursorColor={color.pinkDeep}
                accessibilityLabel="caption"
                style={styles.capInput}
              />
            </View>
          )}
        </Card>

        <View style={styles.cta}>
          <PillButton
            variant="secondary"
            label="share"
            icon={<Icon name="share" size={20} />}
            onPress={share}
            style={styles.flex}
          />
          <PillButton label="again! ✨" onPress={again} style={styles.flex} />
        </View>
      </Animated.ScrollView>

      {/* hidden full-size copy that becomes the saved jpeg */}
      <View style={styles.offscreen} pointerEvents="none">
        <View
          ref={exportRef}
          collapsable={false}
          style={{
            padding: EXPORT_PAD,
            paddingTop: EXPORT_PAD + (frame === 'bunny' ? EXPORT_W * 0.21 : 0),
            backgroundColor: color.cream,
          }}
        >
          <StripFrame look={look} width={EXPORT_W} onPhotoLoad={() => setLoaded((n) => n + 1)} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.cream },
  content: { gap: 14 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  plum: { color: color.plum },
  sub: { color: color.plumSoft },
  stage: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    borderRadius: radius.sheet,
    overflow: 'hidden',
    backgroundImage: `linear-gradient(170deg, ${color.lavSoft}, #FFEFF6)`,
  },
  ctl: { paddingTop: 14, paddingBottom: 16, gap: 10 },
  ctlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 16 },
  frames: { gap: 4, paddingHorizontal: 12, paddingVertical: 4 },
  fchip: { width: 66, alignItems: 'center', gap: 6, paddingTop: 4 },
  swatch: { width: 36, height: 52, borderRadius: 9 },
  swatchOn: { boxShadow: `0px 0px 0px 3px ${color.white}, 0px 0px 0px 6px ${color.pinkDeep}` },
  swatchClip: {
    flex: 1,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(107,74,94,0.12)',
  },
  fchipLabel: { color: color.plumSoft, textAlign: 'center', lineHeight: 13 },
  toggles: { flexDirection: 'row', gap: 8, paddingHorizontal: 12 },
  tog: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    backgroundColor: color.cream,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 12,
  },
  togText: { ...type.caption, fontSize: 14, color: color.plum, flexShrink: 1 },
  capWrap: { paddingHorizontal: 12 },
  capInput: {
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: color.line,
    backgroundColor: color.cream,
    paddingHorizontal: 18,
    ...type.body,
    lineHeight: undefined,
    color: color.plum,
  },
  cta: { flexDirection: 'row', gap: 12 },
  offscreen: { position: 'absolute', left: -10000, top: 0 },
});
