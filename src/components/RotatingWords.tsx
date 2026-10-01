'use client';

import { useEffect, useState } from 'react';

// Cycles through words: each one writes itself in from a soft blur, holds, then
// dissolves upward before the next arrives
export default function RotatingWords({ words, hold = 2200 }: { words: string[]; hold?: number }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), hold);
    const next = setTimeout(() => {
      setIndex(i => (i + 1) % words.length);
      setLeaving(false);
    }, hold + 320);
    return () => { clearTimeout(out); clearTimeout(next); };
  }, [index, hold, words.length]);

  return (
    <span className="rotating-words" aria-live="polite">
      <span key={index} className={`rotating-word${leaving ? ' rotating-word-out' : ''}`}>
        {words[index].split('').map((ch, i) => (
          <span key={i} className="rotating-letter" style={{ animationDelay: `${i * 28}ms` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
