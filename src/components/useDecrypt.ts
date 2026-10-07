import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

// Revela um texto da esquerda para a direita, embaralhando o trecho ainda cifrado.
// Atualiza o texto por quadros curtos: conteúdo textual não anima na UI thread.

// Troca mantendo a caixa (maiúscula/minúscula) para a largura ficar parecida
// e o texto não quebrar em linhas diferentes durante a revelação.
const LOWER = 'abcdefghknopqrsuvxyz';
const UPPER = 'ABCDEFHKNPRSTUVXYZ';

function pick(set: string): string {
  return set[Math.floor(Math.random() * set.length)];
}

function scramble(char: string): string {
  if (/\s/.test(char) || /[.,!?]/.test(char)) return char;
  return char === char.toUpperCase() && char !== char.toLowerCase() ? pick(UPPER) : pick(LOWER);
}

export function useDecrypt(text: string, { run, duration = 1400 }: { run: boolean; duration?: number }) {
  const reduced = useReducedMotion();
  const instant = !run || reduced;
  const [output, setOutput] = useState(instant ? text : text.replace(/\S/g, scramble));
  const [progress, setProgress] = useState(instant ? 1 : 0);
  const started = useRef(false);

  useEffect(() => {
    if (instant) {
      setOutput(text);
      setProgress(1);
      return;
    }
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const cut = Math.floor(text.length * p);
      setOutput(text.slice(0, cut) + text.slice(cut).replace(/\S/g, scramble));
      setProgress(p);
      if (p >= 1) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [instant, text, duration]);

  return { output, progress, done: progress >= 1 };
}
