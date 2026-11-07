// pure layout of a 4-cut strip. every size is a fraction of `width` (the prototype's --sw),
// so the same component draws the on-screen strip, the gallery mini strip and the export.
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FrameBackground } from '@/components/FrameBackground';
import { stampOf } from '@/lib/dates';
import type { FrameId } from '@/lib/frames';
import { color, shadow } from '@/theme';

export type StripLook = {
  shots: string[];
  frame: FrameId;
  caption: string;
  showCaption: boolean;
  showDate: boolean;
  createdAt: number;
};

type Props = {
  look: StripLook;
  width: number;
  /** gallery thumbnail: footer keeps its space but hides its text */
  mini?: boolean;
  onPhotoLoad?: () => void;
  style?: StyleProp<ViewStyle>;
};

function Ear({ sw, side }: { sw: number; side: 'l' | 'r' }) {
  const ring = sw * 0.012 + 1;
  return (
    <View
      style={[
        styles.ear,
        {
          top: sw * -0.21,
          width: sw * 0.15,
          height: sw * 0.27,
          borderWidth: ring,
          transform: [{ rotate: side === 'l' ? '-12deg' : '12deg' }],
        },
        side === 'l' ? { left: '24%' } : { right: '24%' },
      ]}
    >
      <View style={styles.earInner} />
    </View>
  );
}

export function StripFrame({ look, width: sw, mini, onPhotoLoad, style }: Props) {
  const capSize = sw * 0.082;
  const metaSize = sw * 0.056;
  const showFoot = !mini;

  return (
    <View
      style={[
        {
          width: sw,
          paddingTop: sw * 0.075,
          paddingHorizontal: sw * 0.075,
          paddingBottom: sw * 0.06,
          borderRadius: sw * 0.05,
          gap: sw * 0.05,
          boxShadow: mini ? '0px 4px 10px rgba(107,74,94,0.18)' : shadow.lift,
        },
        style,
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: sw * 0.05, overflow: 'hidden' }]}>
        <FrameBackground frame={look.frame} k={Math.max(0.5, sw / 120)} />
        {look.frame === 'plain' && (
          <View
            style={[StyleSheet.absoluteFill, { borderRadius: sw * 0.05, borderWidth: 1, borderColor: color.line }]}
          />
        )}
      </View>
      {look.frame === 'bunny' && (
        <>
          <Ear sw={sw} side="l" />
          <Ear sw={sw} side="r" />
        </>
      )}

      <View style={{ gap: sw * 0.045 }}>
        {look.shots.map((uri, i) => (
          <View
            key={`${uri}-${i}`}
            style={{
              aspectRatio: 4 / 3,
              borderRadius: sw * 0.035,
              overflow: 'hidden',
              backgroundColor: color.pinkSoft,
              boxShadow: `0px 0px 0px ${sw * 0.012 + 0.5}px rgba(255,255,255,0.95)`,
            }}
          >
            <Image source={{ uri }} style={styles.photo} resizeMode="cover" onLoad={onPhotoLoad} />
          </View>
        ))}
      </View>

      <View style={{ minHeight: sw * (mini ? 0.14 : 0.16), alignItems: 'center', gap: sw * 0.03 }}>
        {showFoot && look.showCaption && (
          <Text
            numberOfLines={1}
            style={[
              styles.cap,
              {
                fontSize: capSize,
                lineHeight: capSize * 1.2,
                paddingVertical: capSize * 0.22,
                paddingHorizontal: capSize * 0.8,
              },
            ]}
          >
            {look.caption}
          </Text>
        )}
        {showFoot && (
          <View
            style={[
              styles.meta,
              { gap: metaSize * 0.6, paddingVertical: metaSize * 0.2, paddingHorizontal: metaSize * 0.7 },
            ]}
          >
            {look.showDate && (
              <Text
                style={[styles.metaText, { fontSize: metaSize, lineHeight: metaSize * 1.3, color: color.pinkDeep }]}
              >
                {stampOf(look.createdAt)}
              </Text>
            )}
            <Text style={[styles.metaText, { fontSize: metaSize, lineHeight: metaSize * 1.3 }]}>mochicam ♡</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: '100%' },
  ear: { position: 'absolute', borderRadius: 999, backgroundColor: color.white, borderColor: color.plum },
  earInner: {
    position: 'absolute',
    top: '22%',
    left: '30%',
    right: '30%',
    bottom: '18%',
    borderRadius: 999,
    backgroundColor: color.pink,
  },
  cap: {
    maxWidth: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
    fontFamily: 'Fredoka_600SemiBold',
    color: color.plum,
    includeFontPadding: false,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  metaText: { fontFamily: 'Nunito_800ExtraBold', color: color.plum, letterSpacing: 0.2, includeFontPadding: false },
});
