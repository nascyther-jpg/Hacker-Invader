// Roteiro da conversa do hacker no Zap. Edite as falas aqui.
// Cada etapa: o que o hacker manda (em sequência, com "digitando...") e as respostas
// que o recreador pode tocar. A última etapa termina com o link que abre o BLACK NODE.

import { STORY, durationText } from '../game/config';

/** Número que aparece no lugar do nome: claramente falso. */
export const HACKER_NUMBER = '+00 404 404 404';
export const HACKER_PUSHNAME = 'BLACK NODE';

export type Part =
  | { kind: 'text'; text: string }
  | { kind: 'image'; caption?: string }
  | { kind: 'file'; name: string; size: string }
  | { kind: 'audio'; seconds: number }
  | { kind: 'link' };

export type StepId = 'oi' | 'quem' | 'prova' | 'desafio' | 'ameaca' | 'convite';

export type Reply = { label: string; next: StepId };

export type Step = { hacker: Part[]; replies: Reply[] };

const t = (text: string): Part => ({ kind: 'text', text });

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
      { kind: 'link' },
      t('Boa sorte. Vocês vão precisar 🖤'),
    ],
    replies: [],
  },
};

export const FIRST_STEP: StepId = 'oi';

/** Tempo de "digitando..." proporcional ao tamanho da fala. */
export function typingMs(part: Part): number {
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
