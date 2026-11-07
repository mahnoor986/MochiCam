// gallery: today / earlier grid, full view with share + delete, sleepy empty state
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/BottomSheet';
import { Cloud } from '@/components/Cloud';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Mochi } from '@/components/Mochi';
import { PillButton } from '@/components/PillButton';
import { screenEnter } from '@/components/Screen';
import { Squishable } from '@/components/Squishable';
import { StripFrame, type StripLook } from '@/components/StripFrame';
import { useToast } from '@/components/Toast';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { whenOf } from '@/lib/dates';
import { deleteFromAlbum, removeFile } from '@/lib/files';
import { filterById } from '@/lib/filters';
import { asFrame, frameName } from '@/lib/frames';
import { shareImage } from '@/lib/share';
import type { GalleryItem } from '@/lib/storage';
import { useApp } from '@/state/AppState';
import { color, radius, shadow, springEase, type, useLayout } from '@/theme';

const GAP = 8;

const lookOf = (it: GalleryItem): StripLook => ({
  shots: it.shots ?? [],
  frame: asFrame(it.frame),
  caption: it.caption,
  showCaption: it.showCaption,
  showDate: it.showDate,
  createdAt: it.createdAt,
});

function Zz() {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduced, t]);
  const style = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * t.value, transform: [{ translateY: -8 * t.value }] }));
  return <Animated.Text style={[styles.zz, style]}>z z</Animated.Text>;
}

function Empty() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyArt}>
        <Cloud width={210} style={styles.emptyCloud} />
        <Mochi size={130} mood="sleep" style={styles.emptyMochi} />
        <Zz />
      </View>
      <Text style={[type.title, styles.plum, styles.center]}>no photos yet</Text>
      <Text style={[type.body, styles.sub, styles.center]}>your cute moments will live here ✨</Text>
      <PillButton label="start booth ♡" onPress={() => router.dismissTo('/camera')} style={styles.emptyBtn} />
    </View>
  );
}

function Cell({ item, size, onPress }: { item: GalleryItem; size: number; onPress: () => void }) {
  const strip = item.type === 'strip';
  const miniW = Math.min(44, Math.max(36, size * 0.36));
  return (
    <Squishable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strip ? 'open strip' : 'open photo'}
      style={[styles.cell, { width: size }, strip && styles.cellStrip]}
    >
      {strip ? (
        <>
          <StripFrame look={lookOf(item)} width={miniW} mini />
          <Text style={styles.tag}>4-cut</Text>
        </>
      ) : (
        <Image source={{ uri: item.uri }} style={styles.fill} resizeMode="cover" />
      )}
    </Squishable>
  );
}

function Viewer(props: { item: GalleryItem; onClose: () => void; onShare: () => void; onDelete: () => void }) {
  const { item } = props;
  const insets = useSafeAreaInsets();
  const { gutter, width, height } = useLayout();
  const reduced = useReducedMotion();
  const strip = item.type === 'strip';
  // 78% of the width, but never so tall that the buttons get pushed off a short phone
  const photoW = Math.min(width * 0.78 - gutter, (height - insets.top - insets.bottom - 220) * 0.75);
  const pop = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    pop.value = withTiming(1, { duration: 600, easing: springEase });
  }, [pop]);
  const tilt = strip ? 0 : 1.5;
  const popStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value),
    transform: [
      { translateY: (1 - pop.value) * 40 },
      { rotate: `${-8 + (8 + tilt) * pop.value}deg` },
      { scale: 0.9 + 0.1 * pop.value },
    ],
  }));
  const info = `${filterById(item.filter).name}${strip ? ` · 4-cut · ${frameName(item.frame)}` : ''}`;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      accessibilityViewIsModal
      style={[
        styles.viewer,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, paddingHorizontal: gutter },
      ]}
    >
      <View style={styles.vTop}>
        <IconButton icon="back" label="close" strokeWidth={2.6} onPress={props.onClose} />
        <View style={styles.flex}>
          <Text style={[type.heading, styles.plum]}>{whenOf(item.createdAt)}</Text>
          <Text style={[type.caption, styles.sub]} numberOfLines={1}>
            {info}
          </Text>
        </View>
      </View>
      <View style={styles.vBody}>
        <Animated.View style={popStyle}>
          {strip ? (
            <StripFrame look={lookOf(item)} width={Math.min(156, Math.max(124, width * 0.36))} />
          ) : (
            <View style={[styles.vPhoto, { width: photoW }]}>
              <Image source={{ uri: item.uri }} style={styles.fill} resizeMode="cover" />
            </View>
          )}
        </Animated.View>
      </View>
      <View style={styles.two}>
        <PillButton
          variant="secondary"
          label="share"
          icon={<Icon name="share" size={20} />}
          onPress={props.onShare}
          style={styles.flex}
        />
        <PillButton
          variant="ghost"
          label="delete"
          icon={<Icon name="trash" size={20} />}
          onPress={props.onDelete}
          style={styles.flex}
        />
      </View>
    </Animated.View>
  );
}

export default function Gallery() {
  const { gallery, removeItem } = useApp();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { gutter, width } = useLayout();
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const open = gallery.find((g) => g.id === openId) ?? null;
  const cell = (width - gutter * 2 - GAP * 2) / 3;

  // android back closes the sheet, then the viewer, then the screen
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (confirm) setConfirm(false);
        else if (openId) setOpenId(null);
        else return false;
        return true;
      });
      return () => sub.remove();
    }, [confirm, openId]),
  );

  const today = gallery.filter((g) => whenOf(g.createdAt) === 'today');
  const earlier = gallery.filter((g) => whenOf(g.createdAt) !== 'today');
  const sections = [
    { title: 'today', items: today },
    { title: 'earlier', items: earlier },
  ].filter((s) => s.items.length);

  const share = async () => {
    if (!open) return;
    const ok = await shareImage(open.uri, open.type === 'strip' ? 'strip' : 'photo').catch(() => false);
    // a strip that was never opened has no image yet; the strip screen makes it
    if (!ok) toast(open.type === 'strip' && !open.uri ? 'open it once to save it first ♡' : "can't share right now ♡");
  };

  const reallyDelete = async () => {
    if (!open) return;
    const it = open;
    setConfirm(false);
    setOpenId(null);
    removeItem(it.id);
    if (it.uri) removeFile(it.uri);
    it.shots?.forEach(removeFile);
    toast('poof! deleted');
    await deleteFromAlbum(it.assetId);
  };

  return (
    <View style={styles.flex}>
      <Animated.View entering={screenEnter} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: gutter },
            !gallery.length && styles.grow,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bar}>
            <IconButton icon="back" label="back" strokeWidth={2.6} onPress={() => router.back()} />
            <Text style={[type.title, styles.plum, styles.flex]} accessibilityRole="header">
              gallery
            </Text>
            {gallery.length > 0 && <Text style={styles.count}>{gallery.length} ♡</Text>}
          </View>

          {!gallery.length && <Empty />}

          {sections.map((s) => (
            <View key={s.title} style={styles.section}>
              <Text style={styles.secTitle}>{s.title}</Text>
              <View style={styles.grid}>
                {s.items.map((it) => (
                  <Cell key={it.id} item={it} size={cell} onPress={() => setOpenId(it.id)} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {open && <Viewer item={open} onClose={() => setOpenId(null)} onShare={share} onDelete={() => setConfirm(true)} />}

      {confirm && open && (
        <BottomSheet onClose={() => setConfirm(false)} label="confirm delete">
          <Mochi size={70} mood="sleep" style={styles.sheetMochi} />
          <Text style={[type.heading, styles.plum, styles.center]}>delete this one?</Text>
          <Text style={[type.body, styles.sub, styles.center, styles.sheetBody]}>
            it&apos;ll be gone from your gallery for good
          </Text>
          <View style={styles.two}>
            <PillButton variant="ghost" label="keep it ♡" onPress={() => setConfirm(false)} style={styles.flex} />
            <PillButton
              label="delete"
              icon={<Icon name="trash" size={20} />}
              onPress={reallyDelete}
              style={styles.flex}
            />
          </View>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  fill: { width: '100%', height: '100%' },
  plum: { color: color.plum },
  sub: { color: color.plumSoft },
  center: { textAlign: 'center' },
  content: { gap: 12, backgroundColor: color.cream },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  count: {
    ...type.micro,
    fontSize: 12,
    lineHeight: 28,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: color.pinkSoft,
    color: color.plum,
  },
  section: { gap: 12 },
  secTitle: { ...type.heading, fontSize: 16, lineHeight: 20, color: color.plumSoft, marginTop: 6, marginHorizontal: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: color.pinkSoft,
    boxShadow: shadow.soft,
  },
  cellStrip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `linear-gradient(170deg, ${color.lavSoft}, #FFEFF6)`,
  },
  tag: {
    ...type.micro,
    fontSize: 10,
    lineHeight: 18,
    position: 'absolute',
    left: 6,
    bottom: 6,
    height: 18,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
    color: color.plum,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 40 },
  emptyArt: { width: 210, height: 170, alignItems: 'center', justifyContent: 'center' },
  emptyCloud: { position: 'absolute', left: 0, top: 72 },
  emptyMochi: { marginTop: -16 },
  zz: { ...type.heading, position: 'absolute', right: 30, top: 10, color: color.lavDeep },
  emptyBtn: { alignSelf: 'center', paddingHorizontal: 32, marginTop: 10 },
  viewer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,246,240,0.97)',
    gap: 14,
  },
  vTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vPhoto: { aspectRatio: 3 / 4, borderRadius: radius.card, overflow: 'hidden', boxShadow: shadow.lift },
  two: { flexDirection: 'row', gap: 12 },
  sheetMochi: { alignSelf: 'center' },
  sheetBody: { marginTop: -8 },
});
