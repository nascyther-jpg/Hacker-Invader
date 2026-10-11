// Tokens do Zap, o app de mensagens que vem antes do BLACK NODE.
// Imita o tema escuro de um mensageiro comum de propósito: o recreador precisa acreditar
// que é o celular dele. Nada daqui vaza para as telas do BLACK NODE.

export const zap = {
  bg: '#0B141A',
  bar: '#1F2C34',
  list: '#111B21',
  divider: '#222D34',

  accent: '#00A884',
  accentDim: '#0A332C',
  badge: '#25D366',
  onBadge: '#111B21',

  bubbleIn: '#1F2C34',
  bubbleOut: '#005C4B',
  system: '#182229',
  systemText: '#FFD279',

  text: '#E9EDEF',
  muted: '#8696A0',
  read: '#53BDEB',
  link: '#53BDEB',
  avatar: '#6B7C85',
  avatarBg: '#2A3942',

  metaMine: '#A6C9C1',
  groupName: '#E5A3F5',

  // Pequenas marcas do hacker dentro do Zap (câmera, link).
  rec: '#FF3355',
  neon: '#FCEE0A',
  camBg: '#1A2026',
  camShape: '#39434C',
  camDoor: '#2B333B',
  camEdge: '#454F59',
  camLine: '#FFFFFF',
  camArt: '#07080B',
} as const;

// Fonte do sistema, como um mensageiro de verdade.
export const zapType = {
  title: { fontSize: 20, fontWeight: '600' },
  name: { fontSize: 17, fontWeight: '500' },
  body: { fontSize: 16, lineHeight: 21 },
  preview: { fontSize: 14, lineHeight: 19 },
  small: { fontSize: 12, lineHeight: 15 },
  tiny: { fontSize: 11, lineHeight: 14 },
} as const;
