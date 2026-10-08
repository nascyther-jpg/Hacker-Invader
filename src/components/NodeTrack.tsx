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
import { Chamfer } from './Chamfer';
import { Icon } from './Icon';
import { Txt } from './Txt';

// Progresso 0/4 a 4/4: quatro nós octogonais ligados. Recuperado = amarelo + check;
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

  const look = {
    done: { fill: color.primary, stroke: color.primary },
    current: { fill: color.cyanDim, stroke: color.cyan },
    locked: { fill: color.surface, stroke: color.lineStrong },
  }[state];
  return (
    <Animated.View style={[{ width: d, height: d }, animated]}>
      <Chamfer
        cut={d * 0.28}
        corners={['tl', 'tr', 'br', 'bl']}
        fill={look.fill}
        stroke={look.stroke}
        strokeWidth={2}
        style={styles.node}
      >
        {state === 'done' ? (
          <Icon name="check-bold" tone={color.onPrimary} size="sm" />
        ) : (
          <Txt variant="code" tone={state === 'current' ? color.cyan : color.muted}>
            {n}
          </Txt>
        )}
      </Chamfer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  link: { flex: 1, height: 2, backgroundColor: color.line, marginHorizontal: space.xs },
  linkOn: { backgroundColor: color.primaryLine },
  node: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
