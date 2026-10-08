import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { color, motion } from '../theme/tokens';
import type { TypeVariant } from '../theme/type';
import { Txt } from './Txt';

// Glitch curto na entrada (uma vez): duas cópias deslocadas em vermelho e ciano
// tremem por ~0,4 s e somem. Marca um momento importante, não decora.

type Props = {
  children: string;
  variant?: TypeVariant;
  tone?: string;
  center?: boolean;
  /** Muda o valor para disparar o glitch de novo. */
  trigger?: unknown;
};

export function GlitchText({ children, variant = 'display', tone = color.text, center, trigger }: Props) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState<number | null>(reduced ? null : 0);

  useEffect(() => {
    if (reduced) return;
    const start = Date.now();
    setOffset(3);
    const id = setInterval(() => {
      if (Date.now() - start > motion.glitch) {
        clearInterval(id);
        setOffset(null);
        return;
      }
      setOffset(Math.round((Math.random() - 0.5) * 10));
    }, 50);
    return () => clearInterval(id);
  }, [reduced, trigger]);

  return (
    <View accessible accessibilityRole="header" accessibilityLabel={children}>
      {offset !== null ? (
        <>
          <Txt
            variant={variant}
            tone={color.danger}
            center={center}
            style={[styles.copy, { transform: [{ translateX: offset }] }]}
            importantForAccessibility="no"
          >
            {children}
          </Txt>
          <Txt
            variant={variant}
            tone={color.cyan}
            center={center}
            style={[styles.copy, { transform: [{ translateX: -offset }, { translateY: offset > 0 ? 1 : -1 }] }]}
            importantForAccessibility="no"
          >
            {children}
          </Txt>
        </>
      ) : null}
      <Txt variant={variant} tone={tone} center={center}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.85 },
});
