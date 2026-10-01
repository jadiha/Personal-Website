'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

// Floats its children up and fades them in the first time they scroll into view
export default function Reveal({ children, style, delay = 0 }: { children: ReactNode; style?: CSSProperties; delay?: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' reveal-in' : ''}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
