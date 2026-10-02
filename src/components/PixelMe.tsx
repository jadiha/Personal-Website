'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// A chibi pixel Jadiha sitting on the terminal's top edge with her legs dangling over
// the front. She swings her legs, blinks, and waves with a speech bubble when clicked.

const W = 17;
const H = 23;
const SCALE = 4;
// Rows below this hang over the terminal's front edge
export const PIXEL_ME_OVERHANG = 5;

// D hair, d hair shine, S skin, s skin shadow, E eyes, B blush, M smile,
// T hoodie, t hoodie shadow, Z zipper, K black top, J jeans (lap)
const BODY = [
  '....DDDDDDDD.....',
  '...DDDDDDDDDD....',
  '..DDdDDDDDDDDD...',
  '..DDSSSSSSSSDD...',
  '.DDSSSSSSSSSSDD..',
  '.DDSESSSSSSESDD..',
  '.DDSESSSSSSESDD..',
  '.DDBSSSSSSSSBDD..',
  '.DDSSSSMMSSSSDD..',
  '.DDDSSSSSSSSDDD..',
  '.DDDDsSSSSsDDDD..',
  '.DDTTTKKKKTTTDD..',
  '.DTTTTKZKKTTTTD..',
  '.DTTTTTZTTTTTTD..',
  '.DtTTTTZTTTTTtD..',
  '..tTTTTZTTTTt....',
  '..tSTTTZTTTSt....',
  '..JJJJJJJJJJJJ...',
];

const COLORS: Record<string, string> = {
  D: '#2A1B1A',
  d: '#4E332D',
  S: '#9A5E3F',
  s: '#7E4A30',
  E: '#2A1B1A',
  B: '#D9787A',
  M: '#B8484E',
  T: '#D2B48C',
  t: '#B8986E',
  Z: '#8A6E50',
  K: '#1E1A26',
  J: '#6B7FB0',
};

const HELLOS = ['hey, how you doing!', 'try the terminal <3', 'thanks for stopping by ✿', 'pet the cat!'];

export default function PixelMe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ swing: 0, blink: false, wave: 0 });
  const [bubble, setBubble] = useState<string | null>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { swing, blink, wave } = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    BODY.forEach((row, y) => row.split('').forEach((c, x) => {
      if (c === '.') return;
      ctx.fillStyle = COLORS[c];
      ctx.fillRect(x, y, 1, 1);
    }));

    if (blink) {
      ctx.fillStyle = COLORS.S;
      ctx.fillRect(4, 5, 1, 1);
      ctx.fillRect(11, 5, 1, 1);
    }

    // Dangling legs and sneakers, swinging opposite each other
    const legs = [
      { x: 3, dx: swing === 1 ? -1 : 0 },
      { x: 10, dx: swing === 1 ? 1 : 0 },
    ];
    legs.forEach(({ x, dx }) => {
      ctx.fillStyle = COLORS.J;
      ctx.fillRect(x, 18, 3, 2);
      ctx.fillRect(x + dx, 20, 3, 2);
      ctx.fillStyle = '#F4F0EC';
      ctx.fillRect(x + dx - (dx < 0 ? 1 : 0), 22, 4, 1);
    });

    // Waving arm: sleeve up from the shoulder, hand at the top
    if (wave) {
      const lean = wave === 1 ? 0 : 1;
      ctx.fillStyle = COLORS.T;
      ctx.fillRect(14, 11, 1, 2);
      ctx.fillRect(14 + lean, 9, 1, 2);
      ctx.fillStyle = COLORS.S;
      ctx.fillRect(14 + lean, 7, 2, 2);
    }
  }, []);

  // Leg swing and blinking
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    draw();
    if (reduce) return;
    const swing = setInterval(() => {
      stateRef.current.swing = 1 - stateRef.current.swing;
      draw();
    }, 650);
    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        stateRef.current.blink = true;
        draw();
        setTimeout(() => { stateRef.current.blink = false; draw(); scheduleBlink(); }, 150);
      }, 3200 + Math.random() * 3000);
    };
    scheduleBlink();
    return () => { clearInterval(swing); clearTimeout(blinkTimer); };
  }, [draw]);

  const wave = useCallback(() => {
    setBubble(HELLOS[Math.floor(Math.random() * HELLOS.length)]);
    let frames = 0;
    const tick = setInterval(() => {
      frames++;
      stateRef.current.wave = frames % 2 === 0 ? 1 : 2;
      draw();
      if (frames >= 6) {
        clearInterval(tick);
        stateRef.current.wave = 0;
        draw();
      }
    }, 220);
    setTimeout(() => setBubble(null), 1800);
  }, [draw]);

  return (
    <button type="button" className="pixel-me" onClick={wave} aria-label="Say hi to Jadiha">
      {bubble && <span className="pixel-cat-bubble pixel-me-bubble">{bubble}</span>}
      <canvas ref={canvasRef} width={W} height={H} style={{ width: W * SCALE, height: H * SCALE }} />
    </button>
  );
}
