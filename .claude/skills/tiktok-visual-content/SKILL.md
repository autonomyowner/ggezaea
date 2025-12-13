---
name: tiktok-visual-content
description: Create visually-rich, scroll-stopping TikTok content with cinematic animations. Multiple formats - quotes, transformations, hooks, lists, stories, and data viz. Optimized for high engagement and binge-watching.
triggers:
  - tiktok visual
  - scroll stopping
  - cinematic
  - viral content
  - attention grabbing
  - engaging video
  - animated content
---

# TikTok Visual Content Skill

You are an expert at creating **scroll-stopping, visually stunning** content for TikTok that holds viewer attention through cinematic animations, dramatic reveals, and polished design.

## Core Philosophy

**Stop the Scroll. Hold the Eyes.**

Every piece of content must:
1. **Hook in 0.5 seconds** - Instant visual impact
2. **Reward watching** - Each second reveals something new
3. **Feel premium** - Cinema-quality motion and design
4. **Create anticipation** - Build to satisfying moments

## Output Format

Generate a **single HTML file** that:
- Opens in any browser for screen recording
- Uses 9:16 vertical aspect ratio (1080x1920)
- Has buttery-smooth 60fps animations
- Requires NO external dependencies (inline everything)
- Auto-plays on load with optional restart on click

## Design Rules

**CRITICAL - Follow these strictly:**
- NEVER use icons, emojis, or icon libraries
- Use ONLY: typography, shapes, lines, gradients, particles, and motion
- Every animation must have proper easing (never linear)
- Layer multiple subtle animations for depth
- Use GPU-accelerated properties (transform, opacity)

---

## Visual Styles Library

### 1. Cinematic Dark

```css
:root {
  --bg-primary: #050505;
  --bg-secondary: #0a0a12;
  --accent: #00f5d4;
  --accent-glow: rgba(0, 245, 212, 0.4);
  --text: #ffffff;
  --text-muted: #666;
}

.container {
  background: radial-gradient(ellipse at 50% 0%, var(--bg-secondary) 0%, var(--bg-primary) 70%);
}
```

### 2. Warm Luxury

```css
:root {
  --bg-primary: #0d0907;
  --bg-secondary: #1a1210;
  --accent: #ffd700;
  --accent-glow: rgba(255, 215, 0, 0.3);
  --text: #fff8e7;
  --text-muted: #8b7355;
}
```

### 3. Electric Blue

```css
:root {
  --bg-primary: #020618;
  --bg-secondary: #0f172a;
  --accent: #3b82f6;
  --accent-glow: rgba(59, 130, 246, 0.4);
  --text: #f8fafc;
  --text-muted: #64748b;
}
```

### 4. Matrix Green

```css
:root {
  --bg-primary: #000800;
  --bg-secondary: #001a00;
  --accent: #00ff41;
  --accent-glow: rgba(0, 255, 65, 0.3);
  --text: #d4ffd4;
  --text-muted: #2d5a2d;
}
```

---

## Animation Techniques

### Particle System (Floating Ambient)

```javascript
class ParticleSystem {
  constructor(container, count = 50) {
    this.container = container;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      position: absolute;
      width: ${2 + Math.random() * 4}px;
      height: ${2 + Math.random() * 4}px;
      background: var(--accent);
      border-radius: 50%;
      opacity: ${0.1 + Math.random() * 0.3};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float-particle ${15 + Math.random() * 20}s linear infinite;
      animation-delay: -${Math.random() * 20}s;
    `;
    this.container.appendChild(p);
  }
}
```

```css
@keyframes float-particle {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}100px, -200px) scale(0); opacity: 0; }
}
```

### Glow Pulse Effect

```css
.glow-text {
  text-shadow:
    0 0 10px var(--accent-glow),
    0 0 20px var(--accent-glow),
    0 0 40px var(--accent-glow),
    0 0 80px var(--accent-glow);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    filter: brightness(1);
    text-shadow:
      0 0 10px var(--accent-glow),
      0 0 20px var(--accent-glow),
      0 0 40px var(--accent-glow);
  }
  50% {
    filter: brightness(1.2);
    text-shadow:
      0 0 20px var(--accent-glow),
      0 0 40px var(--accent-glow),
      0 0 80px var(--accent-glow),
      0 0 120px var(--accent-glow);
  }
}
```

### Kinetic Typography

```javascript
function splitTextToSpans(element) {
  const text = element.textContent;
  element.innerHTML = '';
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.cssText = `
      display: inline-block;
      opacity: 0;
      transform: translateY(40px) rotateX(-90deg);
      animation: char-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: ${i * 0.03}s;
    `;
    element.appendChild(span);
  });
}
```

```css
@keyframes char-reveal {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}
```

### Dramatic Number Counter

```javascript
function animateNumber(element, target, duration = 2000, prefix = '', suffix = '') {
  const start = performance.now();
  const initial = 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Elastic ease out for dramatic effect
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    const current = Math.round(initial + (target - initial) * eased);
    element.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
```

### Morphing Background Blobs

```css
.blob {
  position: absolute;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: morph 15s ease-in-out infinite;
}

@keyframes morph {
  0%, 100% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  25% {
    border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
    transform: translate(50px, -30px) rotate(90deg) scale(1.1);
  }
  50% {
    border-radius: 50% 60% 30% 60% / 70% 40% 70% 30%;
    transform: translate(-30px, 50px) rotate(180deg) scale(0.95);
  }
  75% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: translate(20px, 20px) rotate(270deg) scale(1.05);
  }
}
```

### Reveal Line Animation

```css
.reveal-line {
  position: relative;
  overflow: hidden;
}

.reveal-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  transform: translateX(-100%);
  animation: reveal-wipe 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

@keyframes reveal-wipe {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
```

### 3D Card Flip

```css
.card-3d {
  perspective: 1000px;
}

.card-inner {
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-3d.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Glitch Effect

```css
.glitch {
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-1 0.3s infinite linear alternate-reverse;
  color: #ff00ff;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}

.glitch::after {
  animation: glitch-2 0.3s infinite linear alternate-reverse;
  color: #00ffff;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-3px, 3px); }
  40% { transform: translate(3px, -3px); }
  60% { transform: translate(-3px, -3px); }
  80% { transform: translate(3px, 3px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(3px, -3px); }
  40% { transform: translate(-3px, 3px); }
  60% { transform: translate(3px, 3px); }
  80% { transform: translate(-3px, -3px); }
  100% { transform: translate(0); }
}
```

### Progress Ring

```javascript
function animateProgressRing(element, percent, duration = 1500) {
  const circumference = 2 * Math.PI * 90; // radius = 90
  element.style.strokeDasharray = circumference;
  element.style.strokeDashoffset = circumference;

  const start = performance.now();

  function update(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const offset = circumference - (percent / 100) * circumference * eased;
    element.style.strokeDashoffset = offset;

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
```

```html
<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
  <circle class="progress-ring" cx="100" cy="100" r="90" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" transform="rotate(-90 100 100)"/>
</svg>
```

---

## Content Templates

### 1. The Hook Quote

Best for: Attention-grabbing statements, controversial takes, wisdom

```
[0:00-0:02] AMBIENT: Particles + pulsing glow build
[0:02-0:05] REVEAL: Main quote with kinetic typography
[0:05-0:08] EMPHASIS: Key word glows and scales
[0:08-0:10] CTA: Subtle fade-in
```

### 2. The Transformation

Best for: Before/after, progress, achievements

```
[0:00-0:03] BEFORE: Problem state with red tint
[0:03-0:05] TRANSITION: Glitch/morph effect
[0:05-0:10] AFTER: Success state with green/gold
[0:10-0:12] STATS: Animated numbers showing improvement
```

### 3. The List Reveal

Best for: Tips, mistakes, secrets, rules

```
[0:00-0:02] HOOK: Title with dramatic entrance
[0:02-0:05] ITEM 1: Slide in + glow
[0:05-0:08] ITEM 2: Different animation pattern
[0:08-0:11] ITEM 3: Build anticipation
[0:11-0:13] BONUS/CTA: Surprise reveal
```

### 4. The Data Story

Best for: Statistics, achievements, comparisons

```
[0:00-0:03] CONTEXT: Set up the scenario
[0:03-0:07] DATA 1: Progress ring + counter
[0:07-0:11] DATA 2: Bar chart animation
[0:11-0:14] INSIGHT: What it means
[0:14-0:16] CTA: Follow for more
```

### 5. The Story Arc

Best for: Mini-narratives, case studies, lessons

```
[0:00-0:03] SETUP: Problem introduction
[0:03-0:08] CONFLICT: The challenge
[0:08-0:13] CLIMAX: The turning point
[0:13-0:18] RESOLUTION: The outcome
[0:18-0:20] LESSON: Key takeaway
```

### 6. The Countdown

Best for: Ranking, top picks, building suspense

```
[0:00-0:02] INTRO: "Top 3..."
[0:02-0:06] #3: Reveal with anticipation
[0:06-0:10] #2: Bigger reveal
[0:10-0:15] #1: Maximum drama
[0:15-0:17] REACTION: Emphasize #1
```

---

## Base Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TikTok Visual</title>
  <style>
    :root {
      --bg-primary: #050505;
      --bg-secondary: #0a0a12;
      --accent: #00f5d4;
      --accent-glow: rgba(0, 245, 212, 0.4);
      --text: #ffffff;
      --text-muted: #555;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 100vw;
      height: 100vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .container {
      width: 1080px;
      height: 1920px;
      transform: scale(0.5);
      transform-origin: center;
      background: radial-gradient(ellipse at 50% 30%, var(--bg-secondary) 0%, var(--bg-primary) 70%);
      position: relative;
      overflow: hidden;
    }

    /* Ambient layer */
    .ambient {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .blob {
      position: absolute;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      filter: blur(100px);
      opacity: 0.12;
      animation: morph 20s ease-in-out infinite;
    }

    .blob-1 {
      width: 600px;
      height: 600px;
      background: var(--accent);
      top: -100px;
      right: -100px;
    }

    .blob-2 {
      width: 500px;
      height: 500px;
      background: var(--accent);
      bottom: 200px;
      left: -150px;
      animation-delay: -7s;
    }

    @keyframes morph {
      0%, 100% {
        border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        transform: translate(0, 0) rotate(0deg) scale(1);
      }
      33% {
        border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
        transform: translate(30px, -20px) rotate(120deg) scale(1.1);
      }
      66% {
        border-radius: 50% 60% 30% 60% / 70% 40% 70% 30%;
        transform: translate(-20px, 30px) rotate(240deg) scale(0.95);
      }
    }

    /* Content sections */
    .section {
      position: absolute;
      width: 100%;
      padding: 0 80px;
      opacity: 0;
      transition: opacity 0.6s ease;
    }

    .section.active {
      opacity: 1;
    }

    /* Typography */
    .headline {
      font-size: 88px;
      font-weight: 800;
      color: var(--text);
      line-height: 1.05;
      letter-spacing: -3px;
    }

    .subhead {
      font-size: 48px;
      color: var(--text-muted);
      font-weight: 500;
      margin-top: 24px;
    }

    .accent-text {
      color: var(--accent);
      text-shadow: 0 0 30px var(--accent-glow);
    }

    /* Animations */
    .char {
      display: inline-block;
      opacity: 0;
      transform: translateY(60px);
    }

    .char.revealed {
      animation: char-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes char-in {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-up {
      opacity: 0;
      transform: translateY(40px);
    }

    .fade-up.active {
      animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fade-up {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .scale-in {
      opacity: 0;
      transform: scale(0.8);
    }

    .scale-in.active {
      animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes scale-in {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Glow pulse */
    .glow {
      animation: glow-pulse 2s ease-in-out infinite;
    }

    @keyframes glow-pulse {
      0%, 100% {
        text-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow);
        filter: brightness(1);
      }
      50% {
        text-shadow: 0 0 40px var(--accent-glow), 0 0 80px var(--accent-glow), 0 0 120px var(--accent-glow);
        filter: brightness(1.1);
      }
    }

    /* Particles */
    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: var(--accent);
      border-radius: 50%;
      opacity: 0;
      animation: particle-float 10s linear infinite;
    }

    @keyframes particle-float {
      0% {
        opacity: 0;
        transform: translateY(0) scale(0);
      }
      10% {
        opacity: 0.6;
        transform: scale(1);
      }
      90% {
        opacity: 0.6;
      }
      100% {
        opacity: 0;
        transform: translateY(-300px) scale(0);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Ambient background -->
    <div class="ambient">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <!-- Particles container -->
    <div class="particles" id="particles"></div>

    <!-- Content sections go here -->
    <div class="section section-1" style="top: 50%; transform: translateY(-50%); text-align: center;">
      <h1 class="headline" id="main-text"></h1>
      <p class="subhead fade-up" id="subtext"></p>
    </div>
  </div>

  <script>
    // Initialize particles
    function createParticles(count = 30) {
      const container = document.getElementById('particles');
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = 60 + Math.random() * 40 + '%';
        p.style.animationDelay = -Math.random() * 10 + 's';
        p.style.animationDuration = 8 + Math.random() * 6 + 's';
        container.appendChild(p);
      }
    }

    // Kinetic text reveal
    function revealText(element, text, delay = 0, charDelay = 30) {
      element.innerHTML = '';
      const chars = text.split('');

      chars.forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = (delay + i * charDelay) + 'ms';
        element.appendChild(span);

        setTimeout(() => {
          span.classList.add('revealed');
        }, delay + i * charDelay);
      });
    }

    // Animate number
    function countUp(element, target, duration = 1500, prefix = '', suffix = '') {
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }

    // Timeline controller
    class Timeline {
      constructor() {
        this.events = [];
        this.startTime = null;
      }

      add(time, callback) {
        this.events.push({ time, callback, fired: false });
        return this;
      }

      play() {
        this.startTime = performance.now();
        this.events.forEach(e => e.fired = false);
        this.tick();
      }

      tick() {
        const elapsed = performance.now() - this.startTime;

        this.events.forEach(event => {
          if (!event.fired && elapsed >= event.time) {
            event.callback();
            event.fired = true;
          }
        });

        if (this.events.some(e => !e.fired)) {
          requestAnimationFrame(() => this.tick());
        }
      }

      restart() {
        this.play();
      }
    }

    // Initialize
    createParticles();

    // Example timeline
    const tl = new Timeline();

    tl.add(500, () => {
      revealText(document.getElementById('main-text'), 'Your Text Here', 0, 40);
    });

    tl.add(2000, () => {
      const sub = document.getElementById('subtext');
      sub.textContent = 'Subtext goes here';
      sub.classList.add('active');
    });

    tl.play();

    // Click to restart
    document.body.addEventListener('click', () => {
      document.querySelectorAll('.char').forEach(c => c.classList.remove('revealed'));
      document.querySelectorAll('.active').forEach(c => c.classList.remove('active'));
      setTimeout(() => tl.restart(), 200);
    });
  </script>
</body>
</html>
```

---

## User Request Flow

When the user requests visual content:

1. **Ask for the content/message** if not clear
2. **Ask for the format** they want:
   - Quote/Hook (single powerful message)
   - List (3-5 points)
   - Transformation (before/after)
   - Data Story (numbers/stats)
   - Story Arc (narrative)
   - Countdown (ranking)

3. **Ask for the vibe**:
   - Cinematic Dark (tech, mysterious)
   - Warm Luxury (premium, gold)
   - Electric Blue (energetic, modern)
   - Matrix Green (hacker, bold)
   - Custom colors (provide hex)

4. **Generate the HTML** with:
   - Layered ambient animations (blobs + particles)
   - Kinetic typography for text reveals
   - Proper easing on all animations
   - Timeline synced for voiceover

5. **Provide voiceover script** with timestamps

6. **Suggest recording tips**:
   - Use OBS or native screen recorder
   - Record at 60fps for smoothness
   - Add audio in CapCut/Premiere

## File Output

Save to: `content/visuals/[topic-slug].html`

Include voiceover script as HTML comments at the top.
