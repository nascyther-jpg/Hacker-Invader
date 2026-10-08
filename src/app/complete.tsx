import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BtcAmount } from '../components/BtcAmount';
import { Button } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { GlitchText } from '../components/GlitchText';
import { NodeTrack } from '../components/NodeTrack';
import { Screen } from '../components/Screen';
import { Signal } from '../components/Signal';
import { Txt } from '../components/Txt';
import { TEAMS, blockHash, finalMessage, formatDuration, pad2 } from '../game/config';
import { useMission } from '../game/store';
import { color, space } from '../theme/tokens';

export default function Complete() {
  const { blocks, complete, total, mode, setup, startedAt, finishedAt: doneAt } = useMission();
  const versus = mode === 'versus';
  const home = () => router.replace('/home');

  if (!complete) {
    // Chegou aqui sem terminar (link direto): volta para a base.
    return (
      <Screen centered footer={<Button label="Voltar à base" onPress={home} />}>
        <Txt variant="title" center>
          A missão ainda não acabou.
        </Txt>
      </Screen>
    );
  }

  const finishedAt = new Date(doneAt ?? Date.now());
  const duration = formatDuration((doneAt ?? 0) - (startedAt ?? 0));
  // Selo para o recreador conferir: muda a cada missão concluída.
  const seal = blockHash(blocks.map((b) => `${b.index}${b.at}`).join('')).slice(2, 8);

  return (
    <Screen centered footer={<Button label="Voltar à base" variant="secondary" onPress={home} />}>
      <Animated.View entering={FadeIn.duration(260)} style={styles.stack}>
        <Signal icon="lock-open-variant-outline" tone="primary" glowing />
        <View style={styles.heading}>
          <Txt variant="label" tone={color.primary} center>
            {versus ? `Missão cumprida · ${TEAMS[setup.team].name}` : 'Missão cumprida'}
          </Txt>
          <GlitchText center>Carteira recuperada</GlitchText>
        </View>

        {versus ? (
          <View
            style={styles.amount}
            accessible
            accessibilityLabel={`Tempo do time ${duration}`}
          >
            <Txt variant="label" tone={color.muted}>
              Tempo do time
            </Txt>
            <Txt variant="hero" tone={color.primary} style={styles.time}>
              {duration}
            </Txt>
          </View>
        ) : (
          <View style={styles.amount}>
            <BtcAmount value={total} tone={color.primary} />
          </View>
        )}
        <NodeTrack done={total} total={total} />

        <Txt variant="body" center>
          {finalMessage(mode)}
        </Txt>

        <Chamfer cut="sm" fill={color.surface} stroke={color.line} style={styles.seal}>
          <View style={styles.sealRow} accessible accessibilityLabel={`Selo da missão ${seal.split('').join(' ')}`}>
            <Txt variant="label" tone={color.muted}>
              Selo
            </Txt>
            <Txt variant="code">{seal}</Txt>
            <Txt variant="label" tone={color.muted}>
              {pad2(finishedAt.getHours())}:{pad2(finishedAt.getMinutes())}
            </Txt>
          </View>
        </Chamfer>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.xl },
  heading: { gap: space.sm, alignItems: 'center' },
  amount: { alignItems: 'center', gap: space.xs },
  time: { fontSize: 88, lineHeight: 88, fontVariant: ['tabular-nums'] },
  seal: { paddingVertical: space.md, paddingHorizontal: space.lg },
  sealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
