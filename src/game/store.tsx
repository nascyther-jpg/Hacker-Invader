import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { DEFAULT_NODES, findCode, type CodeSet, type Mode, type Team } from './config';

// Estado da missão em memória. A persistência entra na fase "Sistema de Bitcoins".

export type Block = { index: number; at: number };

/** Escolhas do recreador antes de entregar o celular. */
export type Setup = { total: number; mode: Mode; team: Team };

type State = {
  setup: Setup;
  /** Momento em que o recreador iniciou a missão; null = ainda na configuração. */
  startedAt: number | null;
  blocks: Block[];
  /** Índices das charadas já decifradas (a animação roda só na primeira vez). */
  decrypted: number[];
};

type Action =
  | { type: 'start'; setup: Setup; at: number }
  | { type: 'acquire'; index: number; at: number }
  | { type: 'decrypt'; index: number }
  | { type: 'reset' };

const initial: State = {
  setup: { total: DEFAULT_NODES, mode: 'solo', team: 'A' },
  startedAt: null,
  blocks: [],
  decrypted: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { setup: action.setup, startedAt: action.at, blocks: [], decrypted: [] };
    case 'acquire':
      if (state.blocks.some((b) => b.index === action.index)) return state;
      return { ...state, blocks: [...state.blocks, { index: action.index, at: action.at }] };
    case 'decrypt':
      if (state.decrypted.includes(action.index)) return state;
      return { ...state, decrypted: [...state.decrypted, action.index] };
    case 'reset':
      // Mantém a última configuração para o recreador só confirmar.
      return { ...initial, setup: state.setup };
  }
}

export type ScanResult =
  | { kind: 'valid'; index: number; code: string }
  | { kind: 'duplicate'; index: number }
  | { kind: 'locked'; index: number; expected: number }
  /** QR de outro time (ou da missão solo). */
  | { kind: 'foreign'; owner: CodeSet }
  | { kind: 'invalid' };

type Mission = State & {
  total: number;
  mode: Mode;
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
  reset: () => void;
};

const MissionContext = createContext<Mission | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const { total, mode, team } = state.setup;
  const codeSet: CodeSet = mode === 'versus' ? team : 'solo';
  const btc = state.blocks.length;
  const complete = btc >= total;
  const nextIndex = complete ? null : btc + 1;
  const finishedAt = complete && btc > 0 ? Math.max(...state.blocks.map((b) => b.at)) : null;

  const check = useCallback(
    (raw: string): ScanResult => {
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
    [state.blocks, btc, codeSet, total],
  );

  const start = useCallback((setup: Setup) => dispatch({ type: 'start', setup, at: Date.now() }), []);
  const acquire = useCallback((index: number) => dispatch({ type: 'acquire', index, at: Date.now() }), []);
  const markDecrypted = useCallback((index: number) => dispatch({ type: 'decrypt', index }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo<Mission>(
    () => ({
      ...state,
      total,
      mode,
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
      reset,
    }),
    [state, total, mode, codeSet, btc, nextIndex, complete, finishedAt, check, start, acquire, markDecrypted, reset],
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): Mission {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission precisa estar dentro de MissionProvider');
  return ctx;
}
