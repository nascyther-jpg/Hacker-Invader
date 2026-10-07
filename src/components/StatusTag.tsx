import { StyleSheet, View } from 'react-native';
import { radius, space, toneColor, type Tone } from '../theme/tokens';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

// Rótulo de estado. Sempre ícone + texto: nunca depende só da cor.
export function StatusTag({
  label,
  icon,
  tone = 'muted',
  center,
}: {
  label: string;
  icon: IconName;
  tone?: Tone;
  center?: boolean;
}) {
  const c = toneColor[tone];
  return (
    <View style={[styles.tag, { backgroundColor: c.bg }, center && styles.center]}>
      <Icon name={icon} size="sm" tone={c.fg} />
      <Txt variant="label" tone={c.fg}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.sm,
    paddingVertical: space.xs + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
  },
  center: { alignSelf: 'center' },
});
