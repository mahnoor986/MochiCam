import Svg, { Path } from 'react-native-svg';

import { HEART_P } from '@/components/shapes';
import { color } from '@/theme';

export function Heart({ size = 16, fill = color.pinkDeep }: { size?: number; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={HEART_P} fill={fill} />
    </Svg>
  );
}
