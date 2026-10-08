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

/** Período da caça: muda os lugares permitidos. */
export type Period = 'dia' | 'noite';

export const PERIODS: Record<Period, { name: string; description: string }> = {
  dia: { name: 'Dia', description: 'Resort inteiro, com piscinas e áreas externas.' },
  noite: { name: 'Noite', description: 'Só áreas iluminadas, cobertas ou com equipe do hotel.' },
};

export type Place = {
  name: string;
  /** Onde fica o bloco, por período. Ausente = lugar proibido nesse período. */
  dia?: string;
  noite?: string;
  /** Charada que leva até o lugar. `hintNoite` substitui `hint` à noite. */
  hint: string;
  hintNoite?: string;
};

/**
 * Locais do Mavsa Resort na ordem da rota (caminhada contínua).
 * A classificação Dia/Noite foi proposta pelo app e está em auditoria pelo recreador:
 * veja docs/locais-mavsa.md antes de mudar.
 */
export const PLACES: Place[] = [
  {
    name: 'Check-in',
    dia: 'No balcão do check-in, à vista da recepção.',
    noite: 'No balcão do check-in, à vista da recepção.',
    hint: 'Toda família que chega ao resort passa primeiro por aqui para pegar a chave. Procure perto do balcão.',
  },
  {
    name: 'Lobby do hotel',
    dia: 'No lobby, perto dos sofás.',
    noite: 'No lobby, perto dos sofás.',
    hint: 'Agora vá até a grande sala de entrada do hotel, onde os hóspedes esperam sentados nos sofás.',
  },
  {
    name: 'Escadaria do Lobby',
    dia: 'No pé da escadaria, nunca nos degraus.',
    hint: 'O próximo bloco está onde se sobe e se desce a partir do lobby. Fica lá embaixo, nada de procurar nos degraus.',
  },
  {
    name: 'Apartamentos Grand Étoile e Première',
    dia: 'Na área de fora dos prédios, longe das portas dos quartos.',
    hint: 'Procure perto dos prédios onde as famílias dormem: uma estrela grande e o primeiro de todos. Fale baixinho!',
  },
  {
    name: "Restaurante Lac d'Or",
    dia: 'Do lado de fora da entrada, sem entrar no salão.',
    noite: 'Do lado de fora da entrada, sem entrar no salão.',
    hint: 'Siga até o lago de ouro onde a comida chega quentinha. O bloco espera do lado de fora da porta.',
  },
  {
    name: 'Mavsa Hall',
    dia: 'Na fachada, do lado de fora. De dia não se entra.',
    noite: 'Na entrada, fora do horário do espetáculo. Nunca dentro durante o show.',
    hint: 'Vá até o palco das grandes atrações. As portas estão fechadas: o bloco está do lado de fora.',
    hintNoite: 'Vá até o palco das grandes atrações da noite. O bloco espera na entrada, antes das cortinas abrirem.',
  },
  {
    name: 'Gira-gira de Cupcake (CDS)',
    dia: 'Perto do gira-gira, com ele parado.',
    noite: 'Perto do gira-gira, com ele parado.',
    hint: 'Vá até a Cidade dos Sonhos e procure o docinho gigante que gira sem parar.',
  },
  {
    name: 'Árvore mágica (CDS)',
    dia: 'Junto da árvore mágica.',
    noite: 'Junto da árvore mágica.',
    hint: 'Na Cidade dos Sonhos existe uma árvore que nenhum jardineiro plantou. Dizem que ela é mágica.',
  },
  {
    name: 'Brinquedoteca do navio pirata (CDS)',
    dia: 'Perto do navio pirata, fora do alto do brinquedo.',
    noite: 'Perto do navio pirata, fora do alto do brinquedo.',
    hint: 'Na Cidade dos Sonhos, piratas guardam tesouros no navio. Procure perto do navio, sem subir nele.',
  },
  {
    name: 'Arcade (CDS)',
    dia: 'No balcão do check-in infantil.',
    noite: 'No balcão do check-in infantil.',
    hint: 'Agora siga as luzes piscando e o barulho dos jogos. O bloco está no balcão onde as crianças fazem o check-in.',
  },
  {
    name: 'Bilhar e ping-pong (CDS)',
    dia: 'Embaixo da mesa de ping-pong ou num canto da sala, longe dos tacos.',
    noite: 'Embaixo da mesa de ping-pong ou num canto da sala, longe dos tacos.',
    hint: 'Na Cidade dos Sonhos tem uma sala onde as bolinhas batem na mesa: uma pula, as outras rolam até a caçapa.',
  },
  {
    name: 'Jacaré de Pedra',
    dia: 'Dentro ou do lado do jacaré, sempre à vista do recreador.',
    hint: 'Desça pela frente da Cidade dos Sonhos. Um bicho gigante de pedra está de boca aberta esperando vocês.',
  },
  {
    name: 'Pegasus e a carruagem de abóbora',
    dia: 'Na carruagem, onde fazemos piquenique.',
    hint: 'Na frente do jacaré de pedra, um cavalo com asas puxa uma carruagem feita de abóbora.',
  },
  {
    name: "Piscina espelho d'água",
    dia: 'Fora do piso molhado, longe da borda. Só com a piscina aberta e guarda-vidas.',
    hint: 'Procure a piscina que parece um espelho. Atenção, hacker: perto da água ninguém corre!',
  },
  {
    name: 'Piscina aquecida',
    dia: 'Fora do piso molhado, longe da borda. Só com a piscina aberta e guarda-vidas.',
    hint: 'Agora vá até a piscina de água quentinha. Ande devagar: o bloco está longe da borda.',
  },
  {
    name: 'Toboágua',
    dia: 'Fora da área do brinquedo, nunca na escada. Só com o toboágua funcionando e guarda-vidas.',
    hint: 'O bloco está perto de onde a gente desce escorregando até cair na água. Ande, não corra!',
  },
];

/** Lugares permitidos no período, na ordem da rota. */
export function placesFor(period: Period): Place[] {
  return PLACES.filter((p) => p[period] !== undefined);
}

/** Máximo de pistas no período: o menor entre MAX_NODES e os lugares permitidos. */
export function maxNodesFor(period: Period): number {
  return Math.min(MAX_NODES, placesFor(period).length);
}

export type Stop = { name: string; where: string; hint: string };

/**
 * Rota da missão: `total` lugares permitidos no período, espalhados pela rota inteira
 * e mantendo a ordem. O bloco N fica na parada N.
 */
export function routeFor(period: Period, total: number): Stop[] {
  const all = placesFor(period);
  const n = Math.max(0, Math.min(total, all.length));
  const picked = Array.from({ length: n }, (_, i) => all[n === 1 ? 0 : Math.round((i * (all.length - 1)) / (n - 1))]);
  return picked.map((p) => ({
    name: p.name,
    where: p[period] as string,
    hint: (period === 'noite' && p.hintNoite) || p.hint,
  }));
}

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
 * Pistas numeradas de 0 a total-1, vindas da rota. A pista 0 é a de abertura; a pista N vem do bloco N.
 * O último bloco não tem pista: leva direto à tela de missão completa.
 */
export function clueText(id: number, route: Stop[]): string | undefined {
  return route[id]?.hint;
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
