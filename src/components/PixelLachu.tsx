'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Lachu, Jadiha's green-cheeked conure, perched on the terminal's top edge to her right with
// his tail hanging over the front. He blinks, bobs his head now and then, and says hi when pressed.

const W = 9;
const H = 16;
const SCALE = 4;

// c dark crown, w white eye ring, e eye, b beak, G green, g dark green, q grey scalloped
// breast, R maroon belly, U blue wing tips, F feet, r maroon tail
const BODY = [
  '..cccc...',
  '.cccccc..',
  '.cwwcccG.',
  'bwewcGGG.',
  'bbwwGGGGg',
  'bbGGGGGGg',
  '.qqqGGGgg',
  '.qcqqGGgg',
  '.RqqqGggg',
  '.RRRRGggU',
  '..RRRGgUU',
  '..FF.FFgU',
  '.......rg',
  '.......rr',
  '........r',
  '........r',
];

const COLORS: Record<string, string> = {
  c: '#4A403C',
  w: '#F4F0EA',
  e: '#141014',
  b: '#2A2628',
  G: '#5BBF4F',
  g: '#2E7A38',
  q: '#A3968E',
  R: '#9A2A3A',
  U: '#3F6FC0',
  F: '#8A7A80',
  r: '#A8323A',
};

export default function PixelLachu() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ blink: false, bob: false });
  const [bubble, setBubble] = useState<string | null>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { blink, bob } = stateRef.current;
    ctx.clearRect(0, 0, W, H);
    BODY.forEach((row, y) => row.split('').forEach((c, x) => {
      if (c === '.') return;
      // Head dips a pixel when he bobs
      const dy = bob && y < 6 ? 1 : 0;
      ctx.fillStyle = blink && c === 'e' ? COLORS.w : COLORS[c];
      ctx.fillRect(x, y + dy, 1, 1);
    }));
  }, []);

  const bobHead = useCallback((times: number) => {
    let frames = 0;
    const tick = setInterval(() => {
      frames++;
      stateRef.current.bob = frames % 2 === 1;
      draw();
      if (frames >= times * 2) {
        clearInterval(tick);
        stateRef.current.bob = false;
        draw();
      }
    }, 160);
  }, [draw]);

  // Blinks and the occasional head bob
  useEffect(() => {
    draw();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        stateRef.current.blink = true;
        draw();
        setTimeout(() => { stateRef.current.blink = false; draw(); scheduleBlink(); }, 150);
      }, 2800 + Math.random() * 3000);
    };
    scheduleBlink();
    const bobs = setInterval(() => bobHead(2), 7000);
    return () => { clearTimeout(blinkTimer); clearInterval(bobs); };
  }, [draw, bobHead]);

  const sayHi = useCallback(() => {
    setBubble('hi, im lachu');
    bobHead(2);
    setTimeout(() => setBubble(null), 1800);
  }, [bobHead]);

  // The terminal's `lachu` command makes him say hi too
  useEffect(() => {
    window.addEventListener('say-hi-lachu', sayHi);
    return () => window.removeEventListener('say-hi-lachu', sayHi);
  }, [sayHi]);

  return (
    <button type="button" className="pixel-lachu" onClick={sayHi} aria-label="Say hi to Lachu the conure">
      {bubble && <span className="pixel-bubble">{bubble}</span>}
      <canvas ref={canvasRef} width={W} height={H} style={{ width: W * SCALE, height: H * SCALE }} />
    </button>
  );
}
