import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { Brackets } from '../components/Brackets';
import { GlitchText } from '../components/GlitchText';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { useMission } from '../game/store';
import { color, space } from '../theme/tokens';

// Boot: três linhas de sistema e entra na base. Toque pula.
const LINES = ['Conectando ao nó secreto', 'Canal protegido', 'Agente identificado'];
const STEP = 520;

export default function Boot() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const { started } = useMission();
  // Sem missão em andamento: o recreador configura antes de entregar o celular.
  const enter = () => router.replace(started ? '/home' : '/setup');

  useEffect(() => {
    if (step > LINES.length) {
      enter();
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 400 : reduced ? 200 : STEP);
    return () => clearTimeout(t);
  }, [step, reduced]);

  return (
    <Pressable
      style={styles.flex}
      onPress={enter}
      accessibilityRole="button"
      accessibilityLabel="Entrar na missão"
    >
      <Screen centered>
        <View style={styles.center}>
          <Brackets style={styles.mark} tone={color.primary} size={18}>
            <Icon name="cube-outline" size="xl" tone={color.primary} />
          </Brackets>
          <GlitchText center tone={color.primary} trigger={step >= LINES.length}>
            BLACK NODE
          </GlitchText>
          <Txt variant="label" tone={color.muted} center>
            Missão: carteira secreta
          </Txt>
        </View>

        <View style={styles.log} accessibilityLiveRegion="polite">
          {LINES.slice(0, step).map((line, i) => (
            <Animated.View key={line} entering={FadeIn.duration(180)} style={styles.line}>
              <Txt variant="label" tone={i === LINES.length - 1 ? color.primary : color.muted}>
                {i === LINES.length - 1 ? '[ok]' : '[..]'}
              </Txt>
              <Txt variant="label" tone={i === LINES.length - 1 ? color.text : color.muted}>
                {line}
              </Txt>
            </Animated.View>
          ))}
        </View>
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', gap: space.md },
  mark: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  log: { minHeight: 90, gap: space.sm, alignSelf: 'center', marginTop: space.xxl },
  line: { flexDirection: 'row', gap: space.md },
});
