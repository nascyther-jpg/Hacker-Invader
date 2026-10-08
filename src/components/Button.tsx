import { StyleSheet, View } from 'react-native';
import { color, space, touch } from '../theme/tokens';
import { Chamfer } from './Chamfer';
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
  const content = (
    <View style={styles.row}>
      {icon ? <Icon name={icon} tone={fg} /> : null}
      <Txt variant="button" tone={fg}>
        {label}
      </Txt>
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={styles.stretch}
    >
      {variant === 'ghost' ? (
        <View style={[styles.base, styles.ghost]}>{content}</View>
      ) : (
        <Chamfer
          style={styles.base}
          fill={variant === 'primary' ? color.primary : color.surface}
          stroke={variant === 'secondary' ? color.lineStrong : undefined}
        >
          {content}
          {variant === 'primary' ? <View style={styles.tick} /> : null}
        </Chamfer>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  stretch: { alignSelf: 'stretch' },
  base: {
    minHeight: touch.button,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  ghost: { minHeight: touch.min },
  // Marca de canto típica de HUD: um traço escuro no topo direito do botão.
  tick: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 18,
    height: 3,
    backgroundColor: color.onPrimary,
    opacity: 0.6,
  },
});
