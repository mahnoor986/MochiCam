import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Squishable } from '@/components/Squishable';
import { color, layout, radius, shadow, type } from '@/theme';

export type PillVariant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: PillVariant;
  /** 72 tall with the larger label (start booth, that's me) */
  xl?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PillButton({ label, onPress, variant = 'primary', xl, disabled, icon, style }: Props) {
  return (
    <Squishable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.base,
        { height: xl ? layout.buttonXl : layout.button },
        disabled ? styles.disabled : styles[variant],
        style,
      ]}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[xl ? type.buttonLg : type.button, styles.label, disabled && styles.labelDisabled]}
      >
        {label}
      </Text>
    </Squishable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: color.pink,
    boxShadow: `${shadow.glow}, ${shadow.lip}`,
  },
  secondary: {
    backgroundColor: color.lavender,
    boxShadow: '0px 6px 18px rgba(184,155,255,0.35), inset 0px -4px 0px rgba(150,120,220,0.22)',
  },
  ghost: {
    backgroundColor: color.white,
    boxShadow: `${shadow.soft}, inset 0px 0px 0px 2px ${color.line}`,
  },
  disabled: { backgroundColor: '#F3E6EC' },
  label: { color: color.plum, includeFontPadding: false },
  labelDisabled: { color: 'rgba(154,123,141,0.7)' },
});
