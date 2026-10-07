import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { glow, motion, toneColor, type Tone } from '../theme/tokens';
import { Icon, type IconName } from './Icon';

// Ícone de resultado dentro de um anel. `enter` define a entrada:
// pop (sucesso), shake (erro discreto) ou none.

type Props = { icon: IconName; tone: Tone; enter?: 'pop' | 'shake' | 'none'; glowing?: boolean };

export function Signal({ icon, tone, enter = 'pop', glowing }: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(enter === 'pop' && !reduced ? 0.5 : 1);
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    if (enter === 'pop') scale.value = withSpring(1, motion.pop);
    if (enter === 'shake') {
      const t = { duration: 60 };
      x.value = withSequence(withTiming(-10, t), withTiming(10, t), withTiming(-6, t), withTiming(6, t), withTiming(0, t));
    }
  }, [enter, reduced, scale, x]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: x.value }] }));
  const c = toneColor[tone];

  return (
    <Animated.View
      style={[
        styles.ring,
        { borderColor: c.fg, backgroundColor: c.bg },
        glowing && { boxShadow: tone === 'warning' ? glow.warning : tone === 'cyan' ? glow.cyan : glow.primary },
        animated,
      ]}
    >
      <View style={styles.inner}>
        <Icon name={icon} size="xl" tone={c.fg} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  inner: { alignItems: 'center', justifyContent: 'center' },
});
