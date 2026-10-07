// BLACK NODE design tokens. Única fonte de cores, espaçamentos, raios e sombras.
// Telas e componentes nunca usam hex direto: sempre importam daqui.

export const color = {
  bg: '#070A0D',
  surface: '#0D1217',
  surfaceRaised: '#131A21',
  line: '#1C2630',
  lineStrong: '#2B3843',

  primary: '#39FF88',
  primaryDim: 'rgba(57, 255, 136, 0.14)',
  primaryLine: 'rgba(57, 255, 136, 0.45)',
  onPrimary: '#04140A',

  cyan: '#00C8FF',
  cyanDim: 'rgba(0, 200, 255, 0.14)',

  warning: '#FFD166',
  warningDim: 'rgba(255, 209, 102, 0.14)',

  text: '#E8FFF1',
  muted: '#71808C',

  scrim: 'rgba(7, 10, 13, 0.72)',
} as const;

export type Tone = 'primary' | 'cyan' | 'warning' | 'muted';

export const toneColor: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: color.primary, bg: color.primaryDim },
  cyan: { fg: color.cyan, bg: color.cyanDim },
  warning: { fg: color.warning, bg: color.warningDim },
  muted: { fg: color.muted, bg: color.surfaceRaised },
};

// Grade 4/8. Padding lateral das telas travado em `screen`.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screen: 20,
} as const;

// Uma escala de raio por papel: tags/sm, botões e painéis/md, nós/círculos/full.
export const radius = {
  sm: 4,
  md: 10,
  full: 999,
} as const;

// Alvos de toque para 7 a 12 anos: nunca abaixo de 56.
export const touch = {
  min: 56,
  button: 64,
  icon: 56,
} as const;

// boxShadow funciona em iOS, Android e web na New Architecture.
// Glow é reservado a UM elemento por tela (o elemento de assinatura).
export const glow = {
  primary: '0px 0px 24px 0px rgba(57, 255, 136, 0.35)',
  primaryStrong: '0px 0px 48px 4px rgba(57, 255, 136, 0.45)',
  cyan: '0px 0px 24px 0px rgba(0, 200, 255, 0.35)',
  warning: '0px 0px 24px 0px rgba(255, 209, 102, 0.3)',
} as const;

export const elevation = {
  raised: '0px 8px 24px 0px rgba(0, 0, 0, 0.5)',
} as const;

// Durações curtas e funcionais. Springs para feedback de toque.
export const motion = {
  fast: 160,
  base: 260,
  slow: 420,
  press: { damping: 18, stiffness: 420, mass: 0.6 },
  pop: { damping: 11, stiffness: 180, mass: 0.8 },
} as const;
