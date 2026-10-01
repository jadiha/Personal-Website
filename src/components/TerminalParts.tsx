'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

// Small pieces shared by the desktop and mobile terminals

export function TerminalTitleBar() {
  return (
    <div className="terminal-titlebar">
      <span className="terminal-dots" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="terminal-title">jadiha@golden-hour: ~</span>
      <span className="terminal-status"><span className="terminal-status-dot" /> online</span>
    </div>
  );
}

export function Prompt() {
  return (
    <span className="prompt">
      <span className="prompt-flower" aria-hidden="true">✿</span>
      <span className="prompt-user">visitor</span>
      <span className="prompt-at">@</span>
      <span className="prompt-host">jadiha</span>
      <span className="prompt-path">:~$</span>
    </span>
  );
}

const BURST_COLORS = ['#FFE58A', '#FFB3C6', '#FFFFFF', '#D9B8FF', '#FFCBA8'];

// A puff of pixel sparkles that floats up from the input and fades
export function SparkleBurst() {
  const [bits] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      x: 8 + Math.random() * 40,
      dx: (Math.random() - 0.5) * 160,
      dy: -50 - Math.random() * 90,
      size: Math.random() > 0.6 ? 7 : 4,
      delay: Math.random() * 120,
      color: BURST_COLORS[i % BURST_COLORS.length],
    }))
  );

  return (
    <span className="sparkle-burst" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="sparkle-bit"
          style={{
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            background: b.color,
            animationDelay: `${b.delay}ms`,
            '--dx': `${b.dx}px`,
            '--dy': `${b.dy}px`,
          } as CSSProperties}
        />
      ))}
    </span>
  );
}
