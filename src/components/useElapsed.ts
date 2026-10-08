import { useEffect, useState } from 'react';

/** Milissegundos desde `from`, atualizado a cada segundo. Para em `until`, se houver. */
export function useElapsed(from: number | null, until: number | null = null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (from === null || until !== null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [from, until]);

  if (from === null) return 0;
  return (until ?? now) - from;
}
