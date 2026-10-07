import { Fragment, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MISSION } from '../game/config';
import { color, motion, space } from '../theme/tokens';
import { Icon } from './Icon';
import { Txt } from './Txt';

// Progresso 0/4 a 4/4: quatro nós ligados. Recuperado = preenchido + check;
// atual = contorno ciano + número; bloqueado = contorno apagado + número.

type Props = {
  done: number;
  /** Nó que acabou de ser recuperado: anima ao montar. */
  highlight?: number;
  size?: 'md' | 'lg';
};

export function NodeTrack({ done, highlight, size = 'md' }: Props) {
  const d = size === 'lg' ? 52 : 44;
  const nodes = Array.from({ length: MISSION.totalNodes }, (_, i) => i + 1);
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${done} de ${MISSION.totalNodes} blocos recuperados`}
      accessibilityValue={{ min: 0, max: MISSION.totalNodes, now: done }}
    >
      {nodes.map((n) => (
        <Fragment key={n}>
          {n > 1 ? <View style={[styles.link, n <= done && styles.linkOn]} /> : null}
          <Node n={n} d={d} state={n <= done ? 'done' : n === done + 1 ? 'current' : 'locked'} pop={n === highlight} />
        </Fragment>
      ))}
    </View>
  );
}

function Node({ n, d, state, pop }: { n: number; d: number; state: 'done' | 'current' | 'locked'; pop: boolean }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(pop && !reduced ? 0.4 : 1);
  const fill = useSharedValue(pop ? 0 : 1);

  useEffect(() => {
    if (!pop) return;
    fill.value = withDelay(motion.base, withTiming(1, { duration: motion.base }));
    if (!reduced) {
      scale.value = withDelay(motion.base, withSequence(withSpring(1.2, motion.pop), withSpring(1, motion.press)));
    }
  }, [pop, reduced, fill, scale]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.35 + fill.value * 0.65,
  }));

  const base = { width: d, height: d, borderRadius: d / 2 };
  return (
    <Animated.View
      style={[
        styles.node,
        base,
        state === 'done' && styles.done,
        state === 'current' && styles.current,
        state === 'locked' && styles.locked,
        animated,
      ]}
    >
      {state === 'done' ? (
        <Icon name="check-bold" tone={color.onPrimary} size="sm" />
      ) : (
        <Txt variant="code" tone={state === 'current' ? color.cyan : color.muted}>
          {n}
        </Txt>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  link: { flex: 1, height: 2, backgroundColor: color.line, marginHorizontal: space.sm },
  linkOn: { backgroundColor: color.primaryLine },
  node: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  done: { backgroundColor: color.primary, borderColor: color.primary },
  current: { borderColor: color.cyan, backgroundColor: color.cyanDim },
  locked: { borderColor: color.lineStrong, backgroundColor: color.surface },
});
