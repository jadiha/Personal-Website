'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// A little black pixel cat that sits on the terminal. It blinks, swishes its tail,
// watches the cursor, and purrs with hearts when you pet it (click, tap, or the
// `pet` / `cat` / `meow` terminal commands, which fire a `pet-cat` window event).

const W = 20;
const H = 17;
const SCALE = 4;

// K body, H highlight, P inner ear / nose pink
const BODY = [
  '..K......K..',
  '.KK.....KK..',
  '.KPK...KPK..',
  '.KKKKKKKKKK.',
  'KHHKKKKKKKKK',
  'KKKKKKKKKKKK',
  'KKKKKKKKKKKK',
  'KKKKKPPKKKKK',
  '.KKKKKKKKKK.',
  '..KKKKKKKK..',
  '.KHKKKKKKKK.',
  'KHKKKKKKKKKK',
  'KHKKKKKKKKKK',
  'KKKKKKKKKKKK',
  'KKKKKKKKKKKK',
  'KKKKKKKKKKKK',
  '.KK.KK.KK.KK',
];

const TAIL_FRAMES: [number, number][][] = [
  [[12, 15], [13, 15], [14, 14], [15, 13], [15, 12], [16, 11], [16, 10]],
  [[12, 15], [13, 15], [14, 15], [15, 14], [16, 13], [17, 12], [17, 11]],
  [[12, 15], [13, 14], [14, 13], [14, 12], [15, 11], [16, 10], [17, 10]],
  [[12, 15], [13, 15], [14, 14], [15, 13], [15, 12], [16, 11], [16, 10]],
];

const COLORS: Record<string, string> = {
  K: '#1E1A26',
  H: '#3A3348',
  P: '#FF9CAE',
};

const MEOWS = ['meow!', 'purr…', 'mrrp?', '=^.^=', 'prrrr', 'mew!'];

export default function PixelCat() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lookRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef({ tail: 0, blink: false, happy: false });
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  const [purring, setPurring] = useState(false);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { tail, blink, happy } = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    BODY.forEach((row, y) => row.split('').forEach((c, x) => {
      if (c === '.') return;
      ctx.fillStyle = COLORS[c];
      ctx.fillRect(x, y, 1, 1);
    }));

    ctx.fillStyle = COLORS.K;
    TAIL_FRAMES[tail].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));

    // Eyes: 2×2 gold with a pupil glint that follows the cursor
    const eyes = [2, 8];
    if (happy) {
      ctx.fillStyle = '#FFE58A';
      eyes.forEach(ex => {
        ctx.fillRect(ex - 1, 6, 1, 1);
        ctx.fillRect(ex, 5, 2, 1);
        ctx.fillRect(ex + 2, 6, 1, 1);
      });
    } else if (blink) {
      ctx.fillStyle = '#FFE58A';
      eyes.forEach(ex => ctx.fillRect(ex, 6, 2, 1));
    } else {
      const lx = lookRef.current.x > 0 ? 1 : 0;
      const ly = lookRef.current.y > 0 ? 1 : 0;
      eyes.forEach(ex => {
        ctx.fillStyle = '#FFE58A';
        ctx.fillRect(ex, 5, 2, 2);
        ctx.fillStyle = '#2A1F10';
        ctx.fillRect(ex + lx, 5 + ly, 1, 1);
      });
    }

    // Rosy cheeks while being petted
    if (happy) {
      ctx.fillStyle = 'rgba(255, 156, 174, 0.8)';
      ctx.fillRect(1, 7, 1, 1);
      ctx.fillRect(10, 7, 1, 1);
    }
  }, []);

  // Tail swish and occasional blinks
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    draw();
    if (reduce) return;
    const tail = setInterval(() => {
      stateRef.current.tail = (stateRef.current.tail + 1) % TAIL_FRAMES.length;
      draw();
    }, 380);
    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        stateRef.current.blink = true;
        draw();
        setTimeout(() => { stateRef.current.blink = false; draw(); scheduleBlink(); }, 160);
      }, 2500 + Math.random() * 3000);
    };
    scheduleBlink();
    return () => { clearInterval(tail); clearTimeout(blinkTimer); };
  }, [draw]);

  // Eyes follow the cursor
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = { x: e.clientX - (rect.left + rect.width / 2), y: e.clientY - (rect.top + rect.height * 0.35) };
      if (Math.sign(next.x) !== Math.sign(lookRef.current.x) || Math.sign(next.y) !== Math.sign(lookRef.current.y)) {
        lookRef.current = next;
        draw();
      } else {
        lookRef.current = next;
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [draw]);

  const pet = useCallback(() => {
    stateRef.current.happy = true;
    draw();
    setPurring(true);
    setBubble(MEOWS[Math.floor(Math.random() * MEOWS.length)]);
    const id = Date.now() + Math.random();
    setHearts(prev => [...prev, id]);
    setTimeout(() => setHearts(prev => prev.filter(h => h !== id)), 1400);
    setTimeout(() => {
      stateRef.current.happy = false;
      draw();
      setPurring(false);
      setBubble(null);
    }, 1500);
  }, [draw]);

  // Terminal commands can pet the cat too
  useEffect(() => {
    window.addEventListener('pet-cat', pet);
    return () => window.removeEventListener('pet-cat', pet);
  }, [pet]);

  return (
    <button type="button" className={`pixel-cat${purring ? ' pixel-cat-purr' : ''}`} onClick={pet} aria-label="Pet the cat">
      {bubble && <span className="pixel-cat-bubble">{bubble}</span>}
      {hearts.map(id => (
        <span key={id} className="pixel-cat-hearts" aria-hidden="true">
          <i>♥</i><i>♥</i><i>♥</i>
        </span>
      ))}
      <canvas ref={canvasRef} width={W} height={H} style={{ width: W * SCALE, height: H * SCALE }} />
    </button>
  );
}
