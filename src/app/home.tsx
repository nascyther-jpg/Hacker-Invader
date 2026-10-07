import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { BtcAmount } from '../components/BtcAmount';
import { Brackets } from '../components/Brackets';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { NodeTrack } from '../components/NodeTrack';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { StatusTag } from '../components/StatusTag';
import { Txt } from '../components/Txt';
import { MISSION, clueText, pad2 } from '../game/config';
import { useMission } from '../game/store';
import { color, glow, radius, space, touch } from '../theme/tokens';

export default function Home() {
  const { btc, complete, decrypted, reset } = useMission();
  const missing = MISSION.totalNodes - btc;
  const clueId = btc; // pista atual: 0 na abertura, N depois do bloco N
  const clueOpen = decrypted.includes(clueId);

  // Recreador: segurar a carteira por 2s zera a missão para o próximo grupo.
  const askReset = () =>
    Alert.alert('Reiniciar missão?', 'Todo o progresso deste aparelho será apagado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: reset },
    ]);

  return (
    <Screen
      title="Carteira secreta"
      right={{ icon: 'history', label: 'Histórico de blocos', onPress: () => router.push('/history') }}
      scroll
      footer={
        complete ? (
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
      <Pressable onLongPress={askReset} delayLongPress={2000} accessible={false}>
        <Brackets style={styles.hero} tone={complete ? color.primary : color.lineStrong}>
          <StatusTag
            label={complete ? 'Carteira desbloqueada' : 'Carteira bloqueada'}
            icon={complete ? 'lock-open-variant-outline' : 'lock-outline'}
            tone={complete ? 'primary' : 'muted'}
          />
          <BtcAmount value={btc} tone={btc > 0 ? color.primary : color.text} />
          <Txt variant="body" tone={color.muted}>
            {complete
              ? 'Você recuperou todos os blocos.'
              : missing === MISSION.totalNodes
                ? `Encontre ${MISSION.totalNodes} blocos escondidos no resort para abrir a carteira.`
                : `Faltam ${missing} ${missing === 1 ? 'bloco' : 'blocos'} para abrir a carteira.`}
          </Txt>
        </Brackets>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Txt variant="label" tone={color.muted}>
            Blocos
          </Txt>
          <Txt variant="code" tone={color.text}>
            {btc}/{MISSION.totalNodes}
          </Txt>
        </View>
        <NodeTrack done={btc} size="lg" />
      </View>

      {!complete ? (
        <PressableScale
          onPress={() => router.push({ pathname: '/clue/[id]', params: { id: String(clueId) } })}
          accessibilityRole="button"
          accessibilityLabel={clueOpen ? `Pista do bloco ${pad2(clueId + 1)}: ${clueText(clueId)}` : 'Decifrar a pista atual'}
          style={[styles.clue, !clueOpen && styles.clueLocked]}
        >
          <View style={styles.clueHead}>
            <Txt variant="label" tone={clueOpen ? color.muted : color.cyan}>
              Pista do bloco {pad2(clueId + 1)}
            </Txt>
            <Icon name={clueOpen ? 'arrow-right' : 'lock-outline'} tone={clueOpen ? color.muted : color.cyan} />
          </View>
          {clueOpen ? (
            <Txt variant="bodyBold" numberOfLines={2}>
              {clueText(clueId)}
            </Txt>
          ) : (
            <Txt variant="title">Nova pista cifrada. Toque para decifrar.</Txt>
          )}
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
  clue: {
    minHeight: touch.button,
    padding: space.xl,
    gap: space.md,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  clueLocked: { borderColor: color.cyan, boxShadow: glow.cyan },
  clueHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
