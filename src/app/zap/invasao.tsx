import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { GlitchText } from '../../components/GlitchText';
import { Icon } from '../../components/Icon';
import { Screen } from '../../components/Screen';
import { Txt } from '../../components/Txt';
import { color, space } from '../../theme/tokens';
import { useZap } from '../../zap/store';

// Ponte entre o Zap e o BLACK NODE: o link "instala" o programa do hacker
// e o celular troca de cara. No fim, abre o boot do BLACK NODE.

const LINES = ['Abrindo blacknode://acesso', 'Quebrando a proteção do Zap', 'Baixando BLACK NODE', 'Instalando no celular do recreador'];
const STEP = 650;

export default function Invasao() {
  const reduced = useReducedMotion();
  const { unlock } = useZap();
  const [step, setStep] = useState(0);
  const progress = useSharedValue(0);
  const done = step > LINES.length;

  useEffect(() => {
    progress.value = withTiming(1, { duration: reduced ? 0 : STEP * (LINES.length + 1), easing: Easing.inOut(Easing.quad) });
  }, [reduced, progress]);

  useEffect(() => {
    if (step > LINES.length + 1) {
      unlock();
      router.replace('/');
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 300 : reduced ? 250 : STEP);
    return () => clearTimeout(t);
  }, [step, reduced, unlock]);

  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <Screen centered>
      <View style={styles.stack}>
        <Icon name={done ? 'lock-open-variant-outline' : 'skull-outline'} size="xl" tone={done ? color.primary : color.danger} />
        <GlitchText center tone={done ? color.primary : color.danger} trigger={done}>
          {done ? 'Acesso liberado' : 'Sistema invadido'}
        </GlitchText>

        <View style={styles.track} accessible accessibilityLabel="Instalando BLACK NODE">
          <Animated.View style={[styles.fill, bar, done && { backgroundColor: color.primary }]} />
        </View>

        <View style={styles.log} accessibilityLiveRegion="polite">
          {LINES.slice(0, step).map((line, i) => (
            <Animated.View key={line} entering={FadeIn.duration(160)} style={styles.line}>
              <Txt variant="label" tone={i < step - 1 || done ? color.primary : color.danger}>
                {i < step - 1 || done ? '[ok]' : '[..]'}
              </Txt>
              <Txt variant="label" tone={color.text} style={styles.flex}>
                {line}
              </Txt>
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flexShrink: 1 },
  stack: { alignItems: 'center', gap: space.xl },
  track: { alignSelf: 'stretch', height: 8, backgroundColor: color.line, overflow: 'hidden' },
  fill: { flex: 1, backgroundColor: color.danger, transformOrigin: 'left' },
  log: { alignSelf: 'stretch', minHeight: 110, gap: space.sm },
  line: { flexDirection: 'row', gap: space.md },
});
