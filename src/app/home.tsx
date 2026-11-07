import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Blob } from '@/components/Blob';
import { Card } from '@/components/Card';
import { Cloud } from '@/components/Cloud';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Mochi } from '@/components/Mochi';
import { ModeToggle } from '@/components/ModeToggle';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { Sparkle } from '@/components/Sparkle';
import { Squishable } from '@/components/Squishable';
import { whenOf } from '@/lib/dates';
import { thumbOf, type GalleryItem } from '@/lib/storage';
import { useApp } from '@/state/AppState';
import { color, radius, shadow, type } from '@/theme';

function Hero() {
  return (
    <View style={styles.hero}>
      <Blob
        fill="rgba(255,183,213,0.55)"
        duration={10000}
        style={{ width: '62%', aspectRatio: 1, left: '19%', bottom: '-6%' }}
      />
      <Blob
        fill="rgba(255,241,168,0.8)"
        duration={10000}
        phase={0.4}
        style={{ width: '30%', aspectRatio: 1, left: '-8%', top: '-6%' }}
      />
      <Cloud width={74} drift={6000} style={{ position: 'absolute', left: '58%', top: '12%' }} />
      <Cloud width={54} drift={7000} reverse style={{ position: 'absolute', left: '8%', top: '44%' }} />
      <Sparkle x="12%" y="16%" size={18} fill={color.butterDeep} />
      <Sparkle x="84%" y="52%" size={14} fill={color.pinkDeep} delay={0.7} />
      <Sparkle x="22%" y="70%" size={12} fill={color.lavDeep} delay={1.3} />
      <View style={styles.heroBubble}>
        <Text style={styles.heroBubbleText}>say cheese ♡</Text>
      </View>
      <Mochi size={150} bob style={styles.heroMochi} />
    </View>
  );
}

function GalleryCard({ items, onPress }: { items: GalleryItem[]; onPress: () => void }) {
  const n = items.length;
  return (
    <Squishable onPress={onPress} accessibilityRole="button" accessibilityLabel="open your gallery">
      <Card style={styles.galCard}>
        {n ? (
          <View style={styles.thumbs}>
            {items.slice(0, 3).map((it, i) => (
              <Image
                key={it.id}
                source={{ uri: thumbOf(it) }}
                style={[styles.thumb, i > 0 && { marginLeft: -12 }, { transform: [{ rotate: `${[-8, 0, 8][i]}deg` }] }]}
              />
            ))}
          </View>
        ) : (
          <Mochi size={46} mood="sleep" />
        )}
        <View style={styles.galText}>
          <Text style={styles.galTitle}>your gallery</Text>
          <Text style={[type.caption, styles.sub]} numberOfLines={1}>
            {n ? `${n} ${n === 1 ? 'memory' : 'memories'} · newest ${whenOf(items[0].createdAt)}` : 'nothing here yet ♡'}
          </Text>
        </View>
        <View style={styles.chev}>
          <Icon name="next" size={18} strokeWidth={2.6} />
        </View>
      </Card>
    </Squishable>
  );
}

export default function Home() {
  const { name, mode, setMode, gallery } = useApp();

  return (
    <Screen style={styles.screen}>
      <View style={styles.top}>
        <View style={styles.greet}>
          <Text style={[type.title, styles.plum]} accessibilityRole="header">
            hi, {name}! ✨
          </Text>
          <Text style={[type.body, styles.sub]}>ready for a cute day?</Text>
        </View>
        <IconButton
          icon="pencil"
          iconSize={20}
          label="change your name"
          onPress={() => router.push({ pathname: '/name', params: { edit: '1' } })}
        />
      </View>

      <Hero />

      <Card style={styles.mode}>
        <View style={styles.modeRow}>
          <Text style={[type.heading, styles.plum]}>booth mode</Text>
          <Text style={[type.caption, styles.sub]}>{mode === 'four' ? '4 shots, 1 cute strip' : 'one cute shot'}</Text>
        </View>
        <ModeToggle value={mode} onChange={setMode} />
      </Card>

      <PillButton xl label="start booth ♡" onPress={() => router.push('/camera')} />
      <GalleryCard items={gallery} onPress={() => router.push('/gallery')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingTop: 6 },
  greet: { flex: 1, minWidth: 0 },
  hero: {
    flex: 1,
    minHeight: 190,
    borderRadius: radius.sheet,
    overflow: 'hidden',
    backgroundImage: `linear-gradient(160deg, ${color.pinkSoft}, ${color.lavSoft} 70%, #E9FBF3)`,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroBubble: {
    position: 'absolute',
    right: '50%',
    marginRight: -6,
    top: '14%',
    zIndex: 1,
    backgroundColor: color.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    boxShadow: shadow.soft,
    transform: [{ rotate: '-6deg' }],
  },
  heroBubbleText: { ...type.heading, fontSize: 16, lineHeight: 18, color: color.plum, includeFontPadding: false },
  heroMochi: { marginBottom: '6%' },
  mode: { paddingVertical: 14, paddingLeft: 18, paddingRight: 14, gap: 10 },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    paddingRight: 4,
  },
  galCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 16,
  },
  thumbs: { flexDirection: 'row', paddingLeft: 4 },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 3,
    borderColor: color.white,
    backgroundColor: color.pinkSoft,
    boxShadow: shadow.soft,
  },
  galText: { flex: 1, minWidth: 0 },
  galTitle: { ...type.heading, fontSize: 18, lineHeight: 22, color: color.plum },
  chev: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plum: { color: color.plum },
  sub: { color: color.plumSoft },
});
