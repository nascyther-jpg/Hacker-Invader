import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Brackets } from '../../components/Brackets';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { Signal } from '../../components/Signal';
import { StatusTag } from '../../components/StatusTag';
import { Txt } from '../../components/Txt';
import { useDecrypt } from '../../components/useDecrypt';
import { clueText, pad2 } from '../../game/config';
import { useMission } from '../../game/store';
import { color, space } from '../../theme/tokens';

// Charada: DECIFRANDO -> mensagem revelada -> pista disponível.
// A animação roda só na primeira abertura de cada pista.

export default function Clue() {
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = Number(raw);
  const { btc, route, complete, decrypted, story, unmasked } = useMission();
  const text = clueText(id, route, story);
  const unlocked = text !== undefined && id <= btc;
  // Pista extra do roteiro: depois da meta, leva ao crachá do tio.
  const extra = story && id === route.length;
  const title = extra ? 'Pista extra' : `Pista do bloco ${pad2(id + 1)}`;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  if (!unlocked) {
    return (
      <Screen
        title={title}
        left={{ icon: 'chevron-left', label: 'Voltar', onPress: back }}
        centered
        footer={<Button label="Voltar à base" variant="secondary" onPress={() => router.replace('/home')} />}
      >
        <View style={styles.locked}>
          <Signal icon="lock-outline" tone="muted" enter="none" />
          <Txt variant="title" center>
            Pista protegida
          </Txt>
          <Txt variant="body" tone={color.muted} center>
            Recupere o bloco {pad2(id)} para liberar esta pista.
          </Txt>
        </View>
      </Screen>
    );
  }

  return (
    <Reveal
      id={id}
      title={title}
      text={text}
      extra={extra}
      firstTime={!decrypted.includes(id)}
      isCurrent={extra ? !unmasked : id === btc && !complete}
      onBack={back}
    />
  );
}

function Reveal({
  id,
  title,
  text,
  extra,
  firstTime,
  isCurrent,
  onBack,
}: {
  id: number;
  title: string;
  text: string;
  extra: boolean;
  firstTime: boolean;
  isCurrent: boolean;
  onBack: () => void;
}) {
  const { markDecrypted } = useMission();
  const { output, progress, done } = useDecrypt(text, { run: firstTime });

  useEffect(() => {
    if (done) markDecrypted(id);
  }, [done, id, markDecrypted]);

  return (
    <Screen
      title={title}
      left={{ icon: 'chevron-left', label: 'Voltar', onPress: onBack }}
      scroll
      footer={
        isCurrent ? (
          <Button
            label={extra ? 'Escanear o crachá' : 'Escanear bloco'}
            icon="qrcode-scan"
            disabled={!done}
            // replace: a pista sai da pilha e o voltar depois do scan cai na base
            onPress={() => router.replace('/scan')}
          />
        ) : (
          <Button label="Voltar à base" variant="secondary" onPress={() => router.replace('/home')} />
        )
      }
    >
      <View style={styles.status} accessibilityLiveRegion="polite">
        {done ? (
          <StatusTag label="Mensagem decifrada" icon="lock-open-variant-outline" tone="primary" />
        ) : (
          <StatusTag label={`Decifrando ${Math.round(progress * 100)}%`} icon="key-variant" tone="cyan" />
        )}
      </View>

      <Brackets style={styles.panel} tone={done ? color.primary : color.cyan}>
        {/* O texto real reserva o espaço; o texto cifrado fica por cima, sem pular layout. */}
        <Txt variant="clue" style={styles.ghost} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {text}
        </Txt>
        <Txt
          variant="clue"
          tone={done ? color.text : color.cyan}
          style={styles.overlay}
          accessibilityLabel={done ? text : 'Decifrando a mensagem'}
        >
          {output}
        </Txt>
      </Brackets>

      {done && isCurrent ? (
        <Txt variant="body" tone={color.muted}>
          {extra ? 'Achou o hacker? Escaneie o QR do crachá dele.' : 'Achou o lugar? Procure o código do bloco e escaneie.'}
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  locked: { alignItems: 'center', gap: space.lg },
  status: { paddingTop: space.sm },
  panel: { padding: space.xl, overflow: 'hidden' },
  ghost: { opacity: 0 },
  overlay: { position: 'absolute', top: space.xl, left: space.xl, right: space.xl, bottom: space.xl },
});
