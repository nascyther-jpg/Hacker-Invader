// Conteúdo da missão. Edite aqui os códigos dos QR e as charadas.
// Cada QR impresso deve conter exatamente o texto de `code`.

export type NodeDef = {
  /** Posição na sequência, de 1 a 4. */
  index: number;
  /** Texto gravado no QR Code. */
  code: string;
  /** Charada liberada ao recuperar este bloco. Leva ao próximo QR. */
  clue: string;
};

export const MISSION = {
  totalNodes: 4,
  /** Primeira pista, visível antes do primeiro scan. Leva ao bloco 1. */
  startClue:
    'O primeiro bloco está escondido onde todo mundo se encontra antes de cada aventura. Procure perto do quadro de atividades.',
  /** Mensagem exibida ao concluir os 4 blocos. */
  finalMessage:
    'Você recuperou a carteira secreta inteira. Mostre esta tela para o recreador e receba sua recompensa.',
} as const;

export const NODES: NodeDef[] = [
  {
    index: 1,
    code: 'BLACKNODE-01-K7Q4',
    clue: 'Agora siga até onde a água é mais funda e ninguém pode correr. O próximo bloco espera perto da escada.',
  },
  {
    index: 2,
    code: 'BLACKNODE-02-M2X9',
    clue: 'Procure o lugar onde se guarda o que faz a gente ficar seco depois do mergulho.',
  },
  {
    index: 3,
    code: 'BLACKNODE-03-R8F1',
    clue: 'O último bloco está onde a comida chega quentinha. Olhe com atenção perto da entrada.',
  },
  {
    index: 4,
    code: 'BLACKNODE-04-T5W3',
    clue: MISSION.finalMessage,
  },
];

export function findNodeByCode(raw: string): NodeDef | undefined {
  const code = raw.trim().toUpperCase();
  return NODES.find((n) => n.code === code);
}

export function nodeByIndex(index: number): NodeDef | undefined {
  return NODES.find((n) => n.index === index);
}

/** "Hash" fictício e estável do bloco, só para exibição. */
export function blockHash(code: string): string {
  let h = 2166136261;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `0x${(h >>> 0).toString(16).padStart(8, '0').toUpperCase()}`;
}

/**
 * Pistas numeradas de 0 a 3. A pista 0 é a de abertura; a pista N vem do bloco N.
 * O bloco 4 não tem pista: leva direto à tela de missão completa.
 */
export function clueText(id: number): string | undefined {
  if (id === 0) return MISSION.startClue;
  if (id >= MISSION.totalNodes) return undefined;
  return nodeByIndex(id)?.clue;
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}
