import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import type { TextStyle } from 'react-native';

// Três famílias, três papéis:
// - Rajdhani: display condensada e angular (títulos, números, botões), linguagem Cyberpunk
// - JetBrains Mono: códigos, status, rótulos de sistema
// - Atkinson Hyperlegible: leitura (charadas, instruções), criada para legibilidade máxima
export const fontAssets = {
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
};

export const font = {
  display: 'Rajdhani_700Bold',
  displaySemi: 'Rajdhani_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  read: 'AtkinsonHyperlegible_400Regular',
  readBold: 'AtkinsonHyperlegible_700Bold',
} as const;

// Escala tipográfica. Menor tamanho do app: 14 (rótulos mono).
// Rajdhani é estreita: tamanhos de display maiores que numa sans comum.
export const typography = {
  hero: { fontFamily: font.display, fontSize: 104, lineHeight: 100, letterSpacing: -1 },
  display: {
    fontFamily: font.display,
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { fontFamily: font.display, fontSize: 28, lineHeight: 32, letterSpacing: 0.5 },
  clue: { fontFamily: font.readBold, fontSize: 24, lineHeight: 34 },
  body: { fontFamily: font.read, fontSize: 18, lineHeight: 26 },
  bodyBold: { fontFamily: font.readBold, fontSize: 18, lineHeight: 26 },
  label: {
    fontFamily: font.mono,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  code: { fontFamily: font.monoBold, fontSize: 16, lineHeight: 22, letterSpacing: 1 },
  input: { fontFamily: font.monoBold, fontSize: 20, letterSpacing: 1 },
  button: {
    fontFamily: font.display,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof typography;
