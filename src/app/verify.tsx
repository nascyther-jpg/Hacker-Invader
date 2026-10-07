import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BtcAmount } from '../components/BtcAmount';
import { Brackets } from '../components/Brackets';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { NodeTrack } from '../components/NodeTrack';
import { Screen } from '../components/Screen';
import { Signal } from '../components/Signal';
import { StatusTag } from '../components/StatusTag';
import { Txt } from '../components/Txt';
import { MISSION, blockHash, pad2 } from '../game/config';
import { useMission, type ScanResult } from '../game/store';
import { color, radius, space } from '../theme/tokens';

// QR válido:   VERIFICANDO -> BLOCO VERIFICADO -> +1 BTC (carteira e progresso atualizam) -> pista
// QR inválido: VERIFICANDO -> BLOCO NÃO RECONHECIDO -> tentar de novo

type Phase = 'verifying' | 'verified' | 'acquired';

const VERIFY_MS = 1100;
const VERIFIED_MS = 1000;

export default function Verify() {
  const { code = '' } = useLocalSearchParams<{ code: string }>();
  const { check, acquire } = useMission();
  // O resultado é congelado na chegada: o estado muda logo depois (acquire).
  const [result] = useState<ScanResult>(() => check(code));
  const [phase, setPhase] = useState<Phase>('verifying');
  const reduced = useReducedMotion();

  useEffect(() => {
    if (phase === 'verifying') {
      const t = setTimeout(() => setPhase(result.kind === 'valid' ? 'verified' : 'acquired'), reduced ? 400 : VERIFY_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'verified' && result.kind === 'valid') {
      const t = setTimeout(() => {
        acquire(result.node.index);
        setPhase('acquired');
      }, reduced ? 500 : VERIFIED_MS);
      return () => clearTimeout(t);
    }
  }, [phase, result, reduced, acquire]);

  const retry = () => router.replace('/scan');
  const home = () => router.replace('/home');

  if (phase === 'verifying') return <Verifying code={code} />;

  if (result.kind === 'valid') {
    if (phase === 'verified') {
      return (
        <ResultScreen key="verified">
          <Signal icon="check-decagram-outline" tone="primary" />
          <Heading tag={`Bloco ${pad2(result.node.index)}`} title="Bloco verificado" tone="primary" />
          <Txt variant="code" tone={color.muted} center>
            {blockHash(result.node.code)}
          </Txt>
        </ResultScreen>
      );
    }
    return <Acquired index={result.node.index} />;
  }

  if (result.kind === 'duplicate') {
    const last = result.node.index >= MISSION.totalNodes;
    return (
      <ResultScreen
        key="dup"
        footer={
          <>
            <Button
              label={last ? 'Ver carteira' : 'Ver pista'}
              icon={last ? 'lock-open-variant-outline' : 'arrow-right'}
              onPress={() =>
                last
                  ? router.replace('/complete')
                  : router.replace({ pathname: '/clue/[id]', params: { id: String(result.node.index) } })
              }
            />
            <Button label="Escanear outro" variant="secondary" icon="qrcode-scan" onPress={retry} />
          </>
        }
      >
        <Signal icon="check-decagram-outline" tone="cyan" />
        <Heading tag={`Bloco ${pad2(result.node.index)}`} title="Bloco já recuperado" tone="cyan" />
        <Txt variant="body" tone={color.muted} center>
          Esse BTC já está na sua carteira. Procure o próximo bloco.
        </Txt>
      </ResultScreen>
    );
  }

  if (result.kind === 'locked') {
    return (
      <ResultScreen
        key="locked"
        footer={
          <>
            <Button
              label="Ver pista atual"
              icon="arrow-right"
              onPress={() =>
                router.replace({ pathname: '/clue/[id]', params: { id: String(result.expected - 1) } })
              }
            />
            <Button label="Voltar à base" variant="secondary" onPress={home} />
          </>
        }
      >
        <Signal icon="shield-lock-outline" tone="cyan" enter="shake" />
        <Heading tag={`Bloco ${pad2(result.node.index)}`} title="Bloco protegido" tone="cyan" />
        <Txt variant="body" tone={color.muted} center>
          Ele só abre depois do bloco {pad2(result.expected)}. Siga a pista atual.
        </Txt>
      </ResultScreen>
    );
  }

  return (
    <ResultScreen
      key="invalid"
      footer={
        <>
          <Button label="Tentar de novo" icon="qrcode-scan" onPress={retry} />
          <Button label="Voltar à base" variant="secondary" onPress={home} />
        </>
      }
    >
      <Signal icon="alert-octagon-outline" tone="warning" enter="shake" />
      <Heading tag="Erro de leitura" title="Bloco não reconhecido" tone="warning" icon="close-octagon-outline" />
      <Txt variant="body" tone={color.muted} center>
        Esse código não faz parte da missão. Procure outro bloco.
      </Txt>
    </ResultScreen>
  );
}

function ResultScreen({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Screen centered footer={footer}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.stack} accessibilityLiveRegion="polite">
        {children}
      </Animated.View>
    </Screen>
  );
}

function Heading({
  tag,
  title,
  tone,
  icon = 'cube-outline',
}: {
  tag: string;
  title: string;
  tone: 'primary' | 'cyan' | 'warning';
  icon?: 'cube-outline' | 'close-octagon-outline';
}) {
  return (
    <View style={styles.heading}>
      <StatusTag label={tag} icon={icon} tone={tone} center />
      <Txt variant="display" center accessibilityRole="header">
        {title}
      </Txt>
    </View>
  );
}

function Verifying({ code }: { code: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: VERIFY_MS - 100, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <Screen centered>
      <View style={styles.stack} accessibilityLiveRegion="polite" accessibilityLabel="Verificando bloco">
        <Brackets style={styles.verifyFrame} tone={color.cyan}>
          <Icon name="cube-scan" size="xl" tone={color.cyan} />
        </Brackets>
        <Txt variant="display" center>
          Verificando
        </Txt>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, bar]} />
        </View>
        <Txt variant="code" tone={color.muted} center numberOfLines={1}>
          {blockHash(code)}
        </Txt>
      </View>
    </Screen>
  );
}

function Acquired({ index }: { index: number }) {
  const last = index >= MISSION.totalNodes;
  return (
    <Screen
      centered
      footer={
        last ? (
          <Button label="Abrir carteira" icon="lock-open-variant-outline" onPress={() => router.replace('/complete')} />
        ) : (
          <Button
            label="Decifrar pista"
            icon="key-variant"
            onPress={() => router.replace({ pathname: '/clue/[id]', params: { id: String(index) } })}
          />
        )
      }
    >
      <Animated.View entering={FadeIn.duration(200)} style={styles.stack} accessibilityLiveRegion="polite">
        <Signal icon="bitcoin" tone="primary" glowing />
        <View style={styles.heading}>
          <Txt variant="display" tone={color.primary} center accessibilityRole="header">
            +1 BTC
          </Txt>
          <Txt variant="body" tone={color.muted} center>
            {last ? 'Último bloco recuperado.' : 'Novo bloco na sua carteira.'}
          </Txt>
        </View>

        <View style={styles.wallet}>
          <Txt variant="label" tone={color.muted}>
            Carteira
          </Txt>
          <WalletCount to={index} />
          <NodeTrack done={index} highlight={index} />
        </View>
      </Animated.View>
    </Screen>
  );
}

// Atualização da carteira: mostra o saldo anterior e troca para o novo com um pop.
function WalletCount({ to }: { to: number }) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : to - 1);
  useEffect(() => {
    if (value === to) return;
    const t = setTimeout(() => setValue(to), 450);
    return () => clearTimeout(t);
  }, [value, to]);
  return (
    <Animated.View key={value} style={styles.count} entering={value === to && !reduced ? ZoomIn.springify().damping(12) : undefined}>
      <BtcAmount value={value} tone={value === to ? color.primary : color.muted} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.xl, alignItems: 'stretch' },
  heading: { gap: space.md, alignItems: 'center' },
  verifyFrame: { width: 128, height: 128, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: radius.full, backgroundColor: color.line, overflow: 'hidden' },
  fill: { flex: 1, backgroundColor: color.cyan, transformOrigin: 'left' },
  count: { alignSelf: 'flex-start' },
  wallet: {
    gap: space.lg,
    padding: space.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
});
