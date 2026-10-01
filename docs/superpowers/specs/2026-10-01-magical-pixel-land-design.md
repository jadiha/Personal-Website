# Magical Pixel Land: Design Spec

**Date:** 2026-10-01
**Scope:** Desktop home page and mobile `/m` page.
**Goal:** Make the site feel magical and flowing instead of choppy, and update the About and Experience content.

## 1. Visual direction: golden-hour dreamland

Keep the pixel-art identity, but soften it into an enchanted golden hour.

### Sky (canvas)
- Replace the 4 hard color bands with a smooth vertical gradient, drawn as pixel rows with ordered (Bayer) dithering so it still reads as pixel art. Top to bottom: lilac `#C9B6E4`, rose `#F7B8C8`, peach `#FFD3B0`, warm gold `#FFE7B3` at the horizon.
- The palette warms slightly as scroll progress increases (the horizon gets more gold and rose), so the journey ends in a deeper sunset glow.

### Sun
- A low sun just above the horizon on the right. Soft pixel halo rings that pulse slowly, and rays that rotate slowly.

### Clouds
- Same chunky shape and the same 3 parallax layers. Tinted white-pink with a peach underside in place of the blue-grey.

### Living details (animated even when not scrolling)
- **Sparkles:** about 40 tiny 1–2px pixel sparkles that drift upward and twinkle (fade in and out), in white, gold and pink.
- **Flowers:** sway 1px left and right on staggered timers.
- **Grass:** a jagged pixel blade edge along the horizon in place of the flat stripes.
- **Butterflies:** 2 small pixel butterflies flying a lazy sine path with a two-frame wing flap.

### Rendering
- The canvas runs its own `requestAnimationFrame` loop, reading scroll progress from a ref so it doesn't re-render on every frame.
- Internal resolution stays at 320×180, upscaled with `image-rendering: pixelated`.
- `prefers-reduced-motion`: draw a single static frame (no sparkles moving, no sway).

## 2. Flow: one continuous scene

Approach A (chosen): the world stays fixed like a camera moving through one place, and the scenes overlap instead of handing off with gaps.

| Scroll % | What happens |
|---|---|
| 0–22 | Welcome (polaroid photo, glowing name, "scroll down to begin the journey") floats up while fading out. |
| 8–60 | Gallery fades in while the welcome is still leaving; photos glide across with ease-in-out and settle with the last one centred. |
| 52–82 | A sparkle trail sweeps across the sky. |
| 56–86 | Photos lift up out of view while the terminal rises from the meadow in lockstep, one viewport apart, like a camera tilting down. Nothing fades in place. |

- Scroll-driven styles are written straight to the DOM in one animation loop (no React re-render per frame), and the old global `section { transition: all 0.6s }` is removed so CSS doesn't fight the JS smoothing.

- Photos become polaroid cards: a cream frame with a thicker bottom edge, the caption printed on the frame in Press Start 2P (always visible, not hover-only), and a slight alternating tilt (±2°). Each card bobs gently on its own phase (CSS keyframes with staggered `animation-delay`).
- Terminal: the fast rainbow border animation becomes a slow golden-pink glow (soft pulsing `box-shadow`). The window keeps its glassy blur.
- The welcome heading glow is retuned to warm gold and pink.

## 3. Content updates

### About (rewritten)

> 👋🏽 Hi there! I'm Jadiha (ja-thee-ha)
>
> I'm a social impact builder and a Systems Design Engineering student at the University of Waterloo. I build software, products and design for the people who need it and deserve it. I care about a lot of things, and I take the steps to act on them.
>
> - 🌸 **Women's health:** founding Attune Labs, building the intelligence layer for women's health
> - 🧠 **Neurotech:** exploring how technology can better understand the mind
> - 🗳️ **Local politics:** involved with the NDP youth community, working to be the youth voice that moves policy forward
> - 🤝 **Community:** co-organized Women Who Build, bringing early-career women in tech together and donating to charity
>
> 💼 Where I've been: Gale · Wealthsimple · Attune Labs · Amazon Web Services · Real Life Robotics
>
> 🌿 For Summer 2027, I'm looking for software, product or design roles at teams building for good, work I genuinely align with.
>
> 📧 jadiha.arul@gmail.com

### Experience (newest first)

1. **✨ Gale**, Design Engineer · *Sep 2026 – present*
   Designing and building internal tools, right where design and engineering meet.
2. **🌱 Attune Labs**, Founder · *Aug 2026 – present*
   Building the intelligence layer for women's health. Won the **D.S. Rajczak Enterprise Co-op Award in Engineering** (Conrad School of Entrepreneurship and Business, Sep 2026), receiving funding through a competitive pitch to a panel of Waterloo Engineering judges.
3. **💳 Wealthsimple**, Credit Card team · *Jan – Apr 2026*
   Helped launch the [Visa Infinite+](https://www.wealthsimple.com/en-ca/credit-card) and no-fee [Visa Infinite 1%](https://help.wealthsimple.com/hc/en-ca/articles/51274223026203-Understand-premium-benefits-for-the-Visa-Infinite-1-credit-card-beta) cards: eligibility gates, card rendering, mobile readiness and launch-risk tracking across a 200K+ rollout. Got credit score insights onto the roadmap and prototyped 3 AI mobile concepts.
4. **📈 Wealthsimple**, Margins team · *May – Aug 2025*
   Shipped [TFSA-to-margin linking](https://product-news.wealthsimple.com/use-your-tfsa-to-boost-your-margin-power), which lets Canadians boost their buying power while their TFSA keeps growing tax-free. It contributed to $60K in daily revenue.
5. **🧭 UW Blueprint**, Product Manager · *Jan – Apr 2026*
   Collaborated with designers on the first iteration of designs making it easier for schools to connect with local farmers in Mississippi, giving more visibility to small and minority producers.
7. **🤖 Real Life Robotics**, PM & Full Stack Engineer · *Sep – Dec 2024*
   Put real delivery robots in front of real people at the Toronto Zoo. Built the Node.js server linking hardware, telemetry and UI, which cut response latency in half.
8. **☁️ MPAC**, Cloud Infrastructure Analyst · *Jan – Apr 2024*
   Ran cloud infrastructure operations with Python Boto3 and React.
9. **📊 Amazon Web Services**, SDE Intern · *May – Aug 2023*
   Built a cron calendar used by 70,000+ employees, turning 100+ scattered workflows into one clear view.
10. **🏦 Home Trust Company**, QA Automation Analyst · *Jan – Apr 2023*
    Where it all started: automated digital-banking QA with CodeceptJS and Postman, which cut testing time by 40%.

External links open in a new tab (`target="_blank" rel="noopener noreferrer"`).

## 3b. Mobile (`/m`)
- The same golden-hour `PixelSky` in a 180×320 portrait layout.
- Native scrolling (smoothest on phones). The welcome drifts up and fades; the terminal and gallery float in on first view (`Reveal`).
- Gallery cards are polaroids; overscroll and landscape-overlay colours match the new palette.
- About and Experience come from `src/content/profile.tsx`, shared with desktop.

## 3c. Welcome photo
- `public/avatars/welcome.jpg` (Golden Gate photo) in a tilted polaroid with a golden halo and waving hand on both layouts. Falls back to the illustrated avatar if the file is missing.

## 4. Out of scope
- Swapping `public/resume.pdf`.
- The Projects, Skills and Socials commands.

## 5. Verification
- `npm run build` and `npm run lint` pass.
- Run `npm run dev` and screenshot the scroll states at 0%, 20%, 45%, 65% and 85%+. Check there are no empty-sky gaps and the terminal is fully interactive at the end.
- Check with reduced motion turned on.
- Nothing is committed or pushed to `main` (which auto-deploys) without approval.
