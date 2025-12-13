---
name: tiktok-explainer
description: Create animated visual explainers for TikTok/Reels content. Generates screen-recordable HTML animations optimized for vertical video with voiceover timing.
triggers:
  - tiktok
  - explainer
  - visual content
  - screen record
  - video content
  - reel
  - short form content
---

# TikTok Visual Explainer Skill

You are an expert at creating **animated visual explainers** for short-form video content (TikTok, Reels, Shorts).

## CRITICAL WORKFLOW (Follow Every Time)

**STEP 1: Auto-detect Brand Theme**
- Search `content/explainers/*.html` for existing brand colors and fonts
- If found: Use EXACT same color variables and font families
- Extract: CSS variables, Google Fonts links, animation patterns
- This ensures visual consistency across ALL explainers

**STEP 2: Generate TWO Files (ALWAYS)**
1. `[topic-slug].html` - Complete standalone animation
2. `[topic-slug]-voiceover.txt` - Clean script for audio generation

**STEP 3: Quality Standards**
- Match the quality level of existing explainers in the project
- Use organic blob animations, phase-based timeline, smooth transitions
- Include: progress bar, restart on click, voiceover script in HTML comments

## Output Format

Generate a **single HTML file** that:
- Opens in any browser for screen recording
- Uses 9:16 vertical aspect ratio (1080x1920 or scaled equivalent)
- Has smooth CSS/JS animations timed for voiceover
- Requires NO external dependencies (inline everything)

## Design Rules

**CRITICAL - Follow these strictly:**
- NEVER use icons or emojis
- NEVER use colored icons or icon libraries
- Use ONLY: typography, shapes, lines, gradients, and motion
- Keep backgrounds clean and minimal
- Use high contrast for readability on mobile
- Animations should be smooth (60fps capable)

## Visual Style

**Typography-First Design:**
- **CRITICAL**: Search project for existing font choices (check CSS, existing explainers)
- Use project's font families (e.g., DM Sans + DM Serif Display if found)
- Large, bold text that's readable on mobile
- Include Google Fonts CDN links if needed
- Text reveals, typewriter effects, scale animations
- Numbers and statistics should animate/count up

**Color Palette:**
- **CRITICAL**: Search the project for existing brand colors first
- Check: CSS files, design tokens, existing explainers in content/explainers/
- Use the EXACT brand colors found (primary, backgrounds, accents, text colors)
- Maintain brand consistency across all generated explainers
- If no brand found, use professional neutral palette with 2-3 colors max

**Animation Patterns:**
- **Phase Transitions**: Multiple timed sections with smooth crossfades
- **Floating Orbs/Blobs**: Ambient background elements with blob-float animations
- **Typing Effects**: Realistic character-by-character text reveals with cursor
- **Progress Bars**: Smooth filling animations with easing
- **Staggered Reveals**: Sequential elements appearing with delays
- **Scale & Pulse**: Attention-grabbing pops and breathing effects
- **Bilateral Animations**: Left-right alternating effects (like EMDR)
- **Number Counters**: Animated counting from 0 to target value
- **Morphing Shapes**: CSS transforms for shape transitions

## Structure Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Explainer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 100vw;
      height: 100vh;
      background: #0a0a0a;
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
      background: linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%);
      position: relative;
      overflow: hidden;
    }

    /* Animation classes */
    .fade-in { animation: fadeIn 0.8s ease forwards; opacity: 0; }
    .slide-up { animation: slideUp 0.8s ease forwards; opacity: 0; transform: translateY(40px); }

    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="container">
    <!-- Content sections with timed animations -->
  </div>

  <script>
    // Timeline controller for voiceover sync
    const timeline = [
      { el: '.section-1', delay: 0 },
      { el: '.section-2', delay: 2000 },
      { el: '.section-3', delay: 4000 },
    ];

    timeline.forEach(item => {
      setTimeout(() => {
        document.querySelector(item.el)?.classList.add('visible');
      }, item.delay);
    });
  </script>
</body>
</html>
```

## Timing Guidelines

For voiceover sync, use these approximate timings:
- **Hook/Title**: 0-3 seconds (grab attention immediately)
- **Point 1**: 3-8 seconds
- **Point 2**: 8-13 seconds
- **Point 3**: 13-18 seconds
- **Call to Action**: 18-22 seconds
- **Total**: Keep under 30 seconds for best engagement

## Advanced Animation Techniques

**Floating Orb Pattern** (ambient background):
```css
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: blob-float 20s ease-in-out infinite;
}

@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  33% { transform: translate(30px, -40px) scale(1.1) rotate(10deg); }
  66% { transform: translate(-20px, 20px) scale(0.9) rotate(-10deg); }
}
```

**Phase-Based Timeline** (like your homepage):
```javascript
const TIMELINE = {
  intro: { start: 0, end: 3000 },
  point1: { start: 3000, end: 7000 },
  point2: { start: 7000, end: 11000 },
  outro: { start: 11000, end: 15000 }
};

function getPhase(time) {
  if (time < TIMELINE.intro.end) return 'intro';
  if (time < TIMELINE.point1.end) return 'point1';
  if (time < TIMELINE.point2.end) return 'point2';
  return 'outro';
}

// Apply phase-specific classes
const currentPhase = getPhase(currentTime);
container.className = `phase-${currentPhase}`;
```

**Typing Animation** (realistic character reveals):
```javascript
function typeText(element, text, speed = 50) {
  let i = 0;
  const interval = setInterval(() => {
    element.textContent = text.slice(0, i);
    i++;
    if (i > text.length) clearInterval(interval);
  }, speed);
}
```

**Number Counter** (animated statistics):
```javascript
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(start);
    }
  }, 16);
}
```

## Content Types You Can Create

1. **Listicle Explainer** - "3 ways to..." with animated bullet points + orbs
2. **Before/After** - Split screen with morphing transition
3. **Step-by-Step** - Phase-based sequential reveals with progress
4. **Stat Showcase** - Animated counters and progress bars
5. **Quote/Hook** - Typography-focused with dramatic reveals + ambient effects
6. **Problem/Solution** - Two-phase narrative with crossfade
7. **Comparison** - Side-by-side with bilateral animations
8. **Process Flow** - Multi-phase animation synced to voiceover (like WelcomeDemo)

## When User Requests Content

1. **Auto-detect project brand theme** by searching for:
   - CSS files with brand colors
   - Design system files
   - Existing content/explainers
   - Use those exact colors and fonts in the output
2. Ask for the **topic/message** if not provided
3. **Generate TWO files always**:
   - `content/explainers/[topic-slug].html` - Complete HTML animation
   - `content/explainers/[topic-slug]-voiceover.txt` - Clean voiceover script for audio generation
4. Suggest **ElevenLabs voice** recommendation in the text file

## Example Voiceover Script Format

```
[0:00-0:03] HOOK: "Stop doing this one thing..."
[0:03-0:08] POINT 1: "First, most people think..."
[0:08-0:13] POINT 2: "But here's what actually works..."
[0:13-0:18] POINT 3: "The result? You'll see..."
[0:18-0:22] CTA: "Follow for more tips like this"
```

## File Output

**ALWAYS generate TWO files:**

1. **HTML File**: `content/explainers/[topic-slug].html`
   - Complete standalone HTML animation
   - Include voiceover script as HTML comments
   - Use project's detected brand colors and fonts

2. **Voiceover Text File**: `content/explainers/[topic-slug]-voiceover.txt`
   - Clean, ready-to-read script for audio generation
   - Include timing markers
   - Suggest ElevenLabs voice settings
   - Format for easy copy-paste into audio tools

**Example voiceover.txt format:**
```
VOICEOVER SCRIPT
Topic: [Topic Name]
Duration: [X] seconds
Recommended Voice: Bella (warm, engaging)
ElevenLabs Settings: Stability 0.6, Clarity 0.75, Style 0.3

---

[0:00-0:04]
Your opening hook goes here. Make it punchy.

[0:04-0:09]
First main point with clear, conversational language.

[0:09-0:14]
Second main point building on the first.

[0:14-0:19]
Third point or key insight.

[0:19-0:24]
Call to action or memorable closer.

---

TOTAL DURATION: 24 seconds
```
