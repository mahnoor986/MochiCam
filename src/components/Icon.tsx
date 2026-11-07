// line icons from design/mochicam.html (24 grid, round caps)
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { color } from '@/theme';

const ICONS = {
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  back: <Path d="M15 5l-7 7 7 7" />,
  next: <Path d="M9 5l7 7-7 7" />,
  flip: (
    <>
      <Path d="M4.5 10A8 8 0 0 1 18 6.5L20 8.5" />
      <Path d="M20 4v4.5h-4.5" />
      <Path d="M19.5 14A8 8 0 0 1 6 17.5L4 15.5" />
      <Path d="M4 20v-4.5h4.5" />
    </>
  ),
  timer: (
    <>
      <Circle cx={12} cy={13.5} r={7.5} />
      <Path d="M12 10v3.5l2.5 2" />
      <Path d="M9.5 3h5" />
    </>
  ),
  flash: <Path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />,
  flashOff: (
    <>
      <Path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />
      <Path d="M3.5 3.5l17 17" />
    </>
  ),
  camera: (
    <>
      <Path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <Circle cx={12} cy={12.5} r={3.5} />
    </>
  ),
  photos: (
    <>
      <Rect x={3.5} y={6} width={13.5} height={13.5} rx={3} />
      <Path d="M7.5 3h10A3.5 3.5 0 0 1 21 6.5v10" />
      <Path d="M3.5 16l4-4 5 5" />
    </>
  ),
  share: (
    <>
      <Path d="M12 15V3.5" />
      <Path d="M7.5 8L12 3.5 16.5 8" />
      <Path d="M5 13v5a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-5" />
    </>
  ),
  trash: (
    <>
      <Path d="M4 7h16" />
      <Path d="M9.5 7V4.5h5V7" />
      <Path d="M6.5 7l1 12.5h9l1-12.5" />
    </>
  ),
  pencil: (
    <>
      <Path d="M4 20h4L19.5 8.5l-4-4L4 16z" />
      <Path d="M13.5 6.5l4 4" />
    </>
  ),
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  single: (
    <>
      <Rect x={5} y={4} width={14} height={16} rx={3} />
      <Circle cx={12} cy={11} r={3} />
    </>
  ),
  strip: (
    <>
      <Rect x={7.5} y={2.5} width={9} height={19} rx={2} />
      <Path d="M10 7h4M10 11h4M10 15h4" />
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;

type Props = { name: IconName; size?: number; strokeWidth?: number; color?: string };

export function Icon({ name, size = 22, strokeWidth = 2.2, color: c = color.plum }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </Svg>
  );
}
