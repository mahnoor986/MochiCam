import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { color, radius, shadow } from '@/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: color.white, borderRadius: radius.card, boxShadow: shadow.soft }, style]}>
      {children}
    </View>
  );
}
