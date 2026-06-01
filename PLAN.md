# Aurora — Build Plan

> **Aurora** is a studio for *synthetic skies* — a generative gradient/wallpaper
> instrument where the canvas is a living WebGL color field (flowing, aurora-like
> nebulae), not a stack of CSS linear-gradients. You tune it like an analog
> instrument, discover skies, and export them as high-res PNG, copy-paste CSS, or
> a shareable permalink.
>
> This document is the **complete handoff spec**. A builder model should be able to
> ship the entire app from this file alone, in the §11 build order. It is intentionally
> exhaustive — including the GLSL shader and the WebGL hook — so the hard parts are
> *specified*, not *guessed*.
>
> Portfolio Project #2. Read alongside `PRODUCT.md` (brand, users, principles).

---

## 0. The North Star (read this first)

Most "gradient generators" are a slider panel that mutates `linear-gradient(...)`.
Aurora is **not that**. The differentiator, in one sentence:

> **The canvas is a real-time fragment shader rendering domain-warped fractal
> noise mapped through cosine palettes — so it looks like the northern lights or a
> nebula breathing, and it never repeats.**

Everything else (the UI, exports, presets) orbits that core. If a tradeoff ever
threatens the "this looks alive and expensive" feeling, protect the feeling.

Three things a visitor must remember:
1. **It breathes.** The field is always subtly in motion; nothing is static.
2. **It morphs.** Randomize/preset changes *tween* the sky over ~1.2s — skies melt
   into each other, they never hard-cut.
3. **It feels like an instrument.** Technical readouts, calibration-style controls,
   observatory-dark chrome. Not a web form.

---

## 1. Goal & Scope

A single-page, single-purpose web app:

- A full-bleed animated WebGL "sky" you can tune in real time at 60fps.
- A floating, glassy **instrument panel** of controls (palette, motion, field, grain).
- A row of named **preset skies** + a **Randomize** that discovers a new tasteful sky.
- **Export**: high-res PNG, copy-paste CSS approximation, and a shareable URL that
  encodes the exact sky.
- Fully responsive (panel becomes a bottom sheet on mobile), accessible (WCAG AA,
  keyboard, reduced-motion), and deployable on Vercel with zero config.

**Out of scope for v1** (see §15 stretch): accounts, saved galleries, video export,
audio reactivity, multiple field algorithms.

---

## 2. Tech Stack (decided)

| Layer | Choice | Reason |
|-------|--------|--------|
| Build tool | **Vite** | Fast, tiny output, matches portfolio convention |
| Framework | **React 18** (JS, not TS) | Consistent with Creeper Glory; keep it simple |
| Styling | **Tailwind CSS** | Utility-first; UI chrome is simple, shader does the color |
| Rendering | **Raw WebGL** (no Three.js) | One fullscreen quad + one fragment shader = tiny + 60fps. Three.js is overkill and heavier. |
| Shaders | **Plain GLSL stored as exported JS template strings** | Avoids a Vite GLSL loader plugin — fewer moving parts, more reliable build |
| State | **Zustand** | One small store for params + actions + URL sync; no prop-drilling |
| Motion (UI) | **Framer Motion** | Panel reveals, micro-interactions, toast. (The *sky* animates in the shader, not here.) |
| Icons | **lucide-react** | Dice, download, copy, link, play/pause, maximize |
| Fonts | **Instrument Serif** (display) + **IBM Plex Mono** (technical UI/labels) | Distinctive, on-theme ("instrument"), NOT generic (no Inter/Roboto/Space Grotesk) |

> **Why these fonts:** the elegant optical serif gives the celestial/observatory
> mood; the mono gives every label the feel of an instrument readout. The pairing is
> the typographic signature. Do **not** substitute Inter/Roboto/Arial/Space Grotesk.

Install (the builder runs these in §10):

```bash
npm install zustand framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
```

---

## 3. Design Language

**Aesthetic direction:** *cinematic observatory / analog instrument.* Near-black
chrome so the shader is the only source of color. Monochrome glass panels, hairline
borders, technical mono labels, a film-grain overlay, and a **dynamic accent** that
samples the current sky's palette (so the UI subtly recolors as the sky changes).

### 3.1 Color tokens (`tailwind.config.js` → `theme.extend.colors`)

```js
ink: {
  900: '#04050A',   // void — deepest background behind everything
  800: '#0A0C12',   // panel base
  700: '#12151D',   // raised surface
  600: '#1B1F2A',   // border / hairline base
},
mist: {
  400: '#6B7180',   // muted label text
  200: '#A8AEBD',   // secondary text
  50:  '#E8EBF2',   // primary text on dark
},
// `accent` is NOT fixed — it is driven at runtime from the current palette via a
// CSS variable `--accent` (see §7.4). Tailwind keeps a fallback:
accent: '#7CF0C8',
```

- **Backgrounds:** glass panels = `bg-ink-800/70` + `backdrop-blur-xl` + `border
  border-white/[0.06]`. The void shows through where the canvas isn't covered.
- **Text:** mist scale. Labels are mono, uppercase, tracked-wide, `text-mist-400`.
- **Accent:** `var(--accent)` for active states, focus rings, the value readouts,
  and the live ramp underline. It is recomputed whenever the palette changes.
- **Grain:** a fixed full-screen overlay (§6 `GrainOverlay`) at ~6–8% opacity,
  `mix-blend-mode: overlay`, `pointer-events:none`, above canvas, below UI.

### 3.2 Typography scale

| Use | Font | Style |
|-----|------|-------|
| Wordmark "AURORA" | Instrument Serif | ~clamp(2rem,5vw,3.5rem), tracking tight, italic optional on one letter for character |
| Section labels ("PALETTE", "MOTION") | IBM Plex Mono | 11px, uppercase, letter-spacing 0.18em, mist-400 |
| Value readouts (numbers) | IBM Plex Mono | 12–13px, accent color, tabular |
| Preset names | IBM Plex Mono | 12px |
| Tagline / body | Instrument Serif | 1rem–1.125rem, mist-200 |

Load via Google Fonts `<link>` in `index.html` (both fonts).

### 3.3 Layout — the instrument

- **Canvas**: `position:fixed; inset:0; z-0` — the full-bleed sky behind everything.
- **Grain overlay**: `fixed inset-0 z-10 pointer-events-none`.
- **Top-left**: `Wordmark` + tagline. Fades/staggers in on load.
- **Top-right**: `Readout` — live instrument telemetry: seed (hex), FPS, field
  coords, palette name. Monospace, tiny, glows faintly. Sells the "instrument" idea.
- **Control panel**: floating glass card. **Desktop:** docked bottom-left or right,
  ~360–400px wide, asymmetric (don't center it — break the grid). **Mobile:** a
  draggable/expandable **bottom sheet**.
- **Action bar**: Randomize · Pause · Fullscreen · Export. Lives at the panel header
  or as a slim floating bar; on fullscreen-view the whole panel can hide (press `H`
  or a collapse chevron) so the sky is uninterrupted.
- **Composition rule:** generous negative space; the sky is the hero. The panel is a
  precise, dense instrument in one corner — density vs. emptiness is the tension.

---

## 4. The Shader — the heart of Aurora (REFERENCE CODE)

This is the most important section. The builder should use this almost verbatim,
tuning constants to taste. Store as a JS string export (see §9 file layout).

### 4.1 Technique

1. **Fullscreen triangle** drawn once; the fragment shader runs per pixel.
2. **Domain-warped FBM** (fractal Brownian motion over simplex noise), Inigo
   Quilez-style two-stage warp → an organic, flowing, cloud/aurora field value `f`.
3. **Cosine palette** `color = a + b*cos(2π(c*t + d))` maps `f` → color. This gives
   infinite beautiful palettes from 4 vec3s and is the basis of every preset.
4. **Animation** = offsetting the noise domain by `flow * time * speed`.
5. **Grain** = cheap hash noise added per-pixel so it never looks like flat CSS.
6. **Mouse parallax** = small domain offset from `u_mouse` (disabled on reduced-motion).

### 4.2 Vertex shader (`fullscreen.vert`)

```glsl
attribute vec2 a_pos;     // a single triangle covering clip space
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
```
Buffer for the triangle: `[-1,-1,  3,-1,  -1,3]` (oversized triangle trick).

### 4.3 Fragment shader (`aurora.frag`) — reference implementation

```glsl
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_mouse;       // -0.5..0.5, parallax
uniform float u_speed;       // motion speed
uniform float u_scale;       // noise frequency (zoom)
uniform float u_warp;        // domain-warp intensity
uniform float u_octaves;     // FBM detail (1..6, passed as float, looped to int)
uniform float u_contrast;    // tone contrast
uniform float u_brightness;  // overall lift
uniform float u_grain;       // film grain amount
uniform vec2  u_flow;        // normalized flow direction
uniform float u_seed;        // randomization offset
uniform vec3  u_palA;        // cosine palette a
uniform vec3  u_palB;        // cosine palette b
uniform vec3  u_palC;        // cosine palette c
uniform vec3  u_palD;        // cosine palette d

// --- Ashima 2D simplex noise (snoise) ---
// Standard, well-known implementation. Paste the canonical Ashima snoise here:
// https://github.com/ashima/webgl-noise (mod289, permute, snoise(vec2)).
// Returns roughly -1..1.
float snoise(vec2 v); // <-- builder pastes the full Ashima function body

float fbm(vec2 p, int oct) {
  float sum = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    sum  += amp * snoise(p * freq);
    freq *= 2.0;
    amp  *= 0.5;
  }
  return sum;
}

vec3 palette(float t) {
  return u_palA + u_palB * cos(6.28318 * (u_palC * t + u_palD));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  int oct = int(u_octaves);

  float t = u_time * u_speed;
  vec2 flow = u_flow * t;
  vec2 p = uv * u_scale + flow + u_seed;
  p += u_mouse * 0.6; // parallax

  // two-stage domain warp (IQ)
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0), oct),
                fbm(p + vec2(5.2, 1.3), oct));
  vec2 r = vec2(fbm(p + u_warp * q + vec2(1.7, 9.2) + 0.15 * t, oct),
                fbm(p + u_warp * q + vec2(8.3, 2.8) - 0.12 * t, oct));
  float f = fbm(p + u_warp * r, oct);

  // remap to 0..1 with contrast
  float v = 0.5 + 0.5 * f;
  v = pow(clamp(v, 0.0, 1.0), u_contrast);

  vec3 col = palette(v) * u_brightness;

  // subtle vignette for cinematic framing
  float vig = smoothstep(1.25, 0.2, length(uv));
  col *= mix(0.82, 1.0, vig);

  // film grain
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))
                  + u_time) * 43758.5453);
  col += (g - 0.5) * u_grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
```

> **Builder note:** the only thing to paste in is the canonical Ashima `snoise(vec2)`
> body (public domain / MIT). Everything else above is complete. Tune the magic
> constants (warp offsets, vignette range) only after it's working.

---

## 5. The WebGL Hook — `useAuroraGL` (REFERENCE CODE)

A React hook that owns the GL context, compiles the program, sets uniforms from a
params **ref** (not state — avoid re-renders), and runs the rAF loop. Reference:

```js
// src/gl/useAuroraGL.js  (reference — adapt names to taste)
import { useEffect, useRef } from 'react';
import { VERT_SRC, FRAG_SRC } from './shaders';

export function useAuroraGL(canvasRef, paramsRef, { paused, reducedMotion }) {
  const stateRef = useRef({ raf: 0, start: performance.now(), fps: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', {
      antialias: true,
      preserveDrawingBuffer: true, // REQUIRED so PNG export can read pixels
      powerPreference: 'high-performance',
    });
    if (!gl) return; // §13: render CSS fallback if no WebGL

    const program = createProgram(gl, VERT_SRC, FRAG_SRC); // compile+link helper
    gl.useProgram(program);

    // fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    // cache uniform locations
    const U = name => gl.getUniformLocation(program, name);
    const u = {
      res:U('u_resolution'), time:U('u_time'), mouse:U('u_mouse'),
      speed:U('u_speed'), scale:U('u_scale'), warp:U('u_warp'),
      oct:U('u_octaves'), contrast:U('u_contrast'), bright:U('u_brightness'),
      grain:U('u_grain'), flow:U('u_flow'), seed:U('u_seed'),
      palA:U('u_palA'), palB:U('u_palB'), palC:U('u_palC'), palD:U('u_palD'),
    };

    let mouse = [0, 0];
    const onMove = e => {
      mouse = [ e.clientX / innerWidth - 0.5, 0.5 - e.clientY / innerHeight ];
    };
    if (!reducedMotion) addEventListener('pointermove', onMove);

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2); // cap DPR for perf
      canvas.width  = Math.floor(canvas.clientWidth  * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    addEventListener('resize', resize);

    let last = performance.now(), frames = 0, acc = 0;
    function frame(now) {
      const p = paramsRef.current;
      const elapsed = (now - stateRef.current.start) / 1000;

      // when paused (or reduced motion), freeze time but still draw once on change
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, paused ? p._frozenTime ?? elapsed : elapsed);
      gl.uniform2f(u.mouse, mouse[0], mouse[1]);
      gl.uniform1f(u.speed, p.speed);
      gl.uniform1f(u.scale, p.scale);
      gl.uniform1f(u.warp, p.warp);
      gl.uniform1f(u.oct, p.complexity);
      gl.uniform1f(u.contrast, p.contrast);
      gl.uniform1f(u.bright, p.brightness);
      gl.uniform1f(u.grain, p.grain);
      const a = (p.flowAngle * Math.PI) / 180;
      gl.uniform2f(u.flow, Math.cos(a), Math.sin(a));
      gl.uniform1f(u.seed, p.seed);
      gl.uniform3fv(u.palA, p.palette.a);
      gl.uniform3fv(u.palB, p.palette.b);
      gl.uniform3fv(u.palC, p.palette.c);
      gl.uniform3fv(u.palD, p.palette.d);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // fps telemetry (for the Readout)
      frames++; acc += now - last; last = now;
      if (acc >= 500) { stateRef.current.fps = Math.round((frames * 1000) / acc); frames = 0; acc = 0; }

      stateRef.current.raf = requestAnimationFrame(frame);
    }
    stateRef.current.raf = requestAnimationFrame(frame);

    // pause when tab hidden (perf + battery)
    const onVis = () => { if (document.hidden) cancelAnimationFrame(stateRef.current.raf);
                          else stateRef.current.raf = requestAnimationFrame(frame); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      removeEventListener('resize', resize);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [paused, reducedMotion]);

  return stateRef; // expose fps/seed for the Readout
}
```

> `createProgram(gl, vert, frag)` = standard compile-shader + link-program helper
> with `getShaderInfoLog` error logging. Put it in `src/gl/glUtils.js`.

---

## 6. Component Breakdown (build order in §11)

Create under `src/components/`. Each is small and focused.

| # | Component | Responsibility |
|---|-----------|----------------|
| 1 | `AuroraCanvas.jsx` | Mounts the `<canvas>`, wires `useAuroraGL`, fixed full-bleed. |
| 2 | `GrainOverlay.jsx` | Fixed grain layer (SVG/feTurbulence or tiled PNG), blend-overlay. |
| 3 | `Wordmark.jsx` | "AURORA" + tagline, staggered entrance. |
| 4 | `Readout.jsx` | Live telemetry: seed, FPS, palette name, coords. Reads from the GL stateRef. |
| 5 | `Slider.jsx` | The core control primitive: a labeled, accessible range with mono value readout + accent fill. Native `<input type=range>` styled. |
| 6 | `ControlGroup.jsx` | Titled group wrapper ("PALETTE" / "MOTION" / "FIELD" / "GRAIN"). |
| 7 | `PaletteRamp.jsx` | A live horizontal gradient strip showing the current cosine palette (sampled in JS, see §7.4). Doubles as the source of `--accent`. |
| 8 | `PresetChips.jsx` | Row of named sky presets; click → `morphTo(preset)`. Active chip highlighted. |
| 9 | `ControlPanel.jsx` | Assembles groups + ramp + chips. Desktop card / mobile bottom sheet. Collapsible. |
| 10 | `ActionBar.jsx` | Randomize, Pause, Fullscreen, Export buttons (lucide icons, tooltips, keyboard shortcuts). |
| 11 | `ExportDialog.jsx` | Modal: PNG size picker + download, "Copy CSS", "Copy link". Framer Motion. |
| 12 | `Toast.jsx` | Transient confirmations ("CSS copied", "Link copied"). |

---

## 7. State, Parameters & Systems

### 7.1 Parameter model (`useAuroraStore.js`, Zustand)

| Param | Range | Default | Maps to | UI group |
|-------|-------|---------|---------|----------|
| `speed` | 0–2 | 0.35 | `u_speed` | MOTION |
| `flowAngle` | 0–360° | 90 | `u_flow` | MOTION |
| `scale` | 0.5–4 | 1.6 | `u_scale` | FIELD |
| `warp` | 0–2 | 0.9 | `u_warp` | FIELD |
| `complexity` | 1–6 (int) | 4 | `u_octaves` | FIELD |
| `contrast` | 0.5–2 | 1.1 | `u_contrast` | FIELD |
| `brightness` | 0.4–1.5 | 1.0 | `u_brightness` | PALETTE |
| `grain` | 0–0.3 | 0.08 | `u_grain` | GRAIN |
| `hueShift` | 0–1 | 0 | rotates `palette.d` | PALETTE |
| `saturation` | 0–1.5 | 1.0 | scales `palette.b` | PALETTE |
| `seed` | float | random | `u_seed` | (Randomize) |
| `palette` | `{a,b,c,d}` (4×vec3) | preset | `u_palA..D` | (Presets) |
| `paused` | bool | false | freezes time | (ActionBar) |
| `presetName` | string | 'Borealis' | Readout label | (Presets) |

> `hueShift`/`saturation` derive the *effective* palette from the base preset:
> `effD = base.d + hueShift; effB = base.b * saturation`. The store exposes the
> derived `palette` the shader actually consumes.

Store actions: `set(param, value)`, `applyPreset(name)`, `randomize()`,
`morphTo(targetParams)`, `togglePause()`, `loadFromUrl()`, `toUrl()`.

### 7.2 Presets — the named skies (`lib/palettes.js`)

Each preset = base cosine palette `{a,b,c,d}` + motion/field overrides. These are
**starting points** (IQ-style cosine palettes); tune to taste after it renders.
Ship **at least 6**:

| Name | Mood | Notes for palette `{a,b,c,d}` (vec3) |
|------|------|--------------------------------------|
| **Borealis** | green→teal→violet curtains | a(.5,.5,.5) b(.5,.5,.5) c(1,1,1) d(.30,.20,.20) ; speed .35 |
| **Nebula** | magenta/indigo deep space | d(.00,.10,.20) , higher contrast 1.3, scale 1.2 |
| **Glacier** | icy blue/white, calm | b(.4,.45,.5) , low speed .18, brightness 1.1 |
| **Magma** | red/orange/black, intense | a(.5,.3,.2) d(.0,.1,.2) flipped warm; contrast 1.4 |
| **Dusk** | peach→indigo gradient sky | d(.10,.20,.35) , gentle warp .6 |
| **Static** | near-monochrome graphite | low saturation, b small; for "wallpaper" minimalists |

> Provide each as a full default param object so `applyPreset` sets everything.

### 7.3 Randomize — discover a *tasteful* sky

Not pure chaos. Constrain to ranges known to look good:
- Pick `a`,`b` near 0.5 ± 0.15; `c` in 0.5–1.5; `d` random 0–1 per channel.
- `speed` 0.15–0.6, `warp` 0.4–1.4, `scale` 1.0–2.5, `complexity` 3–5,
  `contrast` 0.9–1.4, `grain` 0.04–0.12.
- New random `seed`.
- Always route through `morphTo` so it **tweens**, never hard-cuts (§7.5).
- Update `presetName` to `'Custom'` and a fresh hex seed in the Readout.

### 7.4 Live palette ramp + dynamic accent (`PaletteRamp.jsx`)

Evaluate the cosine palette in JS (mirror of the shader): `c(t)=a+b*cos(2π(c*t+d))`.
Sample ~24 stops → render as a CSS `linear-gradient` strip (instant visual feedback
without reading the GL buffer). Take the stop at `t≈0.6` (or the most saturated stop)
→ write it to `document.documentElement.style.setProperty('--accent', rgb)`. This is
how the UI recolors itself to match the sky.

### 7.5 Morph/tween system (`lib/tween.js`)

`morphTo(target)` lerps every numeric param (and each palette vec3 channel) from
current → target over ~1.2s with `easeInOutCubic`, writing into the params **ref**
each frame (and mirroring final values into the store). Result: skies *melt* into
each other. Honor reduced-motion by snapping instantly instead of tweening.

### 7.6 URL state (`lib/urlState.js`)

Encode the full param set into the URL hash (compact: round floats to 3 decimals,
join with `,`; or base64 a small JSON). On load, `loadFromUrl()` hydrates the store.
"Copy link" writes `location.href` with current state. This makes every sky a
**permalink** — a strong portfolio detail.

---

## 8. Export System

### 8.1 PNG (`lib/exportPng.js`)
- Because `preserveDrawingBuffer:true`, you can capture the live canvas directly.
- Size options: **1× (viewport)**, **1920×1080**, **2560×1440**, **3840×2160**.
- For sizes ≠ viewport: temporarily resize the canvas to target dims, force one
  `drawArrays`, `canvas.toBlob` → download, then restore. (Or render to an
  offscreen canvas/FBO with the same program.) Keep grain/quality identical.
- Filename: `aurora-${presetName}-${seedHex}.png`.

### 8.2 CSS (`lib/exportCss.js`)
- Generate a **multi-radial-gradient mesh** approximating the current sky: sample
  the palette at ~5 `t` values, place them as layered `radial-gradient(...)` blobs
  at fixed pleasant positions over a base color (palette at t=0).
- Output a ready block:
  ```css
  background-color: <c(0)>;
  background-image:
    radial-gradient(at 20% 25%, <c(.2)> 0px, transparent 55%),
    radial-gradient(at 75% 15%, <c(.4)> 0px, transparent 50%),
    ... ;
  ```
- Optionally include an `@keyframes` animated variant (shifting `background-position`)
  as a bonus toggle. Clearly label it "approximation."
- "Copy CSS" → clipboard → `Toast`.

### 8.3 Share link
- "Copy link" → `urlState.toUrl()` → clipboard → `Toast`.

---

## 9. File / Folder Structure

```
aurora/
├── PLAN.md                  ← this file
├── PRODUCT.md               ← brand / users / principles
├── README.md                ← run + deploy (builder writes at the end)
├── index.html               ← Google Fonts links, root div, meta/OG
├── package.json
├── vite.config.js           ← base '/' (Vercel)
├── tailwind.config.js       ← color tokens (§3.1), font families
├── postcss.config.js
├── public/
│   ├── favicon.svg          ← a small aurora swatch
│   └── og.png               ← social preview (optional, stretch)
└── src/
    ├── main.jsx
    ├── App.jsx              ← assembles canvas + grain + wordmark + readout + panel + actions
    ├── index.css           ← Tailwind directives, font faces, base, range-input + scrollbar styling
    ├── store/
    │   └── useAuroraStore.js
    ├── gl/
    │   ├── shaders.js       ← exports VERT_SRC, FRAG_SRC strings (§4)
    │   ├── glUtils.js       ← createProgram / compileShader helpers
    │   └── useAuroraGL.js   ← the render hook (§5)
    ├── lib/
    │   ├── palettes.js      ← presets + evalPalette(a,b,c,d,t)
    │   ├── tween.js         ← morphTo / easing
    │   ├── exportPng.js
    │   ├── exportCss.js
    │   └── urlState.js
    ├── hooks/
    │   └── usePrefersReducedMotion.js
    └── components/
        ├── AuroraCanvas.jsx
        ├── GrainOverlay.jsx
        ├── Wordmark.jsx
        ├── Readout.jsx
        ├── Slider.jsx
        ├── ControlGroup.jsx
        ├── PaletteRamp.jsx
        ├── PresetChips.jsx
        ├── ControlPanel.jsx
        ├── ActionBar.jsx
        ├── ExportDialog.jsx
        └── Toast.jsx
```

---

## 10. Setup Commands (builder runs first)

```bash
cd "aurora"
npm create vite@latest . -- --template react   # if folder empty besides md files
npm install
npm install zustand framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

Then, in order:
1. Configure `tailwind.config.js` `content` globs + color tokens (§3.1) + fonts.
2. Add Tailwind directives + font `<link>`s + range-input/scrollbar styling to
   `index.css` / `index.html`.
3. Build in §11 order.
4. Test responsive + reduced-motion + `npm run build && npm run preview`.

---

## 11. Build Order (do them in this sequence)

1. ✅ **GL core**: `shaders.js` (vert + frag with Ashima snoise) → `glUtils.js`
   → `useAuroraGL.js` → canvas wired in `App.jsx` (SkyCanvas). Sky breathes at 60fps.
2. ✅ **Store**: `useAuroraStore.js` with full param model + Zustand. Canvas reads params via ref.
3. ✅ **Palettes + ramp**: `palettes.js` (6 presets + evalPalette) → `PaletteRamp.jsx` (+dynamic `--accent`).
4. ✅ **Controls**: `Slider.jsx` → `ControlGroup.jsx` → `ControlPanel.jsx` wired to store.
5. ✅ **Presets**: `PresetChips.jsx` + `applyPreset`.
6. ✅ **Tween**: `tween.js` + `morphTo`; presets/randomize route through it.
7. ✅ **Randomize**: `randomize()` + ActionBar dice button + keyboard `R`.
8. ✅ **Chrome**: `Wordmark.jsx`, `Readout.jsx` (FPS/seed/palette), `GrainOverlay.jsx`.
9. ✅ **Actions**: `ActionBar.jsx` (Pause, Fullscreen, keyboard shortcuts R/Space/F/H/E).
10. ✅ **Export**: `exportPng.js`, `exportCss.js`, `ExportDialog.jsx`, `Toast.jsx`.
11. ✅ **URL state**: `urlState.js` + `loadFromUrl` on mount + "Copy link".
12. ✅ **Responsive**: `DesktopPanel` (bottom-left card) + `MobilePanel` (bottom sheet) split by `md:` breakpoint.
13. ✅ **A11y + reduced-motion + fallback**: `usePrefersReducedMotion` hook used; no-WebGL fallback (`CssFallback.jsx`) with CSS mesh-gradient + note.
14. ✅ **Polish pass**: aurora favicon, entrance animations (Framer Motion stagger on Wordmark), grain overlay, dynamic `--accent` from palette, keyboard shortcuts wired.

---

## 12. Interaction & Motion Spec

- **Page load:** canvas fades up from black (0→1 over ~0.8s). Wordmark + tagline
  stagger in (Framer Motion, `staggerChildren 0.08`). Panel slides/fades in from its
  edge ~0.2s later. Readout types/counts up.
- **Sky morphs:** every preset/randomize tweens over ~1.2s (§7.5).
- **Sliders:** dragging updates the sky in real time (no debounce on the shader; it's
  cheap). Value readout in accent mono. Thumb scales on active.
- **Hover:** controls lift hairline border to `--accent` at low alpha; buttons get a
  soft glow.
- **Mouse parallax:** subtle field offset via `u_mouse` (off on reduced-motion).
- **Keyboard shortcuts:** `R` randomize · `Space` pause/play · `F` fullscreen ·
  `H` hide/show chrome · `E` export. Show a tiny "?" hint.
- **Reduced motion:** no parallax, no tween (snap), shader time frozen (static but
  still beautiful), entrance animations reduced to fades.

---

## 13. Accessibility, Fallback & Robustness

- **WCAG AA:** all UI text ≥ AA contrast on dark chrome (mist scale satisfies this).
- **Keyboard:** every control reachable/operable; native range inputs; visible focus
  rings in `--accent`. Buttons have `aria-label`. Dialog traps focus + `Esc` closes.
- **Reduced motion:** `usePrefersReducedMotion` gates animation (see §12).
- **No-WebGL fallback:** if `getContext('webgl')` is null, render a tasteful animated
  CSS mesh-gradient (reuse the `exportCss` generator output) so the page still looks
  intentional, plus a small "WebGL unavailable — showing a static sky" note.
- **Color-meaning:** never rely on color alone for state; chips/buttons also use text +
  active outline.

---

## 14. Performance Targets

- Single draw call per frame; DPR capped at 2.
- Pause rAF when tab hidden; freeze when `paused`.
- Lighthouse: **Performance ≥ 90**, **Accessibility ≥ 95**.
- No layout thrash; UI animates only `transform`/`opacity`.
- Initial JS small (no Three.js). Fonts `display=swap`.

---

## 15. Stretch Goals (only after Definition of Done)

- **Field algorithms:** a selector for "Nebula / Curtains / Liquid / Cells" — each a
  different noise routine in the frag shader (`u_mode` branch).
- **Saved gallery:** localStorage of favorite skies, thumbnail grid.
- **Loop export:** record a seamless WebM with `MediaRecorder` on the canvas stream.
- **Audio-reactive:** mic input modulates `speed`/`warp` (with permission + toggle).
- **Auto OG image:** generate `og.png` from a signature sky.
- **Theme of the UI chrome:** light "gallery" mode vs dark "observatory" mode.

---

## 16. Copy / Content (ready-to-use)

- **Wordmark:** `AURORA`
- **Tagline:** *"A studio for synthetic skies."*
- **Readout labels:** `SEED` · `FPS` · `FIELD` · `PALETTE`
- **Group titles:** `PALETTE` · `MOTION` · `FIELD` · `GRAIN`
- **Preset names:** Borealis · Nebula · Glacier · Magma · Dusk · Static
- **Action tooltips:** "Randomize sky (R)" · "Pause (Space)" · "Fullscreen (F)" ·
  "Export (E)"
- **Export dialog:** title "Export this sky" · "Download PNG" · "Copy CSS" ·
  "Copy link" · size labels "Viewport · 1080p · 1440p · 4K"
- **Toasts:** "CSS copied to clipboard" · "Link copied" · "Saved aurora-….png"
- **No-WebGL note:** "WebGL unavailable — showing a static sky."
- **Footer (tiny, bottom corner):** "Built with React · Vite · WebGL — Portfolio
  Project #2"

---

## 17. Definition of Done

- [ ] Full-bleed WebGL sky renders and **breathes** at ~60fps.
- [ ] Domain-warped FBM + cosine palette mapping working (matches §4).
- [ ] All §7.1 params tunable via sliders, updating the sky live.
- [ ] ≥ 6 named presets; clicking one **morphs** the sky (~1.2s tween).
- [ ] Randomize produces a *tasteful* new sky (not chaos), routed through morph.
- [ ] Live `PaletteRamp` + dynamic `--accent` recolors the UI.
- [ ] Readout shows live seed / FPS / palette name.
- [ ] PNG export at multiple resolutions downloads correctly.
- [ ] "Copy CSS" produces a valid, good-looking mesh-gradient.
- [ ] "Copy link" round-trips full state via URL.
- [ ] Fully responsive (375 / 768 / 1440); panel → bottom sheet on mobile.
- [ ] `prefers-reduced-motion` respected; keyboard + focus + aria complete.
- [ ] No-WebGL fallback renders an intentional static sky.
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95.
- [ ] `npm run build` succeeds; `preview` looks correct.
- [ ] README with run + deploy instructions; deployed to Vercel.

---

## 18. After Done

1. `git init` in `aurora/`, push to `github.com/Kellua404/aurora`.
2. Import to Vercel → auto-deploy → grab the live URL.
3. Update root `PORTFOLIO_PLAN.md`: mark Project 2 ✅ Done with the repo + live URL.
4. Capture a signature sky screenshot for the eventual portfolio hub.

---

*End of plan. Hand off to the builder model. Follow §11 build order. Protect the
"alive and expensive" feeling above all — that is what makes Aurora not generic.*
