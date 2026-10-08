import { StyleSheet, View } from 'react-native';
import { space, toneColor, type Tone } from '../theme/tokens';
import { Chamfer } from './Chamfer';
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
    <View style={[styles.wrap, center && styles.center]}>
      <Chamfer cut="sm" corners={['tl']} fill={c.bg} style={styles.tag}>
        <View style={[styles.bar, { backgroundColor: c.fg }]} />
        <Icon name={icon} size="sm" tone={c.fg} />
        <Txt variant="label" tone={c.fg}>
          {label}
        </Txt>
      </Chamfer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
  center: { alignSelf: 'center' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xs + 2,
    paddingLeft: space.md + 2,
    paddingRight: space.md,
  },
  bar: { position: 'absolute', left: 0, top: 6, bottom: 0, width: 3 },
});
