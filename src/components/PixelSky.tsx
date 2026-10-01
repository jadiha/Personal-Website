'use client';

import { useEffect, useRef } from 'react';

// Golden-hour pixel world drawn at low resolution and upscaled with pixelated rendering:
// 320×180 landscape on desktop, 180×320 portrait on phones. Runs its own animation loop
// and reads scroll progress (0–100) from a ref so the page doesn't re-render every frame.

const GROUND = 36;

type RGB = [number, number, number];

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ramp = (v: number, start: number, end: number) => clamp((v - start) / (end - start), 0, 1);

// Sky stops top → horizon, for the start of the journey and the warmer sunset at the end
const SKY_DAY = ['#C8B4E6', '#DDB5DD', '#F2B9CF', '#FFC8BE', '#FFD6B0', '#FFE6B5'].map(hex);
const SKY_DUSK = ['#B39BDB', '#D3A2D6', '#F0A8C2', '#FFB7A6', '#FFC795', '#FFD98F'].map(hex);

// 4×4 Bayer matrix for ordered dithering between sky stops
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map(row => row.map(v => (v + 0.5) / 16));

const WARMTH_STEPS = 24;

function buildSky(W: number, HORIZON: number, warmth: number): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = W;
  off.height = HORIZON;
  const ctx = off.getContext('2d')!;
  const img = ctx.createImageData(W, HORIZON);
  const stops = SKY_DAY.map((c, i) => mix(c, SKY_DUSK[i], warmth));
  const segments = stops.length - 1;

  for (let y = 0; y < HORIZON; y++) {
    const pos = (y / (HORIZON - 1)) * segments;
    const i = Math.min(segments - 1, Math.floor(pos));
    const frac = pos - i;
    for (let x = 0; x < W; x++) {
      const c = frac > BAYER[y % 4][x % 4] ? stops[i + 1] : stops[i];
      const o = (y * W + x) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return off;
}

const RAINBOW = ['#FF9AA8', '#FFC09A', '#FFE6A0', '#BDE6A8', '#A8D8F0', '#B8B0F0', '#D9A8F0'].map(hex);

function buildRainbow(radius: number, band: number): HTMLCanvasElement {
  const size = radius * 2;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = radius;
  const ctx = off.getContext('2d')!;
  const img = ctx.createImageData(size, radius);
  for (let y = 0; y < radius; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - radius, radius - y - 0.5);
      const k = Math.floor((radius - d) / band);
      if (k < 0 || k >= RAINBOW.length) continue;
      // Fade toward the feet so the arc melts into the haze above the horizon
      const lift = (radius - y) / radius;
      const alpha = Math.min(1, lift * 2.2) * 255;
      const c = RAINBOW[k];
      const o = (y * size + x) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return off;
}

// Deterministic pseudo-random so the scene looks the same on every load
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

interface Sparkle { x: number; y: number; speed: number; phase: number; color: string; }

const SPARKLE_COLORS = ['#FFFFFF', '#FFE58A', '#FFB3C6', '#FFF3C4'];
const FLOWER_COLORS = ['#FF8FA8', '#FFE566', '#FFFFFF', '#FFC2D6', '#FFB58A', '#D9B8FF'];
interface PixelSkyProps {
  progressRef: { current: number };
  portrait?: boolean;
}

export default function PixelSky({ progressRef, portrait = false }: PixelSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = portrait ? 180 : 320;
  const H = portrait ? 320 : 180;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const HORIZON = H - GROUND;
    // Scene layout scales with the canvas: x positions with width, sky heights with the horizon
    const sx = W / 320;
    const sy = HORIZON / 144;
    const flowerX = Array.from({ length: Math.round(14 * sx) }, (_, i) => Math.round(10 + i * 23.5 + hash(i + 40) * 3));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skyCache = new Map<number, HTMLCanvasElement>();
    const sparkles: Sparkle[] = Array.from({ length: portrait ? 36 : 42 }, (_, i) => ({
      x: hash(i + 1) * W,
      y: hash(i + 101) * H,
      speed: 0.004 + hash(i + 201) * 0.01,
      phase: hash(i + 301) * Math.PI * 2,
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
    }));

    const px = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    };

    const star = (x: number, y: number, color: string, big: boolean) => {
      px(x, y, color);
      if (big) {
        px(x - 1, y, color); px(x + 1, y, color);
        px(x, y - 1, color); px(x, y + 1, color);
      }
    };

    const rect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    };

    // ── Distant skyline: places that matter, hazy in the golden-hour light ──
    const liberty = (cx: number, b: number, t: number) => {
      const green = '#86C2B0';
      const deep = '#6BA894';
      // Pedestal
      rect(cx - 5, b - 8, 11, 8, '#CDA9BA');
      rect(cx - 4, b - 10, 9, 2, '#D9B9C8');
      // Robe, widening to the base
      for (let y = 0; y < 11; y++) {
        const half = 1 + Math.floor(y / 4);
        rect(cx - half, b - 21 + y, half * 2 + 1, 1, y % 3 === 0 ? deep : green);
      }
      // Head and crown
      rect(cx - 1, b - 24, 3, 3, green);
      px(cx - 2, b - 25, green); px(cx, b - 26, green); px(cx + 2, b - 25, green);
      // Raised arm and glowing torch
      rect(cx + 2, b - 27, 1, 7, green);
      const flicker = 0.75 + Math.sin(t * 0.008) * 0.25;
      ctx.globalAlpha = flicker;
      rect(cx + 1, b - 30, 3, 2, '#FFD27A');
      px(cx + 2, b - 31, '#FFF1B8');
      ctx.globalAlpha = 1;
    };

    // City blocks share one hazy lilac palette with scattered lit windows
    const FAR = '#B7A6CF';
    const NEAR = '#A493C2';
    const windows = (x: number, y: number, w: number, b: number, seed: number) => {
      for (let wy = y + 2; wy < b - 1; wy += 3) {
        for (let wx = x + 1; wx < x + w - 1; wx += 2) {
          if (hash(wx * 7 + wy * 13 + seed) > 0.72) px(wx, wy, 'rgba(255,224,138,0.85)');
        }
      }
    };

    // Downtown Toronto: the Rogers Centre dome and a few towers around the CN Tower
    const toronto = (x0: number, b: number) => {
      const tower = (x: number, w: number, h: number, color: string, seed: number) => {
        rect(x0 + x, b - h, w, h, color);
        windows(x0 + x, b - h, w, b, seed);
      };
      tower(-14, 6, 15, FAR, 21);
      tower(9, 6, 24, FAR, 22);
      tower(16, 5, 18, FAR, 23);
      tower(22, 7, 13, FAR, 24);
      tower(-7, 5, 10, NEAR, 25);
      tower(12, 6, 11, NEAR, 26);
      // Rogers Centre: a low dome beside the tower's base
      for (let x = -6; x <= 6; x++) {
        const h = Math.round(Math.sqrt(36 - x * x) * 0.8);
        rect(x0 - 3 + x, b - h, 1, h, '#C9B8DD');
      }
    };

    // Manhattan: a few towers, the Empire State and the Chrysler, with lit windows
    const manhattan = (x0: number, b: number) => {
      const far = FAR;
      const near = NEAR;
      const tower = (x: number, w: number, h: number, color: string, seed: number) => {
        rect(x0 + x, b - h, w, h, color);
        windows(x0 + x, b - h, w, b, seed);
      };
      // Back row
      tower(0, 6, 16, far, 1);
      tower(9, 5, 22, far, 2);
      tower(30, 6, 19, far, 3);
      tower(44, 7, 14, far, 4);
      // Empire State: stepped setbacks and a spire
      const ex = x0 + 16;
      rect(ex, b - 24, 9, 24, near);
      rect(ex + 1, b - 30, 7, 6, near);
      rect(ex + 2, b - 34, 5, 4, near);
      rect(ex + 3, b - 37, 3, 3, near);
      rect(ex + 4, b - 43, 1, 6, near);
      windows(ex, b - 24, 9, b, 5);
      // Chrysler: tall shaft with a stepped crown and needle
      const cx = x0 + 37;
      rect(cx, b - 26, 5, 26, near);
      rect(cx + 1, b - 29, 3, 3, '#C9B8DD');
      px(cx + 2, b - 30, '#C9B8DD');
      rect(cx + 2, b - 35, 1, 5, near);
      windows(cx, b - 26, 5, b, 6);
      // Front row
      tower(5, 7, 12, near, 7);
      tower(26, 6, 10, near, 8);
      tower(48, 6, 9, near, 9);
    };

    const cnTower = (cx: number, b: number, t: number) => {
      const body = '#B48CB0';
      const light = '#D4B0CC';
      // Flared base
      for (let y = 0; y < 6; y++) {
        const half = 3 - Math.floor(y / 2);
        rect(cx - half, b - 1 - y, half * 2 + 2, 1, body);
      }
      // Main shaft
      rect(cx, b - 38, 2, 32, body);
      px(cx + 1, b - 30, light); px(cx + 1, b - 20, light);
      // Main pod with lit windows
      rect(cx - 2, b - 41, 6, 1, body);
      rect(cx - 3, b - 40, 8, 3, body);
      rect(cx - 2, b - 37, 6, 1, body);
      for (let x = cx - 2; x <= cx + 3; x += 2) px(x, b - 39, '#FFE08A');
      // Upper shaft, sky pod, antenna
      rect(cx, b - 48, 2, 7, body);
      rect(cx - 1, b - 50, 4, 2, light);
      rect(cx, b - 60, 1, 10, body);
      // Blinking aircraft light
      ctx.globalAlpha = (Math.sin(t * 0.004) + 1) / 2;
      px(cx, b - 61, '#FF6B6B');
      ctx.globalAlpha = 1;
    };

    // Landmark placement keeps them clear of the welcome text on each layout
    // Toronto alone on the left, New York on the right in front of the setting sun
    const skyline = portrait
      ? { cn: 16, manhattan: 118, liberty: 108 }
      : { cn: 16, manhattan: 228, liberty: 216 };

    // A small rainbow peeking in from the top-right corner
    const rainbowArc = portrait
      ? { cx: 196, footY: 58, radius: 52 }
      : { cx: 334, footY: 66, radius: 58 };
    const rainbow = buildRainbow(rainbowArc.radius, 2);

    const disc = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color;
      for (let y = -r; y <= r; y++) {
        const half = Math.floor(Math.sqrt(r * r - y * y));
        ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
      }
    };

    const cloud = (x: number, y: number, s: number) => {
      ctx.fillStyle = '#FFF7F9';
      ctx.fillRect(x + s * 2, y, s * 4, s * 2);
      ctx.fillRect(x + s, y + s * 2, s * 6, s * 2);
      ctx.fillRect(x, y + s * 3, s * 8, s * 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + s * 2, y, s * 2, s);
      ctx.fillStyle = '#F8C6D2';
      ctx.fillRect(x, y + s * 5, s * 8, s);
      ctx.fillStyle = '#FFD9C2';
      ctx.fillRect(x + s, y + s * 6, s * 6, Math.max(1, Math.round(s / 2)));
    };

    const wrap = (base: number, offset: number, margin: number) => {
      const total = W + margin * 2;
      return (((base - offset) % total) + total) % total - margin;
    };

    const butterfly = (x: number, y: number, frame: number, wing: string) => {
      px(x, y, '#6B3A52');
      px(x, y + 1, '#6B3A52');
      if (frame === 0) {
        ctx.fillStyle = wing;
        ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 2, 2);
        ctx.fillRect(Math.round(x) + 1, Math.round(y) - 1, 2, 2);
      } else {
        ctx.fillStyle = wing;
        ctx.fillRect(Math.round(x) - 1, Math.round(y), 1, 2);
        ctx.fillRect(Math.round(x) + 1, Math.round(y), 1, 2);
      }
    };

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const t = reduceMotion ? 0 : now - start;
      const p = progressRef.current;

      // Sky (cached per warmth step)
      const step = Math.round(ramp(p, 0, 100) * WARMTH_STEPS);
      let sky = skyCache.get(step);
      if (!sky) {
        sky = buildSky(W, HORIZON, step / WARMTH_STEPS);
        skyCache.set(step, sky);
      }
      ctx.drawImage(sky, 0, 0);

      ctx.globalAlpha = 0.42 + Math.sin(t * 0.0012) * 0.08;
      ctx.drawImage(rainbow, rainbowArc.cx - rainbowArc.radius, rainbowArc.footY - rainbowArc.radius);
      ctx.globalAlpha = 1;

      // Low golden sun with a pulsing halo and slowly turning rays
      const sunX = Math.round(252 * sx);
      const sunY = HORIZON - 18 + ramp(p, 0, 100) * 6;
      const pulse = (Math.sin(t * 0.0015) + 1) / 2;
      disc(sunX, sunY, 27 + Math.round(pulse * 2), 'rgba(255,236,170,0.18)');
      disc(sunX, sunY, 21 + Math.round(pulse), 'rgba(255,224,150,0.28)');
      disc(sunX, sunY, 17, 'rgba(255,214,140,0.45)');
      const rot = t * 0.00025;
      for (let r = 0; r < 10; r++) {
        const a = rot + (r / 10) * Math.PI * 2;
        for (let d = 19; d <= 25; d += 2) {
          px(sunX + Math.cos(a) * d, sunY + Math.sin(a) * d, 'rgba(255,240,190,0.7)');
        }
      }
      disc(sunX, sunY, 13, '#FFE37A');
      disc(sunX, sunY, 11, '#FFD95C');
      disc(sunX - 3, sunY - 3, 3, '#FFF2B8');

      // Clouds: three parallax layers drifting with time and scroll
      const drift = t * 0.002;
      const scrollShift = (p / 100) * 200;
      cloud(wrap(60 * sx, scrollShift * 0.15 + drift * 0.3, 55), 20 * sy, 2);
      cloud(wrap(210 * sx, scrollShift * 0.15 + drift * 0.3, 55), 9 * sy, 2);
      cloud(wrap(130 * sx, scrollShift * 0.35 + drift * 0.6, 65), 4 * sy, 3);
      cloud(wrap(285 * sx, scrollShift * 0.35 + drift * 0.6, 65), 30 * sy, 2);
      cloud(wrap(40 * sx, scrollShift * 0.7 + drift, 80), 12 * sy, 4);
      cloud(wrap(240 * sx, scrollShift * 0.7 + drift, 80), 2 * sy, 3);

      // Distant skyline in soft, hazy tones so it reads as far away
      const base = HORIZON - 1;
      toronto(skyline.cn, base);
      cnTower(skyline.cn, base, t);
      manhattan(skyline.manhattan, base);
      liberty(skyline.liberty, base, t);

      // Rolling lilac and rose hills on the horizon
      for (let x = 0; x < W; x++) {
        const far = Math.round(5 + Math.sin(x * 0.03 + 1) * 3 + Math.sin(x * 0.081) * 2);
        ctx.fillStyle = '#E7B3CF';
        ctx.fillRect(x, HORIZON - far, 1, far);
        const near = Math.round(2 + Math.sin(x * 0.05 + 4) * 2.5);
        if (near > 0) {
          ctx.fillStyle = '#D9A0C2';
          ctx.fillRect(x, HORIZON - near, 1, near);
        }
      }

      // Meadow with a jagged blade edge and golden rim light
      ctx.fillStyle = '#4F9A4A';
      ctx.fillRect(0, HORIZON, W, H - HORIZON);
      ctx.fillStyle = '#6DB35A';
      ctx.fillRect(0, HORIZON, W, 8);
      ctx.fillStyle = '#8FCB6E';
      ctx.fillRect(0, HORIZON, W, 3);
      for (let x = 0; x < W; x++) {
        const h = Math.floor(hash(x) * 3);
        if (h > 0) {
          ctx.fillStyle = '#9AD47A';
          ctx.fillRect(x, HORIZON - h, 1, h);
        }
        if (hash(x + 500) > 0.86) px(x, HORIZON - h - 1, 'rgba(255,233,160,0.9)');
      }
      ctx.fillStyle = '#448A42';
      for (let x = 0; x < W; x += 7) {
        ctx.fillRect(x + Math.floor(hash(x + 900) * 5), HORIZON + 12 + Math.floor(hash(x + 77) * 18), 2, 1);
      }

      // Swaying flowers
      flowerX.forEach((fx, i) => {
        const sway = Math.round(Math.sin(t * 0.0018 + i * 1.3));
        const fy = HORIZON - 4;
        ctx.fillStyle = '#5DA84F';
        ctx.fillRect(fx, fy + 2, 1, 4);
        const x = fx + sway;
        ctx.fillStyle = FLOWER_COLORS[i % FLOWER_COLORS.length];
        ctx.fillRect(x - 2, fy, 2, 2);
        ctx.fillRect(x + 2, fy, 2, 2);
        ctx.fillRect(x, fy - 2, 2, 2);
        ctx.fillRect(x, fy + 2, 2, 2);
        ctx.fillStyle = '#FFEE88';
        ctx.fillRect(x, fy, 2, 2);
      });

      // Butterflies on lazy sine paths
      const frame = Math.floor(t / 180) % 2;
      const b1x = wrap(40, -t * 0.008, 10);
      butterfly(b1x, HORIZON - 32 + Math.sin(t * 0.0021) * 9, frame, '#FF8FB1');
      const b2x = wrap(200 * sx, -t * 0.006, 10);
      butterfly(b2x, HORIZON - 46 + Math.sin(t * 0.0017 + 2) * 12, 1 - frame, '#C2A6F5');

      // Rising, twinkling sparkles
      sparkles.forEach(s => {
        const y = ((((s.y - t * s.speed) % (H + 10)) + H + 10) % (H + 10)) - 5;
        const x = s.x + Math.sin(t * 0.001 + s.phase) * 2;
        const tw = (Math.sin(t * 0.003 + s.phase) + 1) / 2;
        if (tw < 0.25) return;
        ctx.globalAlpha = tw;
        star(x, y, s.color, tw > 0.85);
        ctx.globalAlpha = 1;
      });

      // Sparkle trail sweeping across as the gallery hands off to the terminal
      const trail = portrait ? 0 : ramp(p, 52, 82);
      if (trail > 0 && trail < 1) {
        for (let k = 0; k < 28; k++) {
          const tk = trail - k * 0.011;
          if (tk < 0) break;
          const x = -20 + tk * (W + 40);
          const y = HORIZON * 0.54 - Math.sin(tk * Math.PI) * 26 + Math.sin(k * 1.7 + t * 0.01) * 2;
          ctx.globalAlpha = 1 - k / 28;
          star(x, y, SPARKLE_COLORS[k % SPARKLE_COLORS.length], k < 3 || k % 5 === 0);
        }
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, portrait, W, H]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: portrait ? '100lvh' : '100vh',
        zIndex: 1,
        imageRendering: 'pixelated',
      }}
    />
  );
}
