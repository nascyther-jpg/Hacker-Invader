import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { color, space, touch, toneColor, type Tone } from '../theme/tokens';
import { Chamfer } from './Chamfer';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

// Opção selecionável (rádio). Selecionada = contorno na cor do tom + check.
export function Choice({
  label,
  description,
  icon,
  selected,
  onPress,
  tone = 'primary',
  style,
}: {
  label: string;
  description?: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  const c = toneColor[tone];
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={description ? `${label}. ${description}` : label}
      style={style}
    >
      <Chamfer
        fill={selected ? c.bg : color.surface}
        stroke={selected ? c.fg : color.line}
        strokeWidth={selected ? 2 : 1.5}
        style={styles.box}
      >
        <View style={styles.head}>
          {icon ? <Icon name={icon} tone={selected ? c.fg : color.muted} /> : null}
          <Txt variant="title" tone={selected ? color.text : color.muted} style={styles.flex}>
            {label}
          </Txt>
          <Icon
            name={selected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
            tone={selected ? c.fg : color.lineStrong}
          />
        </View>
        {description ? (
          <Txt variant="body" tone={color.muted}>
            {description}
          </Txt>
        ) : null}
      </Chamfer>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  box: { minHeight: touch.button, padding: space.lg, gap: space.sm, justifyContent: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
