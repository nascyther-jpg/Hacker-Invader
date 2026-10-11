import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { FIRST_STEP, SCRIPT, typingMs, type Part, type Reply, type Step, type StepId } from './script';

// Estado do Zap em memória. A conversa anda sozinha mesmo com o chat fechado
// (a lista mostra "digitando..."), como num celular de verdade.

export type Msg = { id: number; at: number; mine: boolean; part: Part };

type State = {
  thread: Msg[];
  step: StepId;
  /** Falas do hacker ainda por chegar, em ordem. */
  pending: Part[];
  /** Respostas que aparecem quando o hacker termina de falar. */
  replies: Reply[];
  /** Blocos da missão atual que já renderam mensagem do hacker. */
  checkpoints: number[];
  typing: boolean;
  /** Quantas mensagens o recreador já viu (para o contador de não lidas). */
  seen: number;
  /** O link foi aberto: o BLACK NODE está liberado. */
  unlocked: boolean;
  /** Tamanho da conversa quando o BLACK NODE abriu: só o que vem depois vira notificação. */
  unlockedAt: number;
  nextId: number;
};

type Action =
  | { type: 'typing' }
  | { type: 'deliver'; at: number }
  | { type: 'reply'; reply: Reply; at: number }
  | { type: 'checkpoint'; index: number; step: Step }
  | { type: 'newMission' }
  | { type: 'seen' }
  | { type: 'unlock' }
  | { type: 'restart'; at: number };

function opening(at: number): State {
  // As duas primeiras falas já chegaram quando o app abre.
  const thread = SCRIPT[FIRST_STEP].hacker.map((part, i) => ({ id: i, at: at - (2 - i) * 60_000, mine: false, part }));
  return {
    thread,
    step: FIRST_STEP,
    pending: [],
    replies: SCRIPT[FIRST_STEP].replies,
    checkpoints: [],
    typing: false,
    seen: 0,
    unlocked: false,
    unlockedAt: 0,
    nextId: thread.length,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'typing':
      return { ...state, typing: true };
    case 'deliver': {
      const [part, ...rest] = state.pending;
      if (!part) return state;
      const msg = { id: state.nextId, at: action.at, mine: false, part };
      return { ...state, thread: [...state.thread, msg], pending: rest, typing: false, nextId: state.nextId + 1 };
    }
    case 'reply': {
      if (state.pending.length || state.typing) return state;
      const msg = { id: state.nextId, at: action.at, mine: true, part: { kind: 'text', text: action.reply.label } as Part };
      return {
        ...state,
        thread: [...state.thread, msg],
        step: action.reply.next,
        pending: SCRIPT[action.reply.next].hacker,
        replies: SCRIPT[action.reply.next].replies,
        nextId: state.nextId + 1,
      };
    }
    case 'checkpoint':
      if (state.checkpoints.includes(action.index)) return state;
      return {
        ...state,
        checkpoints: [...state.checkpoints, action.index],
        pending: [...state.pending, ...action.step.hacker],
        replies: action.step.replies,
      };
    case 'newMission':
      // A charada do Snape da missão anterior não vale mais.
      return {
        ...state,
        checkpoints: [],
        pending: [],
        typing: false,
        step: state.step.startsWith('snape') ? 'convite' : state.step,
        replies: state.step.startsWith('snape') ? [] : state.replies,
      };
    case 'seen':
      return state.seen === state.thread.length ? state : { ...state, seen: state.thread.length };
    case 'unlock':
      return state.unlocked ? state : { ...state, unlocked: true, unlockedAt: state.thread.length };
    case 'restart': {
      const fresh = opening(action.at);
      return {
        ...fresh,
        unlocked: state.unlocked,
        unlockedAt: state.unlocked ? fresh.thread.length : 0,
        checkpoints: state.checkpoints,
      };
    }
  }
}

type Zap = State & {
  /** Respostas disponíveis agora (vazio enquanto o hacker fala ou no fim). */
  replies: Reply[];
  unread: number;
  /** O hacker já mandou o link. */
  invited: boolean;
  reply: (reply: Reply) => void;
  /** O hacker manda a mensagem do bloco `index` (uma vez por missão). */
  sendCheckpoint: (index: number, step: Step) => void;
  /** Missão nova no BLACK NODE: as mensagens por bloco voltam a valer. */
  newMission: () => void;
  markSeen: () => void;
  unlock: () => void;
  restart: () => void;
};

const NO_REPLIES: Reply[] = [];

const ZapContext = createContext<Zap | null>(null);

export function ZapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => opening(Date.now()));

  // Motor da conversa: pausa curta, "digitando...", entrega. Repete até esvaziar a fila.
  useEffect(() => {
    const part = state.pending[0];
    if (!part) return;
    const t = state.typing
      ? setTimeout(() => dispatch({ type: 'deliver', at: Date.now() }), typingMs(part))
      : setTimeout(() => dispatch({ type: 'typing' }), 650);
    return () => clearTimeout(t);
  }, [state.pending, state.typing]);

  const busy = state.pending.length > 0 || state.typing;
  const replies = busy ? NO_REPLIES : state.replies;
  const unread = state.thread.slice(state.seen).filter((m) => !m.mine).length;
  const invited = state.thread.some((m) => m.part.kind === 'link');

  const reply = useCallback((r: Reply) => dispatch({ type: 'reply', reply: r, at: Date.now() }), []);
  const sendCheckpoint = useCallback((index: number, step: Step) => dispatch({ type: 'checkpoint', index, step }), []);
  const newMission = useCallback(() => dispatch({ type: 'newMission' }), []);
  const markSeen = useCallback(() => dispatch({ type: 'seen' }), []);
  const unlock = useCallback(() => dispatch({ type: 'unlock' }), []);
  const restart = useCallback(() => dispatch({ type: 'restart', at: Date.now() }), []);

  const value = useMemo<Zap>(
    () => ({ ...state, replies, unread, invited, reply, sendCheckpoint, newMission, markSeen, unlock, restart }),
    [state, replies, unread, invited, reply, sendCheckpoint, newMission, markSeen, unlock, restart],
  );

  return <ZapContext.Provider value={value}>{children}</ZapContext.Provider>;
}

export function useZap(): Zap {
  const ctx = useContext(ZapContext);
  if (!ctx) throw new Error('useZap precisa estar dentro de ZapProvider');
  return ctx;
}

/** "14:05" */
export function clock(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Texto curto de uma mensagem, para a prévia na lista. */
export function preview(part: Part): string {
  switch (part.kind) {
    case 'text':
      return part.text;
    case 'image':
      return `📷 ${part.caption ?? 'Foto'}`;
    case 'file':
      return `📄 ${part.name}`;
    case 'audio':
      return `🎤 0:${String(part.seconds).padStart(2, '0')}`;
    case 'video':
      return '🎥 Vídeo';
    case 'link':
      return `blacknode://${part.to}`;
  }
}
