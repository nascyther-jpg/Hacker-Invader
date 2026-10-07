import {
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
} from '@expo-google-fonts/chakra-petch';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import type { TextStyle } from 'react-native';

// Três famílias, três papéis:
// - Chakra Petch: display tecnológica (títulos, números, botões)
// - JetBrains Mono: códigos, status, rótulos de sistema
// - Atkinson Hyperlegible: leitura (charadas, instruções), criada para legibilidade máxima
export const fontAssets = {
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
};

export const font = {
  display: 'ChakraPetch_700Bold',
  displaySemi: 'ChakraPetch_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  read: 'AtkinsonHyperlegible_400Regular',
  readBold: 'AtkinsonHyperlegible_700Bold',
} as const;

// Escala tipográfica. Menor tamanho do app: 14 (rótulos mono).
export const typography = {
  hero: { fontFamily: font.display, fontSize: 88, lineHeight: 92, letterSpacing: -2 },
  display: { fontFamily: font.display, fontSize: 36, lineHeight: 40, letterSpacing: 0.5 },
  title: { fontFamily: font.displaySemi, fontSize: 24, lineHeight: 30, letterSpacing: 0.3 },
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
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof typography;
