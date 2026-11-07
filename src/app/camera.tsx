// the booth: live preview + tint, top controls, filter chips, countdown → flash → capture → bake → save
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Countdown } from '@/components/Countdown';
import { CHIP_WIDTH, FilterChip } from '@/components/FilterChip';
import { FlashOverlay } from '@/components/FlashOverlay';
import { useHearts } from '@/components/FloatingHearts';
import { Heart } from '@/components/Heart';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Mochi } from '@/components/Mochi';
import { PillButton } from '@/components/PillButton';
import { ShutterButton } from '@/components/ShutterButton';
import { Squishable } from '@/components/Squishable';
import { useToast } from '@/components/Toast';
import { bakePhoto } from '@/lib/bake';
import { newId, removeFile, saveToAlbum } from '@/lib/files';
import { FILTERS, filterById, tintStyle } from '@/lib/filters';
import { haptic } from '@/lib/haptics';
import { thumbOf } from '@/lib/storage';
import { useApp } from '@/state/AppState';
import { color, motion, radius, shadow, springEase, type, useLayout } from '@/theme';

const TIMERS = [3, 5, 10, 0];
const CHIP_GAP = 6;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** 4-cut progress dot: fills white and grows a little once its shot is taken */
function Dot({ on }: { on: boolean }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(on ? 1 : 0, { duration: 350, easing: springEase });
  }, [on, v]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.55 * Math.min(1, v.value),
    transform: [{ scale: 1 + 0.25 * v.value }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

function NoCamera({ canAsk, ask }: { canAsk: boolean; ask: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.noCam, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <IconButton icon="close" label="close camera" strokeWidth={2.6} onPress={() => router.back()} />
      <View style={styles.noCamBody}>
        <Mochi size={120} mood="wink" bob />
        <Text style={[type.title, styles.center, { color: color.plum }]}>mochi needs the camera ♡</Text>
        <Text style={[type.body, styles.center, { color: color.plumSoft }]}>
          {canAsk ? 'tap below so we can snap your cutest moments' : 'turn on the camera for mochicam in settings'}
        </Text>
      </View>
      <PillButton
        label={canAsk ? 'allow camera' : 'open settings'}
        onPress={canAsk ? ask : () => Linking.openSettings()}
      />
    </View>
  );
}

export default function Camera() {
  const app = useApp();
  const toast = useToast();
  const hearts = useHearts();
  const insets = useSafeAreaInsets();
  const { gutter } = useLayout();
  const [perm, requestPerm] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const shutterRef = useRef<ComponentRef<typeof View>>(null);

  /** hearts float up from the top third of the shutter */
  const heartsFromShutter = (count?: number) =>
    shutterRef.current?.measureInWindow((x, y, w, h) => hearts({ x: x + w / 2, y: y + h * 0.3 }, count));

  const [focused, setFocused] = useState(true);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [timer, setTimer] = useState(3);
  const [flash, setFlash] = useState(false);
  const [filterId, setFilterId] = useState('strawberry');
  const [busy, setBusy] = useState(false);
  const [cd, setCd] = useState<string | null>(null);
  const [shot, setShot] = useState(0);
  const [done, setDone] = useState(0);
  const [sheetH, setSheetH] = useState(260);

  // every capture run gets a token; leaving the screen bumps it, which cancels any countdown in flight
  const run = useRef(0);
  const alive = (t: number) => run.current === t;

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        run.current++;
        setFocused(false);
        setBusy(false);
        setCd(null);
        setDone(0);
      };
    }, []),
  );

  const filter = filterById(filterId);
  const four = app.mode === 'four';
  const latest = app.gallery[0];

  async function countdown(sec: number, t: number) {
    for (let k = sec; k >= 1; k--) {
      if (!alive(t)) return false;
      setCd(String(k));
      haptic.tick();
      await wait(motion.countdown.stepMs);
    }
    if (!alive(t)) return false;
    if (sec) {
      setCd('say cheese ♡');
      await wait(420);
    }
    setCd(null);
    return alive(t);
  }

  /** countdown → flash → shutter. null when the run was cancelled */
  async function snap(t: number) {
    if (!(await countdown(timer, t))) return null;
    setShot((n) => n + 1);
    await wait(flash ? 260 : 160);
    if (!alive(t)) return null;
    return (await cam.current?.takePictureAsync({ quality: 0.92 })) ?? null;
  }

  async function bake(picUri: string, id: string) {
    const uri = await bakePhoto(picUri, filter.id, id);
    if (uri !== picUri) removeFile(picUri);
    return uri;
  }

  async function captureSingle(t: number) {
    const pic = await snap(t);
    if (!pic) return;
    // from here on the photo exists, so finish saving it even if the screen is left
    const id = newId();
    const uri = await bake(pic.uri, id);
    const assetId = await saveToAlbum(uri);
    app.addItem({
      id,
      type: 'photo',
      uri,
      assetId,
      filter: filter.id,
      frame: null,
      caption: '',
      showDate: false,
      showCaption: false,
      createdAt: Date.now(),
    });
    haptic.saved();
    if (!alive(t)) return;
    toast('saved to your gallery!');
    heartsFromShutter();
    setTimeout(() => {
      if (alive(t)) toast('one more? ✨', 1500);
    }, 2300);
  }

  async function captureStrip(t: number) {
    const id = newId();
    const shots: string[] = [];
    setDone(0);
    try {
      for (let i = 0; i < 4; i++) {
        const pic = await snap(t);
        if (!pic) return; // cancelled: the finally below tidies up
        shots.push(await bake(pic.uri, `${id}-${i + 1}`));
        setDone(i + 1);
        if (i < 3) {
          toast(`${i + 1}/4 · next pose! ✨`, 1100);
          await wait(900);
        }
      }
    } finally {
      if (shots.length < 4) shots.forEach(removeFile);
    }

    // the strip image itself is exported (and saved to the album) by the strip screen
    app.addItem({
      id,
      type: 'strip',
      uri: '',
      assetId: null,
      filter: filter.id,
      frame: 'hearts',
      caption: `${app.name || 'bestie'}'s bestie day ♡`,
      showDate: true,
      showCaption: true,
      createdAt: Date.now(),
      shots,
    });
    haptic.saved();
    if (!alive(t)) return;
    toast('strip time! ✨');
    heartsFromShutter(16);
    await wait(1100);
    if (alive(t)) router.replace({ pathname: '/strip/[id]', params: { id } });
  }

  async function capture() {
    if (busy || !ready) return;
    haptic.tap();
    const t = ++run.current;
    setBusy(true);
    try {
      await (four ? captureStrip(t) : captureSingle(t));
    } catch (e) {
      console.warn('[mochicam] capture failed', e);
      if (alive(t)) toast('oops! try again ♡');
    } finally {
      if (alive(t)) {
        setBusy(false);
        setCd(null);
      }
    }
  }

  const flip = () => {
    if (busy) return;
    const next = facing === 'front' ? 'back' : 'front';
    setFacing(next);
    toast(next === 'front' ? 'selfie camera' : 'back camera', 1200);
  };
  const cycleTimer = () => {
    const next = TIMERS[(TIMERS.indexOf(timer) + 1) % TIMERS.length];
    setTimer(next);
    toast(next ? `${next} second timer` : 'timer off', 1200);
  };
  const toggleFlash = () => {
    setFlash(!flash);
    toast(flash ? 'flash off' : 'flash on ✨', 1200);
  };
  const toggleMode = () => {
    if (busy) return;
    app.setMode(four ? 'single' : 'four');
    toast(four ? 'single mode' : '4-cut mode ✨', 1200);
  };

  if (perm && !perm.granted) {
    return (
      <>
        <StatusBar style="dark" />
        <NoCamera canAsk={perm.canAskAgain} ask={requestPerm} />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      {perm?.granted && (
        <CameraView
          ref={cam}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mirror={facing === 'front'}
          flash={flash ? (facing === 'front' ? 'screen' : 'on') : 'off'}
          active={focused}
          animateShutter={false}
          onCameraReady={() => setReady(true)}
          onMountError={() => toast('the camera is shy… try again ♡')}
        />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, tintStyle(filter.previewTint ?? filter.tint)]} />

      <View pointerEvents="none" style={styles.guides}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>

      <View style={[styles.top, { top: insets.top + 10, left: gutter, right: gutter }]}>
        <IconButton variant="glass" icon="close" label="close camera" strokeWidth={2.6} onPress={() => router.back()} />
        <View style={styles.topRight}>
          <IconButton variant="glass" icon="flip" label="flip camera" onPress={flip} />
          <IconButton
            variant="glass"
            icon="timer"
            label={`timer ${timer ? `${timer} seconds` : 'off'}`}
            tag={timer ? `${timer}s` : 'off'}
            onPress={cycleTimer}
          />
          <IconButton
            variant="glass"
            icon={flash ? 'flash' : 'flashOff'}
            label={flash ? 'flash on' : 'flash off'}
            onPress={toggleFlash}
          />
        </View>
      </View>

      <View style={[styles.modePill, { top: insets.top + 66 }]} pointerEvents="none">
        <Text style={styles.modePillText}>{four ? '4-cut' : 'single'}</Text>
        {four && (
          <>
            <View style={styles.dots}>
              {[0, 1, 2, 3].map((i) => (
                <Dot key={i} on={i < done} />
              ))}
            </View>
            <Text style={styles.modePillText}>{done}/4</Text>
          </>
        )}
      </View>

      <Countdown value={cd} style={[StyleSheet.absoluteFill, { bottom: sheetH }]} />

      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
      >
        <View style={styles.fName}>
          <Heart size={14} />
          <Animated.Text key={filter.id} entering={ZoomIn.duration(400).easing(springEase)} style={styles.fNameText}>
            {filter.name}
          </Animated.Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CHIP_WIDTH + CHIP_GAP}
          decelerationRate="fast"
          contentContainerStyle={[styles.chips, { paddingHorizontal: gutter }]}
        >
          {FILTERS.map((f) => (
            <FilterChip key={f.id} filter={f} selected={f.id === filterId} onPress={() => setFilterId(f.id)} />
          ))}
        </ScrollView>

        <View style={[styles.shutterRow, { paddingHorizontal: gutter }]}>
          <View style={styles.side}>
            <Squishable
              onPress={() => router.push('/gallery')}
              accessibilityRole="button"
              accessibilityLabel="open gallery"
              style={styles.thumb}
            >
              {latest && (
                <Animated.View key={latest.id} entering={ZoomIn.duration(500).easing(springEase)} style={styles.fill}>
                  <Image source={{ uri: thumbOf(latest) }} style={styles.fill} />
                </Animated.View>
              )}
            </Squishable>
          </View>
          <View ref={shutterRef} collapsable={false}>
            <ShutterButton onPress={capture} busy={busy} disabled={!ready} />
          </View>
          <View style={[styles.side, styles.sideEnd]}>
            <Squishable
              onPress={toggleMode}
              accessibilityRole="button"
              accessibilityLabel="switch booth mode"
              style={styles.modeMini}
            >
              <Icon name={four ? 'strip' : 'single'} size={20} />
              <Text style={styles.modeMiniText}>{four ? '4-cut' : 'single'}</Text>
            </Squishable>
          </View>
        </View>
      </View>

      <FlashOverlay shot={shot} bright={flash} />
    </View>
  );
}

const GUIDE = 28;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#3A2A35' },
  fill: { width: '100%', height: '100%' },
  center: { textAlign: 'center' },
  noCam: { flex: 1, backgroundColor: color.cream, paddingHorizontal: 20, gap: 16 },
  noCamBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  guides: { position: 'absolute', left: '12%', right: '12%', top: '21%', bottom: '38%' },
  corner: { position: 'absolute', width: GUIDE, height: GUIDE, borderColor: 'rgba(255,255,255,0.85)' },
  tl: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 16 },
  tr: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 16 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 16 },
  br: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 16 },
  top: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topRight: { flexDirection: 'row', gap: 10 },
  modePill: {
    position: 'absolute',
    alignSelf: 'center',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    boxShadow: 'inset 0px 0px 0px 1px rgba(255,255,255,0.4)',
  },
  modePillText: { ...type.heading, fontSize: 14, lineHeight: 18, color: color.white, includeFontPadding: false },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.white },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    gap: 6,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: 'rgba(255,246,240,0.95)',
    boxShadow: '0px -10px 30px rgba(107,74,94,0.14)',
  },
  fName: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  fNameText: { ...type.heading, fontSize: 15, lineHeight: 20, color: color.plum },
  chips: { gap: CHIP_GAP, paddingTop: 4, paddingBottom: 8 },
  shutterRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  side: { flex: 1, alignItems: 'flex-start' },
  sideEnd: { alignItems: 'flex-end' },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: color.white,
    backgroundColor: color.pinkSoft,
    boxShadow: shadow.soft,
  },
  modeMini: {
    height: 44,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radius.pill,
    backgroundColor: color.white,
    boxShadow: shadow.soft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeMiniText: { ...type.heading, fontSize: 15, lineHeight: 18, color: color.plum, includeFontPadding: false },
});
