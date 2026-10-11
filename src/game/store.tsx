import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { HACKER_CODE, STORY, findCode, routeFor, type CodeSet, type Mode, type Period, type Stop, type Team } from './config';

// Estado da missão em memória. A persistência entra na fase "Sistema de Bitcoins".

export type Block = { index: number; at: number };

/** Escolhas do recreador antes de entregar o celular. */
export type Setup = { total: number; mode: Mode; team: Team; period: Period; /** Roteiro do hacker ligado. */ story: boolean };

type State = {
  setup: Setup;
  /** Momento em que o recreador iniciou a missão; null = ainda na configuração. */
  startedAt: number | null;
  blocks: Block[];
  /** Índices das charadas já decifradas (a animação roda só na primeira vez). */
  decrypted: number[];
  /** Momento em que as crianças escanearam o crachá do tio (roteiro do hacker). */
  unmaskedAt: number | null;
  /** Gravação da voz do tio. Sobrevive ao reinício da missão. */
  voiceUri: string | null;
};

type Action =
  | { type: 'start'; setup: Setup; at: number }
  | { type: 'acquire'; index: number; at: number }
  | { type: 'decrypt'; index: number }
  | { type: 'unmask'; at: number }
  | { type: 'voice'; uri: string | null }
  | { type: 'reset' };

const initial: State = {
  setup: { total: STORY.nodes, mode: 'solo', team: 'A', period: 'dia', story: true },
  startedAt: null,
  blocks: [],
  decrypted: [],
  unmaskedAt: null,
  voiceUri: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { ...state, setup: action.setup, startedAt: action.at, blocks: [], decrypted: [], unmaskedAt: null };
    case 'acquire':
      if (state.blocks.some((b) => b.index === action.index)) return state;
      return { ...state, blocks: [...state.blocks, { index: action.index, at: action.at }] };
    case 'decrypt':
      if (state.decrypted.includes(action.index)) return state;
      return { ...state, decrypted: [...state.decrypted, action.index] };
    case 'unmask':
      return state.unmaskedAt === null ? { ...state, unmaskedAt: action.at } : state;
    case 'voice':
      return { ...state, voiceUri: action.uri };
    case 'reset':
      // Mantém a última configuração (e a voz gravada) para o recreador só confirmar.
      return { ...initial, setup: state.setup, voiceUri: state.voiceUri };
  }
}

export type ScanResult =
  | { kind: 'valid'; index: number; code: string }
  | { kind: 'duplicate'; index: number }
  | { kind: 'locked'; index: number; expected: number }
  /** QR de outro time (ou da missão solo). */
  | { kind: 'foreign'; owner: CodeSet }
  /** Crachá do tio: desmascara o hacker depois da meta. */
  | { kind: 'hacker' }
  /** Crachá do tio antes da meta: ainda não vale. */
  | { kind: 'hackerEarly' }
  | { kind: 'invalid' };

type Mission = State & {
  total: number;
  mode: Mode;
  period: Period;
  story: boolean;
  /** Fim do cronômetro regressivo do roteiro; null fora dele. */
  deadline: number | null;
  /** Roteiro: o hacker já foi desmascarado. */
  unmasked: boolean;
  /** Paradas da missão; o bloco N fica em route[N-1]. */
  route: Stop[];
  /** Conjunto de QR deste aparelho. */
  codeSet: CodeSet;
  started: boolean;
  btc: number;
  /** Próximo bloco a encontrar (1..total), ou null se a missão acabou. */
  nextIndex: number | null;
  complete: boolean;
  /** Momento do último bloco, quando a missão acabou. */
  finishedAt: number | null;
  /** Avalia um código sem alterar o estado. */
  check: (code: string) => ScanResult;
  start: (setup: Setup) => void;
  acquire: (index: number) => void;
  markDecrypted: (index: number) => void;
  unmask: () => void;
  setVoice: (uri: string | null) => void;
  reset: () => void;
};

const MissionContext = createContext<Mission | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const { total, mode, team, period, story } = state.setup;
  const route = useMemo(() => routeFor(period, total), [period, total]);
  const codeSet: CodeSet = mode === 'versus' ? team : 'solo';
  const btc = state.blocks.length;
  const complete = btc >= total;
  const nextIndex = complete ? null : btc + 1;
  const finishedAt = complete && btc > 0 ? Math.max(...state.blocks.map((b) => b.at)) : null;
  const deadline = story && state.startedAt !== null ? state.startedAt + STORY.minutes * 60_000 : null;
  const unmasked = state.unmaskedAt !== null;

  const check = useCallback(
    (raw: string): ScanResult => {
      if (raw.trim().toUpperCase() === HACKER_CODE && story) return complete ? { kind: 'hacker' } : { kind: 'hackerEarly' };
      const found = findCode(raw);
      if (!found) return { kind: 'invalid' };
      if (found.set !== codeSet) return { kind: 'foreign', owner: found.set };
      // Bloco além do número de pistas escolhido: não faz parte desta missão.
      if (found.index > total) return { kind: 'invalid' };
      if (state.blocks.some((b) => b.index === found.index)) return { kind: 'duplicate', index: found.index };
      // Os blocos seguem a ordem das charadas.
      if (found.index !== btc + 1) return { kind: 'locked', index: found.index, expected: btc + 1 };
      return { kind: 'valid', index: found.index, code: found.code };
    },
    [state.blocks, btc, codeSet, total, story, complete],
  );

  const start = useCallback((setup: Setup) => dispatch({ type: 'start', setup, at: Date.now() }), []);
  const acquire = useCallback((index: number) => dispatch({ type: 'acquire', index, at: Date.now() }), []);
  const markDecrypted = useCallback((index: number) => dispatch({ type: 'decrypt', index }), []);
  const unmask = useCallback(() => dispatch({ type: 'unmask', at: Date.now() }), []);
  const setVoice = useCallback((uri: string | null) => dispatch({ type: 'voice', uri }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo<Mission>(
    () => ({
      ...state,
      total,
      mode,
      period,
      story,
      deadline,
      unmasked,
      route,
      codeSet,
      started: state.startedAt !== null,
      btc,
      nextIndex,
      complete,
      finishedAt,
      check,
      start,
      acquire,
      markDecrypted,
      unmask,
      setVoice,
      reset,
    }),
    [
      state,
      total,
      mode,
      period,
      story,
      deadline,
      unmasked,
      route,
      codeSet,
      btc,
      nextIndex,
      complete,
      finishedAt,
      check,
      start,
      acquire,
      markDecrypted,
      unmask,
      setVoice,
      reset,
    ],
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): Mission {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission precisa estar dentro de MissionProvider');
  return ctx;
}
