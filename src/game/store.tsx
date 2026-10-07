import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { MISSION, findNodeByCode, type NodeDef } from './config';

// Estado da missão em memória. A persistência entra na fase "Sistema de Bitcoins".

export type Block = { index: number; at: number };

type State = {
  blocks: Block[];
  /** Índices das charadas já decifradas (a animação roda só na primeira vez). */
  decrypted: number[];
};

type Action =
  | { type: 'acquire'; index: number; at: number }
  | { type: 'decrypt'; index: number }
  | { type: 'reset' };

const initial: State = { blocks: [], decrypted: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'acquire':
      if (state.blocks.some((b) => b.index === action.index)) return state;
      return { ...state, blocks: [...state.blocks, { index: action.index, at: action.at }] };
    case 'decrypt':
      if (state.decrypted.includes(action.index)) return state;
      return { ...state, decrypted: [...state.decrypted, action.index] };
    case 'reset':
      return initial;
  }
}

export type ScanResult =
  | { kind: 'valid'; node: NodeDef }
  | { kind: 'duplicate'; node: NodeDef }
  | { kind: 'locked'; node: NodeDef; expected: number }
  | { kind: 'invalid' };

type Mission = State & {
  btc: number;
  /** Próximo bloco a encontrar (1..4), ou null se a missão acabou. */
  nextIndex: number | null;
  complete: boolean;
  /** Avalia um código sem alterar o estado. */
  check: (code: string) => ScanResult;
  acquire: (index: number) => void;
  markDecrypted: (index: number) => void;
  reset: () => void;
};

const MissionContext = createContext<Mission | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const btc = state.blocks.length;
  const complete = btc >= MISSION.totalNodes;
  const nextIndex = complete ? null : btc + 1;

  const check = useCallback(
    (code: string): ScanResult => {
      const node = findNodeByCode(code);
      if (!node) return { kind: 'invalid' };
      if (state.blocks.some((b) => b.index === node.index)) return { kind: 'duplicate', node };
      // Os blocos seguem a ordem das charadas.
      if (node.index !== btc + 1) return { kind: 'locked', node, expected: btc + 1 };
      return { kind: 'valid', node };
    },
    [state.blocks, btc],
  );

  const acquire = useCallback((index: number) => dispatch({ type: 'acquire', index, at: Date.now() }), []);
  const markDecrypted = useCallback((index: number) => dispatch({ type: 'decrypt', index }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo<Mission>(
    () => ({ ...state, btc, nextIndex, complete, check, acquire, markDecrypted, reset }),
    [state, btc, nextIndex, complete, check, acquire, markDecrypted, reset],
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission(): Mission {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission precisa estar dentro de MissionProvider');
  return ctx;
}
