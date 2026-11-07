// the 8 booth filters. `tint` is laid over the live preview and baked into the saved photo;
// `matrix` is a 4×5 color matrix (skia layout, translations 0..1) applied to the photo first.
import type { ViewStyle } from 'react-native';

export type Tint = string | { angle: number; colors: string[] };

export type Filter = {
  id: string;
  name: string;
  tint: Tint | null;
  matrix?: number[];
  /** live preview can't recolor the camera feed itself, so b&w gets a soft grey wash there instead */
  previewTint?: string;
};

const LUMA = [0.2126, 0.7152, 0.0722];

/** css saturate(s) */
function saturate(s: number): number[] {
  const [r, g, b] = LUMA;
  return [
    r + (1 - r) * s, g - g * s, b - b * s, 0, 0,
    r - r * s, g + (1 - g) * s, b - b * s, 0, 0,
    r - r * s, g - g * s, b + (1 - b) * s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

/** css brightness(k) */
function brightness(k: number): number[] {
  return [k, 0, 0, 0, 0, 0, k, 0, 0, 0, 0, 0, k, 0, 0, 0, 0, 0, 1, 0];
}

/** css grayscale(1) contrast(c) brightness(k), applied in that order */
function softGray(c: number, k: number): number[] {
  const row = [...LUMA.map((v) => v * c * k), 0, 0.5 * (1 - c) * k];
  return [...row, ...row, ...row, 0, 0, 0, 1, 0];
}

export const FILTERS: Filter[] = [
  { id: 'original', name: 'original', tint: null },
  { id: 'peachy', name: 'peachy', tint: 'rgba(255,186,150,0.32)', matrix: saturate(1.06) },
  { id: 'strawberry', name: 'strawberry milk', tint: 'rgba(255,168,205,0.36)', matrix: brightness(1.04) },
  { id: 'mint', name: 'mint soda', tint: 'rgba(140,232,196,0.34)' },
  { id: 'lavender', name: 'lavender dream', tint: 'rgba(196,170,255,0.38)' },
  {
    id: 'cotton',
    name: 'cotton candy',
    tint: { angle: 135, colors: ['rgba(255,170,206,0.42)', 'rgba(205,182,255,0.34)', 'rgba(160,232,206,0.34)'] },
  },
  {
    id: 'bw',
    name: 'soft b&w',
    tint: 'rgba(255,246,240,0.14)',
    matrix: softGray(0.9, 1.06),
    previewTint: 'rgba(236,230,233,0.5)',
  },
  {
    id: 'sunset',
    name: 'sunset glow',
    tint: { angle: 180, colors: ['rgba(255,212,130,0.36)', 'rgba(255,140,170,0.36)'] },
    matrix: saturate(1.12),
  },
];

export const filterById = (id: string) => FILTERS.find((f) => f.id === id) ?? FILTERS[0];

/** a view style that paints the tint (solid or css gradient) */
export function tintStyle(tint: Tint | null | undefined): ViewStyle {
  if (!tint) return {};
  if (typeof tint === 'string') return { backgroundColor: tint };
  return { backgroundImage: `linear-gradient(${tint.angle}deg, ${tint.colors.join(', ')})` };
}
