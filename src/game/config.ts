// Conteúdo da missão. Edite aqui os códigos dos QR e as charadas.
// Cada QR impresso deve conter exatamente o texto do código.

export type Mode = 'solo' | 'versus';
export type Team = 'A' | 'B';
/** Conjunto de QR em uso: o da missão solo ou o de um dos times. */
export type CodeSet = 'solo' | Team;

export const MIN_NODES = 1;
export const MAX_NODES = 10;
export const DEFAULT_NODES = 4;

export const TEAMS: Record<Team, { name: string; short: string }> = {
  A: { name: 'Time Amarelo', short: 'Amarelo' },
  B: { name: 'Time Ciano', short: 'Ciano' },
};

/**
 * Lugares da rota, em ordem. O recreador esconde o bloco N no lugar N.
 * `hint` é a charada que leva até esse lugar: a do lugar 1 abre a missão,
 * a do lugar N+1 é liberada ao recuperar o bloco N.
 * No modo Hacker vs Hacker os dois times fazem a mesma rota, cada um com seus QR.
 */
export const PLACES: { name: string; hint: string }[] = [
  {
    name: 'Quadro de atividades',
    hint: 'O primeiro bloco está escondido onde todo mundo se encontra antes de cada aventura. Procure perto do quadro de atividades.',
  },
  {
    name: 'Escada da piscina funda',
    hint: 'Agora siga até onde a água é mais funda e ninguém pode correr. O próximo bloco espera perto da escada.',
  },
  {
    name: 'Toalhas',
    hint: 'Procure o lugar onde se guarda o que faz a gente ficar seco depois do mergulho.',
  },
  {
    name: 'Entrada do restaurante',
    hint: 'O próximo bloco está onde a comida chega quentinha. Olhe com atenção perto da entrada.',
  },
  {
    name: 'Parquinho',
    hint: 'Vá até onde se sobe, se escorrega e se balança. O bloco está escondido perto do escorregador.',
  },
  {
    name: 'Recepção',
    hint: 'Todo hóspede passa por aqui quando chega e quando vai embora. Procure perto do balcão.',
  },
  {
    name: 'Quadra de esportes',
    hint: 'Aqui a bola rola e o time grita gol. O bloco espera atrás da trave.',
  },
  {
    name: 'Sala de jogos',
    hint: 'Procure onde tem mesa de pingue-pongue e muita gente jogando. O bloco está perto da porta.',
  },
  {
    name: 'Redário',
    hint: 'Vá até o lugar onde as redes balançam e todo mundo descansa na sombra.',
  },
  {
    name: 'Espaço kids',
    hint: 'O último esconderijo é a casa da recreação. Procure perto da entrada do espaço kids.',
  },
];

/** Códigos dos QR por conjunto, do bloco 1 ao 10. */
const CODES: Record<CodeSet, string[]> = {
  solo: [
    'BLACKNODE-01-K7Q4',
    'BLACKNODE-02-M2X9',
    'BLACKNODE-03-R8F1',
    'BLACKNODE-04-T5W3',
    'BLACKNODE-05-YUEA',
    'BLACKNODE-06-UC33',
    'BLACKNODE-07-FWV9',
    'BLACKNODE-08-LLC8',
    'BLACKNODE-09-SQ4V',
    'BLACKNODE-10-ZZU2',
  ],
  A: [
    'BLACKNODE-A01-Q3ZL',
    'BLACKNODE-A02-LB3R',
    'BLACKNODE-A03-KHXK',
    'BLACKNODE-A04-NTFZ',
    'BLACKNODE-A05-YZZ3',
    'BLACKNODE-A06-X3TW',
    'BLACKNODE-A07-FSC9',
    'BLACKNODE-A08-VGPF',
    'BLACKNODE-A09-BPFF',
    'BLACKNODE-A10-63PG',
  ],
  B: [
    'BLACKNODE-B01-DHST',
    'BLACKNODE-B02-65GL',
    'BLACKNODE-B03-K48D',
    'BLACKNODE-B04-SAZZ',
    'BLACKNODE-B05-XDM7',
    'BLACKNODE-B06-JCF4',
    'BLACKNODE-B07-B5EM',
    'BLACKNODE-B08-88UF',
    'BLACKNODE-B09-PNJV',
    'BLACKNODE-B10-GQF9',
  ],
};

export function codeFor(set: CodeSet, index: number): string | undefined {
  return CODES[set][index - 1];
}

/** Localiza um código em qualquer conjunto (inclusive o de outro time). */
export function findCode(raw: string): { set: CodeSet; index: number; code: string } | undefined {
  const code = raw.trim().toUpperCase();
  for (const set of Object.keys(CODES) as CodeSet[]) {
    const i = CODES[set].indexOf(code);
    if (i >= 0) return { set, index: i + 1, code };
  }
  return undefined;
}

export function finalMessage(mode: Mode): string {
  return mode === 'versus'
    ? 'Seu time recuperou a carteira inteira. Mostre esta tela para o recreador: ganha o time mais rápido.'
    : 'Você recuperou a carteira secreta inteira. Mostre esta tela para o recreador e receba sua recompensa.';
}

/**
 * Pistas numeradas de 0 a total-1. A pista 0 é a de abertura; a pista N vem do bloco N.
 * O último bloco não tem pista: leva direto à tela de missão completa.
 */
export function clueText(id: number, total: number): string | undefined {
  if (id < 0 || id >= total) return undefined;
  return PLACES[id]?.hint;
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

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Duração em mm:ss (ou h:mm:ss acima de uma hora). */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(ss)}` : `${pad2(m)}:${pad2(ss)}`;
}
