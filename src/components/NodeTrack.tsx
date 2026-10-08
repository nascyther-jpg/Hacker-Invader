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
import { color, motion, space } from '../theme/tokens';
import { Chamfer } from './Chamfer';
import { Icon } from './Icon';
import { Txt } from './Txt';

// Progresso 0/N a N/N (N de 1 a 10): nós octogonais ligados. Recuperado = amarelo + check;
// atual = contorno ciano + número; bloqueado = contorno apagado + número.

type Props = {
  done: number;
  total: number;
  /** Nó que acabou de ser recuperado: anima ao montar. */
  highlight?: number;
  size?: 'md' | 'lg';
};

export function NodeTrack({ done, total, highlight, size = 'md' }: Props) {
  const d = size === 'lg' ? 52 : 44;
  // Muitas pistas: os nós encolhem para caber na largura e a ligação vira um traço curto.
  const dense = total > 6;
  const nodes = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <View
      style={[styles.row, total === 1 && styles.single]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${done} de ${total} blocos recuperados`}
      accessibilityValue={{ min: 0, max: total, now: done }}
    >
      {nodes.map((n) => (
        <Fragment key={n}>
          {n > 1 ? <View style={[styles.link, dense && styles.linkDense, n <= done && styles.linkOn]} /> : null}
          <Node
            n={n}
            d={d}
            dense={dense}
            state={n <= done ? 'done' : n === done + 1 ? 'current' : 'locked'}
            pop={n === highlight}
          />
        </Fragment>
      ))}
    </View>
  );
}

function Node({
  n,
  d,
  dense,
  state,
  pop,
}: {
  n: number;
  d: number;
  dense: boolean;
  state: 'done' | 'current' | 'locked';
  pop: boolean;
}) {
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
    <Animated.View style={[dense ? [styles.dense, { maxWidth: d }] : { width: d, height: d }, animated]}>
      <Chamfer
        cut={dense ? 8 : d * 0.28}
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
  single: { justifyContent: 'center' },
  link: { flex: 1, height: 2, backgroundColor: color.line, marginHorizontal: space.xs },
  linkDense: { flex: 0, width: space.xs, marginHorizontal: 1 },
  linkOn: { backgroundColor: color.primaryLine },
  dense: { flex: 1, aspectRatio: 1 },
  node: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
