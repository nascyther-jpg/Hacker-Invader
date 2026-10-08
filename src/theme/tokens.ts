// BLACK NODE design tokens · estilo Cyberpunk 2077.
// Única fonte de cores, espaçamentos, cortes e sombras.
// Telas e componentes nunca usam hex direto: sempre importam daqui.

export const color = {
  bg: '#07080B',
  surface: '#111319',
  surfaceRaised: '#191C24',
  line: '#272B35',
  lineStrong: '#3B414E',

  // Amarelo neon: marca, ação principal e sucesso.
  primary: '#FCEE0A',
  primaryDim: 'rgba(252, 238, 10, 0.12)',
  primaryLine: 'rgba(252, 238, 10, 0.5)',
  onPrimary: '#0A0A0A',

  // Ciano: sistema, novidade, próximo alvo.
  cyan: '#00F0FF',
  cyanDim: 'rgba(0, 240, 255, 0.12)',

  // Vermelho: erro e alerta. Contraste 5,6:1 sobre o fundo.
  danger: '#FF3355',
  dangerDim: 'rgba(255, 51, 85, 0.14)',

  text: '#EDF4F5',
  muted: '#8590A0',

  scrim: 'rgba(7, 8, 11, 0.78)',
} as const;

export type Tone = 'primary' | 'cyan' | 'danger' | 'muted';

export const toneColor: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: color.primary, bg: color.primaryDim },
  cyan: { fg: color.cyan, bg: color.cyanDim },
  danger: { fg: color.danger, bg: color.dangerDim },
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

// Sem cantos arredondados: as formas usam cantos chanfrados (ver Chamfer).
export const cut = {
  sm: 6,
  md: 14,
  lg: 22,
} as const;

// Alvos de toque para 7 a 12 anos: nunca abaixo de 56.
export const touch = {
  min: 56,
  button: 64,
  icon: 56,
} as const;

// Glow é reservado a UM elemento por tela (o elemento de assinatura).
export const glow = {
  primary: 'rgba(252, 238, 10, 0.35)',
  cyan: 'rgba(0, 240, 255, 0.35)',
  danger: 'rgba(255, 51, 85, 0.4)',
} as const;

// Durações curtas e funcionais. Springs para feedback de toque.
export const motion = {
  fast: 160,
  base: 260,
  slow: 420,
  glitch: 380,
  press: { damping: 18, stiffness: 420, mass: 0.6 },
  pop: { damping: 11, stiffness: 180, mass: 0.8 },
} as const;
