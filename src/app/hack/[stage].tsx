import { useAudioPlayer } from 'expo-audio';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Brackets } from '../../components/Brackets';
import { Button } from '../../components/Button';
import { GlitchText } from '../../components/GlitchText';
import { Screen } from '../../components/Screen';
import { Signal } from '../../components/Signal';
import { StatusTag } from '../../components/StatusTag';
import { Txt } from '../../components/Txt';
import { useDecrypt } from '../../components/useDecrypt';
import { STORY, durationText, hackerMessage, storyMidpoint, type HackStage } from '../../game/config';
import { useMission } from '../../game/store';
import { color, space } from '../../theme/tokens';

// Invasão do hacker (roteiro da gestora). Três momentos:
// inicio: ao começar a missão · meio: depois da metade dos blocos, com a imagem carregando
// final: na meta, o hacker fala com a voz gravada do tio e libera a pista extra.

const STAGES: HackStage[] = ['inicio', 'meio', 'final'];

export default function Hack() {
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { story, total, btc, complete } = useMission();
  const valid = STAGES.includes(stage as HackStage);

  if (!story || !valid) return <Redirect href="/home" />;
  if (stage === 'final' && !complete) return <Redirect href="/home" />;
  return <Invasion key={stage} stage={stage as HackStage} total={total} btc={btc} />;
}

function Invasion({ stage, total, btc }: { stage: HackStage; total: number; btc: number }) {
  const text = hackerMessage(stage, total);
  const { output, done } = useDecrypt(text, { run: true, duration: stage === 'inicio' ? 2600 : 1800 });
  const remaining = total - btc;
  // A mensagem de abertura é longa: corpo menor para caber sem rolar.
  const variant = text.length > 120 ? 'bodyBold' : 'clue';

  const next = () => {
    if (stage === 'inicio') router.replace('/home');
    else if (stage === 'meio') router.replace({ pathname: '/clue/[id]', params: { id: String(storyMidpoint(total) ?? btc) } });
    else router.replace({ pathname: '/clue/[id]', params: { id: String(total) } });
  };

  return (
    <Screen
      centered
      scroll
      footer={
        <>
          {stage === 'final' ? <VoiceReplay /> : null}
          <Button
            label={stage === 'inicio' ? 'Começar a caça' : stage === 'meio' ? 'Seguir o jogo' : 'Pista extra'}
            icon={stage === 'final' ? 'key-variant' : 'arrow-right'}
            disabled={!done}
            onPress={next}
          />
        </>
      }
    >
      <Animated.View entering={FadeIn.duration(200)} style={styles.stack}>
        <Signal icon={stage === 'final' ? 'account-voice' : 'skull-outline'} tone="danger" enter="shake" glowing />
        <View style={styles.heading}>
          <StatusTag label="Invasão detectada" icon="alert-octagon-outline" tone="danger" center />
          <GlitchText center tone={color.danger}>
            Mensagem do hacker
          </GlitchText>
        </View>

        <Brackets style={styles.panel} tone={color.danger}>
          <Txt variant={variant} style={styles.ghost} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {text}
          </Txt>
          <Txt
            variant={variant}
            tone={done ? color.text : color.danger}
            style={styles.overlay}
            accessibilityLabel={done ? text : 'Mensagem chegando'}
            accessibilityLiveRegion="polite"
          >
            {output}
          </Txt>
        </Brackets>

        {stage === 'inicio' ? (
          <Txt variant="label" tone={color.muted} center>
            Contagem regressiva: {durationText(STORY.minutes)}
          </Txt>
        ) : null}
        {stage === 'meio' ? (
          <>
            <ImageLoading />
            <Txt variant="body" tone={color.muted} center>
              Segue o jogo: {remaining === 1 ? 'falta 1 pista' : `faltam ${remaining} pistas`}.
            </Txt>
          </>
        ) : null}
      </Animated.View>
    </Screen>
  );
}

// "...IMAGEM CARREGANDO...": a barra acompanha o tempo gasto da hora do hacker.
function ImageLoading() {
  const { startedAt } = useMission();
  const reduced = useReducedMotion();
  const fraction = Math.min(0.99, Math.max(0.05, (Date.now() - (startedAt ?? Date.now())) / (STORY.minutes * 60_000)));
  const progress = useSharedValue(reduced ? fraction : 0);
  const blink = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    progress.value = withTiming(fraction, { duration: 2200, easing: Easing.out(Easing.cubic) });
    blink.value = withRepeat(withSequence(withTiming(0.35, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
  }, [reduced, fraction, progress, blink]);

  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  const label = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <View style={styles.loading} accessible accessibilityLabel={`Imagem carregando, ${Math.round(fraction * 100)} por cento`}>
      <Animated.View style={label}>
        <Txt variant="label" tone={color.danger} center>
          ...Imagem carregando...
        </Txt>
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, bar]} />
      </View>
    </View>
  );
}

// A voz do tio toca sozinha na revelação; o botão repete.
function VoiceReplay() {
  const { voiceUri } = useMission();
  const player = useAudioPlayer(voiceUri);

  useEffect(() => {
    if (!voiceUri) return;
    const t = setTimeout(() => player.play(), 500);
    return () => clearTimeout(t);
  }, [voiceUri, player]);

  if (!voiceUri) return null;
  return (
    <Button
      label="Ouvir de novo"
      icon="replay"
      variant="secondary"
      onPress={async () => {
        await player.seekTo(0);
        player.play();
      }}
    />
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.xl, paddingVertical: space.lg },
  heading: { gap: space.md, alignItems: 'center' },
  panel: { padding: space.lg, overflow: 'hidden' },
  ghost: { opacity: 0 },
  overlay: { position: 'absolute', top: space.lg, left: space.lg, right: space.lg, bottom: space.lg },
  loading: { gap: space.sm },
  track: { height: 8, backgroundColor: color.line, overflow: 'hidden' },
  fill: { flex: 1, backgroundColor: color.danger, transformOrigin: 'left' },
});
