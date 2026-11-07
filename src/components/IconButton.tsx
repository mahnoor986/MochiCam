import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Squishable } from '@/components/Squishable';
import { color, layout, radius, shadow, type } from '@/theme';

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** glass = translucent white over the camera preview */
  variant?: 'solid' | 'glass';
  /** little butter tag in the corner (timer "3s") */
  tag?: string;
  iconSize?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, label, onPress, variant = 'solid', tag, iconSize = 22, strokeWidth, style }: Props) {
  const glass = variant === 'glass';
  return (
    <Squishable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.base, glass ? styles.glass : styles.solid, style]}
    >
      <Icon name={icon} size={iconSize} strokeWidth={strokeWidth} color={glass ? color.white : color.plum} />
      {tag ? (
        <Text style={styles.tag} numberOfLines={1}>
          {tag}
        </Text>
      ) : null}
    </Squishable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: layout.iconButton,
    height: layout.iconButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: { backgroundColor: color.white, boxShadow: shadow.soft },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.26)',
    boxShadow: 'inset 0px 0px 0px 1px rgba(255,255,255,0.45)',
  },
  tag: {
    ...type.micro,
    fontSize: 10,
    lineHeight: 18,
    position: 'absolute',
    right: -5,
    bottom: -4,
    minWidth: 22,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: color.butter,
    color: color.plum,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
