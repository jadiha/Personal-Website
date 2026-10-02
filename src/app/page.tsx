'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PixelSky from '@/components/PixelSky';
import WelcomePhoto from '@/components/WelcomePhoto';
import RotatingWords from '@/components/RotatingWords';
import PixelCat from '@/components/PixelCat';
import PixelMe from '@/components/PixelMe';
import MoreBelow from '@/components/MoreBelow';
import { TerminalTitleBar, Prompt, SparkleBurst } from '@/components/TerminalParts';
import { ABOUT, EXPERIENCE, IDENTITIES, TAGLINE } from '@/content/profile';

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

const COMMANDS = [
  'help',
  'about',
  'experience',
  'skills',
  'projects',
  'education',
  'contact',
  'clear',
  'download',
  'socials',
  'gallery',
  'pet',
  'meow'
];

const ASCII_ART = `
     ██╗ █████╗ ██████╗ ██╗██╗  ██╗ █████╗
     ██║██╔══██╗██╔══██╗██║██║  ██║██╔══██╗
     ██║███████║██║  ██║██║███████║███████║
██   ██║██╔══██║██║  ██║██║██╔══██║██╔══██║
╚█████╔╝██║  ██║██████╔╝██║██║  ██║██║  ██║
 ╚════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
`;

const GALLERY_IMAGES = [
  { src: 'OrientationWeek.jpeg', title: 'Orientation Week Leaders 2025' },
  { src: 'Ambassadors.jpeg', title: 'Engineering Ambassadors 2024' },
  { src: 'HackTheNorth.jpg', title: 'Hack The North 2022' },
  { src: 'DSC03005.jpg', title: 'Acapella 2023' },
  { src: 'OrientationSpirit.jpg', title: 'Black and Gold Day 2022' },
  { src: 'DSC00227.JPG', title: 'Women in Engineering Kick Off 2024' },
  { src: 'Volleyball.jpg', title: 'Wealthsimple Beach Volleyball 2025' },
  { src: 'IMG-20240715-WA0005.jpg', title: 'Engineering Day 2024' }
];


const CHIPS: [string, string][] = [
  ['about', '👋'],
  ['experience', '💼'],
  ['projects', '🚀'],
  ['skills', '💫'],
  ['socials', '📬'],
  ['download', '📄'],
  ['clear', '🧹'],
];

export default function Home() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const [bursts, setBursts] = useState<number[]>([]);
  const welcomeRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);

  // Glide to a point in the scroll timeline (0 = welcome, 100 = terminal)
  const goTo = (progress: number) => {
    window.scrollTo({ top: (progress / 100) * window.innerHeight * 3, behavior: 'smooth' });
  };

  // Scroll-driven scenes. Written straight to the DOM every frame so scrolling never
  // re-renders the page. Timeline over scroll progress 0–100:
  //   0–22   welcome floats up and fades
  //   10–60  photos glide across and settle with the last one centred
  //   56–86  photos lift away while the terminal rises from the meadow in lockstep
  useEffect(() => {
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const ramp = (v: number, start: number, end: number) => clamp((v - start) / (end - start), 0, 1);
    const easeInOut = (v: number) => v * v * (3 - 2 * v);

    let travel = 0;
    const measure = () => {
      const track = galleryTrackRef.current;
      const last = track?.lastElementChild as HTMLElement | null;
      if (!track || !last) return;
      // Track starts one viewport to the right; stop when the last card is centred
      travel = window.innerWidth / 2 + last.offsetLeft + last.offsetWidth / 2;
    };

    let target = 0;
    let current = -1;
    const handleScroll = () => {
      target = (window.scrollY / (window.innerHeight * 3)) * 100;
    };

    const apply = (p: number) => {
      const welcome = welcomeRef.current;
      const gallery = galleryRef.current;
      const track = galleryTrackRef.current;
      const terminal = terminalRef.current;
      if (!welcome || !gallery || !track || !terminal) return;

      const welcomeExit = ramp(p, 0, 22);
      welcome.style.opacity = String(1 - welcomeExit);
      welcome.style.transform = `translateY(${-welcomeExit * 90}px)`;
      welcome.style.visibility = welcomeExit >= 1 ? 'hidden' : 'visible';

      const glide = easeInOut(ramp(p, 10, 60));
      const lift = easeInOut(ramp(p, 56, 86));
      gallery.style.opacity = String(ramp(p, 8, 15));
      gallery.style.transform = `translateY(${-lift * 100}vh)`;
      gallery.style.visibility = p < 8 || lift >= 1 ? 'hidden' : 'visible';
      track.style.transform = `translateX(${-glide * travel}px)`;

      terminal.style.transform = `translateY(${(1 - lift) * 100}vh)`;
      terminal.style.visibility = lift <= 0 ? 'hidden' : 'visible';
      terminal.style.pointerEvents = lift > 0.97 ? 'auto' : 'none';

      // Highlight the section you're in
      const section = p < 12 ? 'home' : p < 70 ? 'photos' : 'terminal';
      navRef.current?.querySelectorAll<HTMLElement>('[data-section]').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
      });
    };

    let raf = 0;
    const animate = () => {
      const diff = target - current;
      if (Math.abs(diff) > 0.01) {
        current = current < 0 ? target : current + diff * 0.12;
        progressRef.current = current;
        apply(current);
      }
      raf = requestAnimationFrame(animate);
    };

    measure();
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    const onResize = () => { measure(); apply(current); };
    window.addEventListener('resize', onResize);
    // Card sizes settle once fonts and images load, so re-measure when the track changes
    const observer = new ResizeObserver(onResize);
    if (galleryTrackRef.current) observer.observe(galleryTrackRef.current);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll the terminal so the newest output starts at the top, ready to read down
  useEffect(() => {
    const terminalContent = terminalContentRef.current;
    const latest = terminalContent?.lastElementChild;
    if (!terminalContent || !latest || history.length < 2) return;
    const offset = latest.getBoundingClientRect().top - terminalContent.getBoundingClientRect().top;
    terminalContent.scrollTo({ top: terminalContent.scrollTop + offset - 4, behavior: 'smooth' });
  }, [history]);

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    let output: React.ReactNode;

    if (cmd) {
      setCommandHistory(prev => [...prev, cmd]);
      setHistoryIndex(-1);
    }

    switch (cmd) {
      case 'help':
        output = (
          <div className="command-output">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              {[
                ['about', '👋 Learn about me'],
                ['experience', '💼 View my work experience'],
                ['skills', '💫 List my technical skills'],
                ['projects', '🚀 View my projects'],
                ['socials', '📬 Contact & social links'],
                ['download', '📄 Download my resume'],
                ['clear', '🧹 Clear the terminal'],
                ['help', '❓ Show commands']
              ].map(([cmd, desc]) => (
                <div key={cmd} className="flex items-center gap-1.5">
                  <span className="text-pink-500 font-medium min-w-[70px] text-xs">{cmd}</span>
                  <span className="text-gray-600 text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="command-output">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-pink-500 font-medium mb-1">Languages</p>
                <p className="text-gray-600">Python, Javascript,TypeScript, C++, Ruby, Java</p>
              </div>
              <div>
                <p className="text-pink-500 font-medium mb-1">Technologies</p>
                <p className="text-gray-600">React.js, Node.js, Next.js, ROS</p>
              </div>
              <div>
                <p className="text-pink-500 font-medium mb-1">Cloud & DevOps</p>
                <p className="text-gray-600">AWS, Git, Docker</p>
              </div>
              <div>
                <p className="text-pink-500 font-medium mb-1">Tools</p>
                <p className="text-gray-600">Postman, CodeceptJS, REST APIs</p>
              </div>
            </div>
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="command-output">
            <div className="space-y-3">
              <p className="text-pink-500 font-medium text-base">👋🏽 Hi there! I&apos;m Jadiha <span className="text-gray-500 font-normal text-sm">(ja-thee-ha)</span></p>
              <p className="text-gray-600">{ABOUT.intro}</p>
              <p className="text-gray-600">{ABOUT.passionsLead}</p>
              <div className="space-y-1">
                {ABOUT.passions.map(item => (
                  <p key={item.label} className="text-gray-600 ml-4">{item.icon} <span className="text-pink-500">{item.label}</span>: {item.text}</p>
                ))}
              </div>
              <p className="text-gray-600"><span className="text-pink-500 font-medium">💼 Where I&apos;ve been:</span> {ABOUT.beenAt}</p>
              <p className="text-pink-500 font-medium">🌿 {ABOUT.seeking}</p>
              <p className="text-gray-600 text-sm">📧 {ABOUT.email}</p>
            </div>
          </div>
        );
        break;

      case 'experience':
        output = (
          <div className="command-output">
            <div className="space-y-4">
              {EXPERIENCE.map(r => (
                <div key={r.org + r.role}>
                  <p className="text-pink-500 font-medium">{r.icon} {r.org} | {r.role}</p>
                  <p className="text-gray-500 text-sm ml-4">{r.when}</p>
                  <p className="text-gray-600 ml-4">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'socials':
        output = (
          <div className="command-output">
            <p className="text-pink-500 font-medium mb-3">📬 Contact & Social Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 font-medium">Email</p>
                <a href="mailto:jadiha.arul@gmail.com" className="text-pink-400 hover:underline">jadiha.arul@gmail.com</a>
              </div>
              <div>
                <p className="text-gray-600 font-medium">LinkedIn</p>
                <a href="https://www.linkedin.com/in/jadiha-aruleswaran/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-pink-400 hover:underline">
                  View Profile
                </a>
              </div>
              <div>
                <p className="text-gray-600 font-medium">GitHub</p>
                <a href="https://github.com/jadiha"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-pink-400 hover:underline">
                  @jadiha
                </a>
              </div>
            </div>
          </div>
        );
        break;

      case 'download':
        output = (
          <div className="command-output resume-download">
            <p className="text-gray-600">Click the button below to download my resume:</p>
            <a href="/resume.pdf" download="Jadiha_Aruleswaran_Resume.pdf" className="resume-button">
              📄 Download Resume (PDF)
            </a>
            <p className="text-gray-500 text-sm">If the download doesn&apos;t start automatically, right-click the button and select &quot;Save as&quot;.</p>
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="mb-2 command-output">
            <div className="space-y-3">
              <div>
                <p className="text-pink-500 font-medium">🌿 Letters To Myself <span className="text-gray-400 font-normal text-xs">HTML</span></p>
                <p className="text-gray-600 ml-4">A quiet little web app for writing daily gratitude letters to yourself.</p>
              </div>
              <div>
                <p className="text-pink-500 font-medium">🧠 Mindscape <span className="text-gray-400 font-normal text-xs">TypeScript</span></p>
                <p className="text-gray-600 ml-4">Context-aware meditation app that recommends sessions based on how you feel, time of day, your calendar, and meditations you enjoy.</p>
              </div>
              <div>
                <p className="text-pink-500 font-medium">🎓 Scholarship Finder Bot <span className="text-gray-400 font-normal text-xs">Python</span></p>
                <p className="text-gray-600 ml-4">A free, self-hosted tool that finds scholarships for you and delivers them to Discord daily.</p>
              </div>
              <div>
                <p className="text-pink-500 font-medium">💻 Personal Website <span className="text-gray-400 font-normal text-xs">TypeScript</span></p>
                <p className="text-gray-600 ml-4">A sneak peek into Jadiha&apos;s world — the one you&apos;re in right now :)</p>
              </div>
            </div>
            <hr style={{ borderColor: 'var(--border)', marginTop: '1.5rem', marginBottom: '1rem' }} />
            <p className="text-gray-500">More on my <a href="https://github.com/jadiha" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">GitHub</a>!</p>
          </div>
        );
        break;

      case 'gallery':
        output = (
          <div className="mb-2 command-output">
            <p className="mb-2 sparkle">✨ Opening Photo Gallery ✨</p>
            <p className="ml-4">
              <a
                href="/gallery"
                className="text-pink-500 hover:underline"
                target="_self"
              >
                Click here to view the gallery
              </a>
            </p>
          </div>
        );
        break;

      case 'pet':
      case 'cat':
      case 'meow':
        window.dispatchEvent(new Event('pet-cat'));
        output = (
          <div className="command-output">
            <p className="text-gray-600">🐈‍⬛ The cat on top of the terminal purrs happily. Click it anytime for more pets!</p>
          </div>
        );
        break;

      case 'clear':
        setHistory(prev => prev.slice(0, 1));
        return;

      default:
        output = (
          <div className="text-pink-400 command-output bounce-hover">
            Command not found. Type &apos;help&apos; for available commands!
            <span className="ml-2 rainbow-text">🌸</span>
          </div>
        );
    }

    setHistory(prev => [...prev, { command, output }]);
  };

  // Run a command with a little puff of sparkles from the input
  const runCommand = (command: string) => {
    handleCommand(command);
    const id = Date.now() + Math.random();
    setBursts(prev => [...prev, id]);
    setTimeout(() => setBursts(prev => prev.filter(b => b !== id)), 1300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matchingCommands = COMMANDS.filter(cmd => cmd.startsWith(input.toLowerCase()));
      if (matchingCommands.length === 1) {
        setInput(matchingCommands[0]);
      }
    } else if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    }
  };

  useEffect(() => {
    handleCommand('help');
  }, []);


  return (
    <main className="relative">
      {/* Golden-hour pixel world */}
      <PixelSky progressRef={progressRef} />

      {/* Welcome Section */}
      <section
        ref={welcomeRef}
        className="welcome-section min-h-screen flex items-center justify-center fixed top-0 left-0 w-full z-[40]"
      >
        <div className="welcome-layout">
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <WelcomePhoto width={260} />
          </motion.div>
          <div className="welcome-copy">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="welcome-name"
            >
              Jadiha<br />Aruleswaran
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="welcome-identity"
            >
              I&apos;m a <RotatingWords words={IDENTITIES} />
            </motion.p>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="welcome-tagline"
            >
              {TAGLINE}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="welcome-hint"
            >
              scroll to begin the journey ↓
            </motion.p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section
        ref={galleryRef}
        className="gallery-section"
        style={{ opacity: 0, visibility: 'hidden' }}
      >
        <div className="gallery-container">
          <div
            ref={galleryTrackRef}
            className="gallery-track"
          >
            {GALLERY_IMAGES.map((image, index) => (
              <div
                key={index}
                className="polaroid-float"
                style={{ animationDelay: `${-index * 0.7}s` }}
              >
                <figure
                  className="gallery-item polaroid"
                  style={{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }}
                >
                  <div className="polaroid-photo">
                    <Image
                      src={`/gallery/${image.src}`}
                      alt={image.title}
                      width={500}
                      height={360}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="polaroid-caption">{image.title}</figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Header: jump between scenes */}
      <nav ref={navRef} className="site-nav" aria-label="Sections">
        <button type="button" className="site-nav-home" data-section="home" onClick={() => goTo(0)}>✿ jadiha</button>
        <button type="button" data-section="photos" onClick={() => goTo(32)}>photos</button>
        <button type="button" data-section="terminal" onClick={() => goTo(100)}>terminal</button>
      </nav>

      {/* Terminal Section */}
      <section
        ref={terminalRef}
        className="terminal-section min-h-screen z-[50] flex items-center justify-center"
        style={{
          transform: 'translateY(100vh)',
          visibility: 'hidden',
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="terminal-wrap">
          <div className="terminal-buddies">
            <PixelMe />
            <PixelCat />
          </div>
          <div className="terminal-window">
            <TerminalTitleBar />
            <div className="text-center">
              <pre className="ascii-art">
                {ASCII_ART}
              </pre>
              <p className="terminal-subtitle">
                type a command or tap a spell below ✿
              </p>
            </div>

            <div className="content-container" ref={contentContainerRef}>
              <div className="terminal-scroll">
              <div className="terminal-content" ref={terminalContentRef}>
                {history.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="terminal-prompt text-sm">
                      <Prompt />
                      <span className="ml-2 text-gray-700">{item.command}</span>
                    </div>
                    <div className="mt-1">
                      {item.output}
                    </div>
                  </div>
                ))}
              </div>
              <MoreBelow scrollRef={terminalContentRef} />
              </div>

              <div className="command-chips">
                {CHIPS.map(([cmd, icon]) => (
                  <button key={cmd} type="button" className="command-chip" onClick={() => runCommand(cmd)}>
                    <span aria-hidden="true">{icon}</span> {cmd}
                  </button>
                ))}
              </div>

              <div className="terminal-input">
                <div className="terminal-prompt text-sm">
                  <Prompt />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="ml-2 bg-transparent outline-none flex-1 text-sm"
                    autoFocus
                    placeholder="Type a command..."
                    aria-label="Terminal command"
                  />
                </div>
                {bursts.map(id => <SparkleBurst key={id} />)}
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Spacer to control scroll range */}
      <div style={{ height: '400vh' }} />
    </main>
  );
}
