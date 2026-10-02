'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

// A quiet "more below" cue for a scrolling area: a soft fade at the bottom edge and
// a small pill that scrolls down when clicked. Hidden once you reach the end.
export default function MoreBelow({ scrollRef }: { scrollRef: RefObject<HTMLElement | null> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setVisible(el.scrollTop + el.clientHeight < el.scrollHeight - 24);
    check();
    el.addEventListener('scroll', check, { passive: true });
    // Re-check whenever output is added or the layout changes size
    const mutations = new MutationObserver(check);
    mutations.observe(el, { childList: true, subtree: true });
    const resize = new ResizeObserver(check);
    resize.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      mutations.disconnect();
      resize.disconnect();
    };
  }, [scrollRef]);

  const scrollDown = () => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ top: el.clientHeight * 0.75, behavior: 'smooth' });
  };

  return (
    <div className={`more-below${visible ? ' more-below-on' : ''}`} aria-hidden={!visible}>
      <button type="button" className="more-below-pill" onClick={scrollDown} tabIndex={visible ? 0 : -1}>
        <span className="more-below-flower" aria-hidden="true">✿</span>
        more below
        <span className="more-below-chevron" aria-hidden="true" />
      </button>
    </div>
  );
}
