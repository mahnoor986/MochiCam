// mochicam design tokens. values come from design/mochicam.html; change them here, nowhere else.
import { useWindowDimensions } from 'react-native';

export const color = {
  pink: '#FFB7D5',
  pinkDeep: '#FF8FBF',
  pinkSoft: '#FFE4EF',
  cream: '#FFF6F0',
  white: '#FFFFFF',
  mint: '#B8F0D8',
  mintDeep: '#7FDDB5',
  lavender: '#D9C6FF',
  lavDeep: '#B89BFF',
  lavSoft: '#F1EAFF',
  butter: '#FFF1A8',
  butterDeep: '#FFE07A',
  plum: '#6B4A5E',
  plumSoft: '#9A7B8D',
  line: '#F2DCE5',
} as const;

export const font = {
  head: 'Fredoka_600SemiBold',
  headBold: 'Fredoka_700Bold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: font.headBold, fontSize: 44, lineHeight: 48 },
  title: { fontFamily: font.head, fontSize: 28, lineHeight: 32 },
  buttonLg: { fontFamily: font.head, fontSize: 22, lineHeight: 26 },
  heading: { fontFamily: font.head, fontSize: 20, lineHeight: 24 },
  button: { fontFamily: font.head, fontSize: 19, lineHeight: 24 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22 },
  toast: { fontFamily: font.bodyHeavy, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: font.bodyBold, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: font.bodyHeavy, fontSize: 11, lineHeight: 14 },
  countdown: { fontFamily: font.headBold, fontSize: 150, lineHeight: 150 },
} as const;

export const radius = { photo: 6, sm: 12, md: 16, card: 24, sheet: 32, pill: 999 } as const;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, x3: 32, x4: 40 } as const;

const clamp = (min: number, v: number, max: number) => Math.min(max, Math.max(min, v));

export const layout = {
  gutter: (w: number) => clamp(16, w * 0.05, 22),
  shutter: (w: number) => clamp(78, w * 0.21, 90),
  stripWidth: (w: number) => clamp(112, w * 0.29, 132),
  button: 60,
  buttonXl: 72,
  iconButton: 44,
  chip: 56,
  toggle: 52,
  toast: 44,
} as const;

/** width-driven sizes, recomputed on rotation / window changes */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    gutter: layout.gutter(width),
    shutter: layout.shutter(width),
    stripWidth: layout.stripWidth(width),
  };
}

// boxShadow strings need RN 0.76+ with the new architecture (SDK 58 has both).
export const shadow = {
  glow: '0px 10px 28px rgba(255,143,191,0.38)',
  soft: '0px 4px 16px rgba(107,74,94,0.10)',
  lift: '0px 14px 34px rgba(107,74,94,0.16)',
  lip: 'inset 0px -4px 0px rgba(255,120,175,0.35)',
} as const;

export const motion = {
  squish: { pressScale: 0.92, pressMs: 80, spring: { damping: 12, stiffness: 260 } },
  countdown: { stepMs: 850, popMs: 720, keyframes: [0.2, 1.22, 0.9, 1.05, 1] },
  flashMs: 500,
  flashOnMs: 800,
  hearts: { count: 12, durationMs: 1600, rise: 190, drift: 60 },
  toast: { rise: 16, fromScale: 0.9, holdMs: 1900 },
  screenEnter: { rise: 10, ms: 340 },
  mascot: { bob: 7, bobMs: 2400, earMs: 3600 },
} as const;
