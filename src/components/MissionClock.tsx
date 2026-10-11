import { StyleSheet, View } from 'react-native';
import { STORY, TEAMS, formatDuration, storyMidpoint } from '../game/config';
import { useMission } from '../game/store';
import { color, space, toneColor } from '../theme/tokens';
import { Chamfer } from './Chamfer';
import { Icon } from './Icon';
import { Txt } from './Txt';
import { useElapsed } from './useElapsed';

// Faixa do tempo da missão.
// Hacker vs Hacker: time deste aparelho + cronômetro. Roteiro do hacker: contagem regressiva
// até o prazo e, depois da invasão do meio, o upload da imagem. Para no último bloco.

export function MissionClock() {
  const { setup, story, startedAt, finishedAt, btc, total } = useMission();
  const elapsed = useElapsed(startedAt, finishedAt);
  const versus = setup.mode === 'versus';
  const limit = STORY.minutes * 60_000;
  const left = limit - elapsed;
  const over = story && left <= 0;
  const tone = over ? toneColor.danger : toneColor[versus && setup.team === 'B' ? 'cyan' : 'primary'];
  const time = formatDuration(story ? left : elapsed);
  const mid = storyMidpoint(total);
  const leaking = story && mid !== null && btc >= mid && finishedAt === null;
  const pct = Math.min(99, Math.round((elapsed / limit) * 100));

  return (
    <Chamfer cut="sm" fill={tone.bg} stroke={tone.fg} style={styles.bar}>
      <View style={styles.row}>
        <View style={styles.team}>
          <Icon name={versus ? 'account-group' : 'skull-outline'} tone={tone.fg} />
          <Txt variant="label" tone={tone.fg}>
            {over ? 'Tempo esgotado' : versus ? TEAMS[setup.team].name : 'Prazo do hacker'}
          </Txt>
        </View>
        <View
          style={styles.team}
          accessible
          accessibilityRole="timer"
          accessibilityLabel={story ? `Tempo restante ${time}` : `Tempo da missão ${time}`}
        >
          <Icon name={story ? 'timer-sand' : 'timer-outline'} size="sm" tone={color.muted} />
          <Txt variant="title" tone={over ? color.danger : color.text} style={styles.time}>
            {time}
          </Txt>
        </View>
      </View>
      {leaking ? (
        <View style={styles.leak} accessible accessibilityLabel={`Imagem carregando ${pct} por cento`}>
          <Txt variant="label" tone={color.danger}>
            Imagem carregando {pct}%
          </Txt>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </View>
      ) : null}
    </Chamfer>
  );
}

const styles = StyleSheet.create({
  bar: { paddingVertical: space.sm, paddingHorizontal: space.lg, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  time: { fontVariant: ['tabular-nums'] },
  leak: { gap: space.xs, paddingBottom: space.xs },
  track: { height: 4, backgroundColor: color.line, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: color.danger },
});
