// first launch: ask for the camera and photos with the real android dialogs
import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Linking, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { Mochi } from '@/components/Mochi';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { Sparkle } from '@/components/Sparkle';
import { Squishable } from '@/components/Squishable';
import { usePhotoPermissions } from '@/lib/permissions';
import { color, radius, shadow, springEase, type } from '@/theme';

type Perm = { granted: boolean; status: string; canAskAgain: boolean } | null;
type PermState = 'idle' | 'granted' | 'denied';

const stateOf = (p: Perm): PermState => (p?.granted ? 'granted' : p?.status === 'denied' ? 'denied' : 'idle');

function PermCard(props: {
  tint: string;
  icon: IconName;
  title: string;
  text: string;
  perm: Perm;
  request: () => Promise<unknown>;
}) {
  const state = stateOf(props.perm);
  const ask = () => {
    // android stops showing the dialog after "don't allow" twice; settings is the only way back
    if (state === 'denied' && props.perm && !props.perm.canAskAgain) Linking.openSettings();
    else props.request();
  };

  return (
    <View style={[styles.perm, { backgroundColor: props.tint }]}>
      <View style={styles.permIcon}>
        <Icon name={props.icon} size={26} />
      </View>
      <View style={styles.permText}>
        <Text style={[type.heading, styles.plum]}>{props.title}</Text>
        <Text style={[type.caption, styles.plum]}>
          {state === 'denied' ? 'no worries! tap to try again' : props.text}
        </Text>
      </View>
      {state === 'granted' ? (
        <Animated.View entering={ZoomIn.duration(500).easing(springEase)} style={styles.okPill}>
          <Icon name="check" size={16} strokeWidth={2.8} />
          <Text style={styles.smLabel}>allowed</Text>
        </Animated.View>
      ) : (
        <Squishable
          onPress={ask}
          accessibilityRole="button"
          accessibilityLabel={`${state === 'denied' ? 'retry' : 'allow'} ${props.title}`}
          style={[styles.smBtn, state === 'denied' && { backgroundColor: color.butter }]}
        >
          <Text style={styles.smLabel}>{state === 'denied' ? 'retry' : 'allow'}</Text>
        </Squishable>
      )}
    </View>
  );
}

export default function Permissions() {
  const [cam, requestCam, getCam] = useCameraPermissions();
  const [lib, requestLib, getLib] = usePhotoPermissions();

  // coming back from android settings: re-read both
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        getCam();
        getLib();
      }
    });
    return () => sub.remove();
  }, [getCam, getLib]);

  const ready = !!cam?.granted && !!lib?.granted;

  return (
    <Screen style={styles.screen} top={24} bottom={16}>
      <View style={styles.head}>
        <View style={styles.mochi}>
          <Mochi size={112} mood="wink" bob />
          <Sparkle x="-18%" y="10%" size={16} fill={color.butterDeep} delay={0.2} />
          <Sparkle x="104%" y="34%" size={12} fill={color.pinkDeep} delay={0.9} />
        </View>
        <Text style={[type.title, styles.plum, styles.center]} accessibilityRole="header">
          hi! i&apos;m mochi ♡
        </Text>
        <Text style={[type.body, styles.sub, styles.center]}>i just need two tiny things before we play</Text>
      </View>

      <View style={styles.list}>
        <PermCard
          tint={color.mint}
          icon="camera"
          title="camera"
          text="so we can snap your cutest moments"
          perm={cam}
          request={requestCam}
        />
        <PermCard
          tint={color.lavender}
          icon="photos"
          title="photos"
          text="so your strips save to your gallery"
          perm={lib}
          request={requestLib}
        />
      </View>

      <View style={styles.grow} />
      <PillButton label="next ♡" disabled={!ready} onPress={() => router.replace('/name')} />
      <Text style={[type.caption, styles.sub, styles.center]}>you can change this anytime in settings</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 14 },
  head: { alignItems: 'center', gap: 6, paddingTop: 12 },
  mochi: { marginBottom: 4 },
  list: { gap: 12, marginTop: 10 },
  perm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.card,
    boxShadow: shadow.soft,
  },
  permIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: color.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: { flex: 1, gap: 2, minWidth: 0 },
  smBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: color.white,
    justifyContent: 'center',
    boxShadow: `${shadow.soft}, inset 0px -3px 0px rgba(107,74,94,0.08)`,
  },
  okPill: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smLabel: { ...type.heading, fontSize: 15, lineHeight: 18, color: color.plum, includeFontPadding: false },
  grow: { flex: 1 },
  plum: { color: color.plum },
  sub: { color: color.plumSoft },
  center: { textAlign: 'center' },
});
