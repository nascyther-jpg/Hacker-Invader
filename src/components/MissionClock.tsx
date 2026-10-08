import { StyleSheet, View } from 'react-native';
import { TEAMS, formatDuration } from '../game/config';
import { useMission } from '../game/store';
import { color, space, toneColor } from '../theme/tokens';
import { Chamfer } from './Chamfer';
import { Icon } from './Icon';
import { Txt } from './Txt';
import { useElapsed } from './useElapsed';

// Faixa do Hacker vs Hacker: time deste aparelho + cronômetro da missão.
// O cronômetro para no último bloco.

export function MissionClock() {
  const { setup, startedAt, finishedAt } = useMission();
  const elapsed = useElapsed(startedAt, finishedAt);
  const tone = toneColor[setup.team === 'A' ? 'primary' : 'cyan'];
  const time = formatDuration(elapsed);

  return (
    <Chamfer cut="sm" fill={tone.bg} stroke={tone.fg} style={styles.bar}>
      <View style={styles.team}>
        <Icon name="account-group" tone={tone.fg} />
        <Txt variant="label" tone={tone.fg}>
          {TEAMS[setup.team].name}
        </Txt>
      </View>
      <View
        style={styles.team}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={`Tempo da missão ${time}`}
      >
        <Icon name="timer-outline" size="sm" tone={color.muted} />
        <Txt variant="title" tone={color.text} style={styles.time}>
          {time}
        </Txt>
      </View>
    </Chamfer>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
  },
  team: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  time: { fontVariant: ['tabular-nums'] },
});
