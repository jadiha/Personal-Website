'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import PixelSky from '@/components/PixelSky';
import WelcomePhoto from '@/components/WelcomePhoto';
import Reveal from '@/components/Reveal';
import RotatingWords from '@/components/RotatingWords';
import PixelCat from '@/components/PixelCat';
import { TerminalTitleBar, Prompt, SparkleBurst } from '@/components/TerminalParts';
import { ABOUT, EXPERIENCE, IDENTITIES, TAGLINE } from '@/content/profile';

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

const GALLERY_IMAGES = [
  { src: 'OrientationWeek.jpeg', title: 'Orientation Week Leaders 2025' },
  { src: 'Ambassadors.jpeg',     title: 'Engineering Ambassadors 2024' },
  { src: 'HackTheNorth.jpg',     title: 'Hack The North 2022' },
  { src: 'DSC03005.jpg',         title: 'Acapella 2023' },
  { src: 'OrientationSpirit.jpg',title: 'Black and Gold Day 2022' },
  { src: 'DSC00227.JPG',         title: 'Women in Engineering Kick Off 2024' },
  { src: 'Volleyball.jpg',       title: 'Wealthsimple Beach Volleyball 2025' },
  { src: 'IMG-20240715-WA0005.jpg', title: 'Engineering Day 2024' },
];

export default function MobilePage() {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showKeepScrolling, setShowKeepScrolling] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const progressRef = useRef(0);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const [bursts, setBursts] = useState<number[]>([]);

  // Native scrolling stays in charge. Each frame we just read it to warm the sky
  // and let the welcome drift up and fade as it leaves.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const y = window.scrollY;
      if (y !== last) {
        last = y;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current = max > 0 ? (y / max) * 100 : 0;
        const welcome = welcomeRef.current;
        if (welcome) {
          const exit = Math.min(1, y / (window.innerHeight * 0.75));
          welcome.style.opacity = String(1 - exit);
          welcome.style.transform = `translateY(${-y * 0.35}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Scroll within terminal to show top of new output — never scrolls the page
  useEffect(() => {
    if (history.length > 1 && lastItemRef.current && terminalContentRef.current) {
      const container = terminalContentRef.current;
      const item = lastItemRef.current;
      const offset = item.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTo({ top: container.scrollTop + offset - 4, behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    let output: React.ReactNode;

    switch (cmd) {
      case 'help':
        output = (
          <div className="command-output">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>tap any button below to explore ✿</p>
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="command-output">
            <div className="space-y-2">
              <p className="text-pink-500 font-medium">👋🏽 Hi! I&apos;m Jadiha <span className="text-gray-500 font-normal text-xs">(ja-thee-ha)</span></p>
              <p className="text-gray-600 text-xs">{ABOUT.intro}</p>
              <p className="text-gray-600 text-xs">{ABOUT.passionsLead}</p>
              <div className="space-y-1">
                {ABOUT.passions.map(item => (
                  <p key={item.label} className="text-gray-600 text-xs ml-3">{item.icon} <span className="text-pink-500">{item.label}</span>: {item.text}</p>
                ))}
              </div>
              <p className="text-gray-600 text-xs"><span className="text-pink-500 font-medium">💼 Where I&apos;ve been:</span> {ABOUT.beenAt}</p>
              <p className="text-pink-500 font-medium text-xs">🌿 {ABOUT.seeking}</p>
              <p className="text-gray-500 text-xs">📧 {ABOUT.email}</p>
            </div>
          </div>
        );
        break;

      case 'experience':
        output = (
          <div className="command-output">
            <div className="space-y-3">
              {EXPERIENCE.map(job => (
                <div key={job.org + job.role}>
                  <p className="text-pink-500 font-medium text-xs">{job.icon} {job.org} | {job.role}</p>
                  <p className="text-gray-500 text-xs ml-3">{job.when}</p>
                  <p className="text-gray-600 text-xs ml-3">{job.body}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="command-output">
            <div className="space-y-2">
              {[
                ['Languages', 'Python, JS, TypeScript, C++, Ruby, Java'],
                ['Technologies', 'React.js, Node.js, Next.js, ROS'],
                ['Cloud & DevOps', 'AWS, Git, Docker'],
                ['Tools', 'Postman, CodeceptJS, REST APIs'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-pink-500 font-medium text-xs">{label}</p>
                  <p className="text-gray-600 text-xs ml-3">{val}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="command-output">
            <div className="space-y-2">
              {[
                { icon: '🌿', name: 'Letters To Myself', lang: 'HTML', desc: 'Daily gratitude letters to yourself.' },
                { icon: '🧠', name: 'Mindscape', lang: 'TypeScript', desc: 'Context-aware meditation app.' },
                { icon: '🎓', name: 'Scholarship Finder Bot', lang: 'Python', desc: 'Finds scholarships, delivers to Discord daily.' },
                { icon: '💻', name: 'Personal Website', lang: 'TypeScript', desc: 'The one you\'re on right now :)' },
              ].map((p) => (
                <div key={p.name}>
                  <p className="text-pink-500 font-medium text-xs">{p.icon} {p.name} <span className="text-gray-400 font-normal">{p.lang}</span></p>
                  <p className="text-gray-600 text-xs ml-3">{p.desc}</p>
                </div>
              ))}
            </div>
            <hr style={{ borderColor: 'var(--border)', marginTop: '1rem', marginBottom: '0.75rem' }} />
            <p className="text-gray-500 text-xs">More on <a href="https://github.com/jadiha" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">GitHub</a>!</p>
          </div>
        );
        break;

      case 'socials':
        output = (
          <div className="command-output">
            <p className="text-pink-500 font-medium text-xs mb-2">📬 Find me here</p>
            <div className="space-y-2">
              <div><p className="text-gray-600 text-xs">Email</p><a href="mailto:jadiha.arul@gmail.com" className="text-pink-400 text-xs hover:underline">jadiha.arul@gmail.com</a></div>
              <div><p className="text-gray-600 text-xs">LinkedIn</p><a href="https://www.linkedin.com/in/jadiha-aruleswaran/" target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline">jadiha-aruleswaran</a></div>
              <div><p className="text-gray-600 text-xs">GitHub</p><a href="https://github.com/jadiha" target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline">@jadiha</a></div>
            </div>
          </div>
        );
        break;

      case 'download':
        output = (
          <div className="command-output resume-download">
            <p className="text-gray-600 text-xs">Tap below to download my resume:</p>
            <a href="/resume.pdf" download="Jadiha_Aruleswaran_Resume.pdf" className="resume-button text-xs">
              📄 Download Resume (PDF)
            </a>
            <p className="text-gray-500 text-xs">If it opens instead of downloading, use your browser&apos;s share or save option.</p>
          </div>
        );
        break;

      case 'clear':
        setHistory(prev => prev.slice(0, 1));
        return;

      default:
        output = (
          <div className="text-pink-400 command-output">
            Unknown command 🌸
          </div>
        );
    }

    setHistory(prev => [...prev, { command, output }]);
  };

  // Run a command with a little puff of sparkles over the buttons
  const runCommand = (command: string) => {
    handleCommand(command);
    const id = Date.now() + Math.random();
    setBursts(prev => [...prev, id]);
    setTimeout(() => setBursts(prev => prev.filter(b => b !== id)), 1300);
  };

  // Detect landscape orientation
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Show "keep scrolling" only while on terminal section, hide once gallery is fully visible
  useEffect(() => {
    const vh = window.innerHeight;
    const handle = () => {
      const y = window.scrollY;
      setShowKeepScrolling(y > vh * 0.6 && y < vh * 1.8);
    };
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);

  // Auto-run help
  useEffect(() => { handleCommand('help'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Touch swipe for gallery
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setGalleryIndex(i => Math.min(GALLERY_IMAGES.length - 1, i + 1));
      else          setGalleryIndex(i => Math.max(0, i - 1));
    }
  };

  const dot = (active: boolean) => ({
    width: active ? 20 : 8,
    height: 8,
    borderRadius: 4,
    background: active ? 'var(--primary)' : 'rgba(255,179,198,0.4)',
    border: 'none',
    cursor: 'pointer' as const,
    transition: 'all 0.3s ease',
    padding: 0,
  });

  const navBtn = (disabled: boolean) => ({
    background: 'rgba(255,246,243,0.85)',
    border: '2px solid var(--border)',
    borderRadius: 8,
    padding: '0.4rem 1rem',
    cursor: disabled ? 'default' : 'pointer' as const,
    opacity: disabled ? 0.4 : 1,
    fontFamily: 'ui-monospace, monospace',
    fontSize: '0.9rem',
    color: 'var(--text)',
    backdropFilter: 'blur(6px)',
  });

  return (
    <main style={{ position: 'relative' }}>
      {/* Golden-hour pixel world */}
      <PixelSky progressRef={progressRef} portrait />

      {/* ── Section 1: Welcome ───────────────────────────────────── */}
      <section style={{
        height: '100dvh',
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        position: 'relative', zIndex: 10,
        textAlign: 'center', padding: '9svh 1.5rem 2rem',
        overflow: 'hidden',
      }}>
        <div ref={welcomeRef} style={{ willChange: 'transform, opacity' }}>
        {/* Welcome photo */}
        <div style={{ marginBottom: '2rem' }}>
          <WelcomePhoto width={150} />
        </div>

        {/* Name */}
        <h1 style={{
          fontFamily: 'var(--font-press-start)',
          fontSize: '0.95rem',
          lineHeight: 2.2,
          color: '#FFFFFF',
          textShadow: '0 0 10px rgba(255,214,150,0.95), 0 0 25px rgba(255,156,174,0.75), 0 0 60px rgba(255,120,160,0.5)',
          marginBottom: '1rem',
        }}>
          Jadiha<br />Aruleswaran
        </h1>

        {/* Rotating identity + tagline */}
        <p className="welcome-identity" style={{ fontSize: '0.95rem', marginBottom: '0.6rem', minHeight: '1.6em' }}>
          I&apos;m a <RotatingWords words={IDENTITIES} />
        </p>
        <p className="welcome-tagline" style={{ fontSize: '0.75rem', margin: '0 auto 1rem', textAlign: 'center' }}>
          {TAGLINE}
        </p>
        <p className="welcome-hint" style={{ fontSize: '0.75rem', textAlign: 'center' }}>
          scroll to begin the journey ↓
        </p>

        </div>

      </section>

      {/* ── Section 2: Terminal ──────────────────────────────────── */}
      <section style={{
        minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        position: 'relative', zIndex: 10,
        padding: '0.75rem',
        paddingTop: '8svh',
      }}>
        <Reveal style={{ width: '100%' }}>
        <div className="terminal-wrap">
        <PixelCat />
        <div className="terminal-window" style={{ width: '100%', maxWidth: '100%', height: '90svh', padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TerminalTitleBar />

          {/* Name header */}
          <div style={{ textAlign: 'center', marginBottom: '0.75rem', flexShrink: 0 }}>
            <p className="ascii-art" style={{
              fontFamily: 'var(--font-press-start)',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              lineHeight: 2,
            }}>
              JADIHA
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
              tap a spell below ✿
            </p>
          </div>

          {/* Output area */}
          <div
            ref={terminalContentRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              fontFamily: "'SF Mono', Menlo, monospace",
              fontSize: '0.85rem',
              lineHeight: 1.5,
              paddingBottom: '0.5rem',
            }}
          >

            {history.map((item, index) => (
              <div key={index} ref={index === history.length - 1 ? lastItemRef : null} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <Prompt />
                  <span style={{ color: 'var(--text)', marginLeft: '0.35rem' }}>{item.command}</span>
                </div>
                <div>{item.output}</div>
              </div>
            ))}
          </div>

          {/* Command buttons */}
          <div style={{
            flexShrink: 0,
            position: 'relative',
            borderTop: '1px solid rgba(255,179,198,0.6)',
            paddingTop: '0.6rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.35rem',
          }}>
            {[
              { cmd: 'about',      emoji: '👋' },
              { cmd: 'experience', emoji: '💼' },
              { cmd: 'skills',     emoji: '💫' },
              { cmd: 'projects',   emoji: '🚀' },
              { cmd: 'socials',    emoji: '📬' },
              { cmd: 'download',   emoji: '📄' },
              { cmd: 'help',       emoji: '❓' },
              { cmd: 'clear',      emoji: '🧹' },
            ].map(({ cmd, emoji }) => (
              <button
                key={cmd}
                onClick={() => runCommand(cmd)}
                className="command-chip"
                style={{
                  borderRadius: 12,
                  padding: '0.35rem 0.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                }}
              >
                <span style={{ fontSize: '0.6rem', lineHeight: 1 }}>{emoji}</span>
                <span style={{ fontSize: '0.42rem', color: 'var(--text-muted)', fontFamily: 'var(--font-press-start)', lineHeight: 1 }}>{cmd}</span>
              </button>
            ))}
            {bursts.map(id => <SparkleBurst key={id} />)}
          </div>
        </div>
        </div>

        </Reveal>

        {/* Keep scrolling hint */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'center',
          fontFamily: 'var(--font-press-start)',
          fontSize: '0.45rem',
          color: '#FFFFFF',
          letterSpacing: '0.08em',
          textShadow: '0 0 8px rgba(255,214,150,0.95), 0 0 20px rgba(255,179,198,0.6)',
          opacity: showKeepScrolling ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}>
          keep scrolling ↓
        </div>
      </section>

      {/* ── Section 3: Gallery ───────────────────────────────────── */}
      <section style={{
        minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10,
        padding: '2rem 0',
      }}>
        <Reveal style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-press-start)',
          fontSize: '0.55rem',
          color: '#FFFFFF',
          textShadow: '0 0 10px rgba(255,214,150,0.95), 0 0 20px rgba(255,179,198,0.7)',
          marginBottom: '1.5rem',
          letterSpacing: '0.1em',
        }}>
          memories ✿
        </h2>

        {/* Carousel */}
        <div
          style={{ width: '100%', overflow: 'hidden', position: 'relative' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div style={{
            display: 'flex',
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            transform: `translateX(-${galleryIndex * 100}%)`,
          }}>
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} style={{ flex: '0 0 100%', padding: '1rem 1.75rem' }}>
                <div className="polaroid-float" style={{ animationDelay: `${-i * 0.7}s` }}>
                <div style={{
                  padding: '10px 10px 0',
                  borderRadius: 4,
                  background: '#FFFAF2',
                  transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                  boxShadow: '0 16px 34px rgba(220,120,150,0.3), 0 0 0 1px rgba(255,214,180,0.6)',
                }}>
                  <Image
                    src={`/gallery/${img.src}`}
                    alt={img.title}
                    width={400} height={260}
                    style={{ width: '100%', height: 230, objectFit: 'cover', display: 'block', borderRadius: 2 }}
                  />
                  <p style={{
                    fontFamily: 'var(--font-press-start)',
                    fontSize: '0.42rem',
                    color: 'var(--text-muted)',
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    letterSpacing: '0.05em',
                    lineHeight: 1.8,
                  }}>
                    {img.title}
                  </p>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.25rem' }}>
          {GALLERY_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setGalleryIndex(i)} style={dot(i === galleryIndex)} />
          ))}
        </div>

        {/* Prev / count / Next */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <button onClick={() => setGalleryIndex(i => Math.max(0, i-1))} disabled={galleryIndex === 0} style={navBtn(galleryIndex === 0)}>←</button>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {galleryIndex + 1} / {GALLERY_IMAGES.length}
          </span>
          <button onClick={() => setGalleryIndex(i => Math.min(GALLERY_IMAGES.length-1, i+1))} disabled={galleryIndex === GALLERY_IMAGES.length-1} style={navBtn(galleryIndex === GALLERY_IMAGES.length-1)}>→</button>
        </div>
        </Reveal>
      </section>

      {/* Landscape overlay */}
      {isLandscape && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(180deg, #C8B4E6, #F2B9CF, #FFD6B0, #FFE6B5)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <span style={{ fontSize: '3rem' }}>🔄</span>
          <p style={{
            fontFamily: 'var(--font-press-start)',
            fontSize: '0.6rem',
            color: '#FFFFFF',
            lineHeight: 2.2,
            textShadow: '0 0 10px rgba(255,179,198,0.9)',
          }}>
            please rotate<br />your device
          </p>
          <p style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.8)',
          }}>
            this site is best viewed vertically ✿
          </p>
        </div>
      )}

      <style>{`
        html { background: #4F9A4A !important; }
        body { background: transparent !important; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(20deg); }
          75%       { transform: rotate(-5deg); }
        }
      `}</style>
    </main>
  );
}
