import { Redirect, router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { BtcAmount } from '../components/BtcAmount';
import { Chamfer } from '../components/Chamfer';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { NodeTrack } from '../components/NodeTrack';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { StatusTag } from '../components/StatusTag';
import { Txt } from '../components/Txt';
import { MissionClock } from '../components/MissionClock';
import { clueText, millions, pad2 } from '../game/config';
import { useMission } from '../game/store';
import { color, glow, space, touch } from '../theme/tokens';

export default function Home() {
  const { btc, total, mode, route, started, complete, decrypted, reset, story, unmasked } = useMission();
  const missing = total - btc;
  // Roteiro: depois da meta ainda falta desmascarar o hacker (pista extra + crachá do tio).
  const hunting = story && complete && !unmasked;
  const clueId = btc; // pista atual: 0 na abertura, N depois do bloco N; no roteiro, `total` é a extra
  const clueOpen = decrypted.includes(clueId);
  const clueName = hunting ? 'Pista extra' : `Pista do bloco ${pad2(clueId + 1)}`;

  // Recreador: segurar a carteira por 2s zera a missão e volta à configuração.
  const askReset = () =>
    Alert.alert('Reiniciar missão?', 'Todo o progresso deste aparelho será apagado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reiniciar',
        style: 'destructive',
        onPress: () => {
          reset();
          router.replace('/setup');
        },
      },
    ]);

  if (!started) return <Redirect href="/setup" />;

  return (
    <Screen
      title="Carteira secreta"
      right={{ icon: 'history', label: 'Histórico de blocos', onPress: () => router.push('/history') }}
      scroll
      footer={
        hunting ? (
          <Button label="Escanear o crachá" icon="qrcode-scan" onPress={() => router.push('/scan')} />
        ) : complete ? (
          <Button label="Ver missão completa" icon="flag-checkered" onPress={() => router.push('/complete')} />
        ) : (
          <Button
            label="Escanear bloco"
            icon="qrcode-scan"
            onPress={() => router.push('/scan')}
            accessibilityHint="Abre a câmera para ler um código"
          />
        )
      }
    >
      {mode === 'versus' || story ? <MissionClock /> : null}

      <Pressable onLongPress={askReset} delayLongPress={2000} accessible={false}>
        <Chamfer cut="lg" fill={color.surface} stroke={complete ? color.primary : color.lineStrong} style={styles.hero}>
          <StatusTag
            label={complete ? 'Carteira desbloqueada' : 'Carteira bloqueada'}
            icon={complete ? 'lock-open-variant-outline' : 'lock-outline'}
            tone={complete ? 'primary' : 'muted'}
          />
          <BtcAmount value={btc} tone={btc > 0 ? color.primary : color.text} millions={story} />
          <Txt variant="body" tone={color.muted}>
            {hunting
              ? 'Meta batida! Siga a pista extra e encontre o hacker.'
              : complete
              ? 'Você recuperou todos os blocos.'
              : story
                ? `Meta: ${millions(total)} de BTC. ${missing === 1 ? 'Falta 1 bloco.' : `Faltam ${missing} blocos.`}`
              : missing === total
                ? total === 1
                  ? 'Encontre o bloco escondido no resort para abrir a carteira.'
                  : `Encontre ${total} blocos escondidos no resort para abrir a carteira.`
                : missing === 1
                  ? 'Falta 1 bloco para abrir a carteira.'
                  : `Faltam ${missing} blocos para abrir a carteira.`}
          </Txt>
        </Chamfer>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Txt variant="label" tone={color.muted}>
            Blocos
          </Txt>
          <Txt variant="code" tone={color.text}>
            {btc}/{total}
          </Txt>
        </View>
        <NodeTrack done={btc} total={total} size="lg" />
      </View>

      {!complete || hunting ? (
        <PressableScale
          onPress={() => router.push({ pathname: '/clue/[id]', params: { id: String(clueId) } })}
          accessibilityRole="button"
          accessibilityLabel={
            clueOpen ? `${clueName}: ${clueText(clueId, route, story)}` : 'Decifrar a pista atual'
          }
        >
          <Chamfer
            fill={clueOpen ? color.surface : color.cyanDim}
            stroke={clueOpen ? color.line : color.cyan}
            glow={clueOpen ? undefined : glow.cyan}
            style={styles.clue}
          >
            <View style={styles.clueHead}>
              <Txt variant="label" tone={clueOpen ? color.muted : color.cyan}>
                {clueName}
              </Txt>
              <Icon name={clueOpen ? 'arrow-right' : 'lock-outline'} tone={clueOpen ? color.muted : color.cyan} />
            </View>
            {clueOpen ? (
              <Txt variant="bodyBold" numberOfLines={2}>
                {clueText(clueId, route, story)}
              </Txt>
            ) : (
              <Txt variant="title">Nova pista cifrada. Toque para decifrar.</Txt>
            )}
          </Chamfer>
        </PressableScale>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  section: { gap: space.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clue: { minHeight: touch.button, padding: space.xl, gap: space.md },
  clueHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
