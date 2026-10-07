import { StyleSheet, View } from 'react-native';
import { color, radius, space, touch } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: Variant;
  disabled?: boolean;
  accessibilityHint?: string;
};

export function Button({ label, onPress, icon, variant = 'primary', disabled, accessibilityHint }: Props) {
  const fg = variant === 'primary' ? color.onPrimary : variant === 'secondary' ? color.text : color.muted;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[styles.base, styles[variant]]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} tone={fg} /> : null}
        <Txt variant="button" tone={fg}>
          {label}
        </Txt>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch.button,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  primary: { backgroundColor: color.primary },
  secondary: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  ghost: { minHeight: touch.min, backgroundColor: 'transparent' },
});
