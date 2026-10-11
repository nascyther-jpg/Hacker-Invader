// Roteiro da conversa do hacker no Zap. Edite as falas aqui.
// Cada etapa: o que o hacker manda (em sequência, com "digitando...") e as respostas
// que o recreador pode tocar. A última etapa termina com o link que abre o BLACK NODE.

import { APELIDO_HACKER, RECREADOR_NOME, STORY, durationText } from '../game/config';
import type { VideoId } from './videos';

/** Número que aparece no lugar do nome: claramente falso. */
export const HACKER_NUMBER = '+00 404 404 404';
export const HACKER_PUSHNAME = 'BLACK NODE';

export type Part =
  | { kind: 'text'; text: string }
  | { kind: 'image'; caption?: string }
  | { kind: 'file'; name: string; size: string }
  | { kind: 'audio'; seconds: number }
  | { kind: 'video'; video: VideoId; seconds: number }
  /** acesso = abre o BLACK NODE; carteira = abre a missão completa (final do Snape). */
  | { kind: 'link'; to: 'acesso' | 'carteira' };

export type StepId = 'oi' | 'quem' | 'prova' | 'desafio' | 'ameaca' | 'convite' | 'snapeErrou' | 'snapeAcertou';

export type Reply = { label: string; next: StepId };

export type Step = { hacker: Part[]; replies: Reply[] };

const t = (text: string): Part => ({ kind: 'text', text });

// Respostas da charada do Snape: as crianças falam, o recreador toca.
const SNAPE_REPLIES: Reply[] = [
  { label: 'Lorde das Trevas', next: 'snapeErrou' },
  { label: APELIDO_HACKER, next: 'snapeAcertou' },
  { label: 'Menino que Sobreviveu', next: 'snapeErrou' },
];


export const SCRIPT: Record<StepId, Step> = {
  // Já chega como não lida quando o app abre.
  oi: {
    hacker: [t('Oi, tio da recreação 👀'), t('Tá aí?')],
    replies: [
      { label: 'Quem é?', next: 'quem' },
      { label: 'Tô sim. Quem fala?', next: 'quem' },
    ],
  },
  quem: {
    hacker: [
      t('Pode me chamar de BLACK NODE.'),
      t('Acabei de invadir o servidor do Mavsa Resort 💻'),
      t('Câmeras, luzes, telão, som da piscina... tudo meu agora 😈'),
    ],
    replies: [
      { label: 'Isso é brincadeira, né?', next: 'prova' },
      { label: 'O que você quer?', next: 'prova' },
    ],
  },
  prova: {
    hacker: [
      t('Brincadeira? Olha a câmera do lobby agora:'),
      { kind: 'image', caption: 'Tô vendo tudo 👁️' },
      t('E olha o que eu peguei do servidor:'),
      { kind: 'file', name: 'carteira_mavsa.btc', size: '1 MB' },
      t('A carteira de bitcoins do resort. Toda minha.'),
    ],
    replies: [
      { label: 'Devolve isso agora!', next: 'desafio' },
      { label: 'Como a gente recupera?', next: 'desafio' },
    ],
  },
  desafio: {
    hacker: [
      t('Hahaha. Só devolvo se a sua equipe de agentes for MUITO esperta.'),
      { kind: 'audio', seconds: 7 },
      t('Escondi os bitcoins em blocos espalhados pelo resort. Cada bloco tem uma pista para o próximo.'),
      t(`Vocês vão ter ${durationText(STORY.minutes)}. Nem um minuto a mais ⏳`),
    ],
    replies: [
      { label: 'Aceito o desafio!', next: 'convite' },
      { label: 'E se a gente não aceitar?', next: 'ameaca' },
    ],
  },
  ameaca: {
    hacker: [t('Aí eu libero a imagem para toda a rede... 📸'), t('Você não vai querer isso. Confia.')],
    replies: [{ label: 'Tá bom, a gente aceita.', next: 'convite' }],
  },
  convite: {
    hacker: [
      t('Sabia 😏'),
      t('Instalei um programa secreto no seu celular. As pistas vão chegar por ele.'),
      t('Junte os agentes e toque no link quando estiverem prontos.'),
      { kind: 'link', to: 'acesso' },
      t('Boa sorte. Vocês vão precisar 🖤'),
    ],
    replies: [],
  },
  snapeErrou: {
    hacker: [t('HAHAHA! Errado! 🐍'), t('Pensem melhor: metade bruxo, metade trouxa... e da realeza.')],
    replies: SNAPE_REPLIES,
  },
  snapeAcertou: {
    hacker: [
      t('Como vocês descobriram?! 😱'),
      t(`Sim... eu sou o ${APELIDO_HACKER.toUpperCase()}.`),
      t(`E o ${APELIDO_HACKER} esteve ao lado de vocês a caça inteira... o tio ${RECREADOR_NOME}! 🧙‍♂️`),
      t('Vocês venceram. A carteira é de vocês.'),
      { kind: 'link', to: 'carteira' },
    ],
    replies: [],
  },
};

export const CHARADA_SNAPE =
  'Sou mestre das poções e escrevi meus segredos nas margens de um livro velho. Meu sangue é metade bruxo, metade trouxa, mas meu título é de realeza. E se perguntarem até quando vou guardar esse segredo... Sempre.';

/**
 * Mensagem do hacker depois do bloco `index` (a cada 3 blocos e no último).
 * No último bloco com o Snape jogando junto, vem a charada e as respostas.
 */
export function checkpoint(index: number, total: number, snape: boolean): Step {
  if (index >= total && snape)
    return {
      hacker: [
        t('NÃO! A carteira inteira?! 😱'),
        { kind: 'video', video: 'snape', seconds: 13 },
        t(CHARADA_SNAPE),
        t('Qual é o meu apelido hacker? Respondam AQUI. Se errarem, a carteira volta para mim 🐍'),
      ],
      replies: SNAPE_REPLIES,
    };
  if (index >= total)
    return {
      hacker: [
        t('NÃO! A carteira inteira?! 😱'),
        { kind: 'video', video: 'final', seconds: 13 },
        t('Vocês recuperaram os bitcoins... mas ainda não sabem quem eu sou 😈'),
        t('Sigam a pista extra no BLACK NODE. Se tiverem coragem.'),
      ],
      replies: [],
    };
  if (index === 3)
    return {
      hacker: [
        t('3 blocos?! Vocês acharam 3 blocos?! 😠'),
        { kind: 'video', video: 'tres', seconds: 15 },
        t('Isso não estava nos meus planos. Mas a imagem continua carregando... ⏳'),
      ],
      replies: [],
    };
  const left = total - index;
  return {
    hacker: [
      t(`Mais 3 blocos... já são ${index} 😤`),
      { kind: 'video', video: 'mais', seconds: 15 },
      t(`${left === 1 ? 'Falta 1' : `Faltam ${left}`}. Duvido chegarem até o fim.`),
    ],
    replies: [],
  };
}

export const FIRST_STEP: StepId = 'oi';

/** Tempo de "digitando..." proporcional ao tamanho da fala. */
export function typingMs(part: Part): number {
  if (part.kind === 'video') return 2400;
  if (part.kind !== 'text') return part.kind === 'link' ? 1800 : 1400;
  return Math.min(2600, Math.max(900, 500 + part.text.length * 32));
}

// ---------- Conversas de fachada ----------
// Deixam o Zap com cara de celular de verdade. Só leitura.

export type DecoyMsg = { from?: string; mine?: boolean; text: string; minutesAgo: number };

export type Decoy = { id: string; name: string; group?: boolean; unread: number; messages: DecoyMsg[] };

export const DECOYS: Decoy[] = [
  {
    id: 'recreacao',
    name: 'Recreação Mavsa 🌴',
    group: true,
    unread: 3,
    messages: [
      { from: 'Ana', text: 'Bom dia, equipe! Oficina de pulseira às 14h na Cidade dos Sonhos', minutesAgo: 95 },
      { mine: true, text: 'Fechado, levo as miçangas', minutesAgo: 90 },
      { from: 'Bruno', text: 'Quem fica com a piscina hoje à tarde?', minutesAgo: 41 },
      { from: 'Ana', text: 'Gente, o telão do Mavsa Hall ligou sozinho agora há pouco 😳', minutesAgo: 12 },
      { from: 'Bruno', text: 'O wi-fi da CDS também tá estranho hoje...', minutesAgo: 9 },
    ],
  },
  {
    id: 'gestao',
    name: 'Gestão Mavsa',
    unread: 0,
    messages: [
      { text: 'Bom dia! Hoje as crianças estão animadas, capricha na atividade especial 😉', minutesAgo: 180 },
      { mine: true, text: 'Pode deixar!', minutesAgo: 176 },
    ],
  },
  {
    id: 'cozinha',
    name: "Lac d'Or · Cozinha",
    unread: 0,
    messages: [
      { text: 'Lanche da recreação sai às 16h na entrada do restaurante', minutesAgo: 240 },
      { mine: true, text: 'Valeu! 🙏', minutesAgo: 238 },
    ],
  },
];
