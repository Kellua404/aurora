# Aurora — Product Definition

> The "why and for whom." `PLAN.md` is the "how." When a build decision isn't
> covered by the plan, decide in favor of these principles.

## One-liner

**A studio for synthetic skies** — a generative instrument that renders living,
aurora-like color fields you can tune, discover, and export.

## What it actually is

A single-page web app whose canvas is a real-time WebGL fragment shader (domain-warped
fractal noise mapped through cosine palettes). Visitors tune motion, field, palette,
and grain to compose a "sky," then export it as a high-res PNG, copy-paste CSS, or a
shareable permalink.

## Who it's for

- **Designers / developers** hunting for a distinctive background, wallpaper, or hero
  gradient — and tired of the same flat CSS gradients.
- **Curious visitors** who'll stay because it's mesmerizing to play with.
- **Recruiters / peers** evaluating the portfolio — Aurora is proof of frontend +
  WebGL + interaction craft.

## The job it does

> "Give me a beautiful, original, animated color field I can actually use — and make
> the act of finding it feel like play, not work."

## Brand & personality

- **Mood:** cinematic observatory; analog instrument; calm but alive.
- **Voice:** precise, quiet, a little astronomical. Labels read like telemetry.
- **Visual signature:** near-black chrome, monochrome glass, mono labels, film grain,
  and a UI accent that *recolors itself* from the current sky.
- **Type signature:** Instrument Serif (display) + IBM Plex Mono (instrument labels).
- **Anti-brand:** NOT a generic SaaS form. No Inter/Roboto, no purple-on-white, no
  three sliders and a copy button.

## Design principles (in priority order)

1. **The sky is the product.** Chrome stays out of its way; the canvas is the hero.
2. **Alive over static.** It always breathes; transitions morph, never cut.
3. **An instrument, not a form.** Controls feel like calibration; telemetry is visible.
4. **Discovery is delight.** Randomize should feel like finding a new sky worth keeping.
5. **Genuinely useful.** Exports (PNG / CSS / link) must be real, good, and shippable.
6. **Fast and inclusive.** 60fps, AA accessible, reduced-motion graceful, no-WebGL safe.

## Success looks like

- A visitor loses a minute just dragging sliders, then exports something.
- The output (PNG/CSS) is good enough that people actually use it.
- A peer's reaction is "wait, this is running a shader?" — the §0 North Star feeling.

## Explicit non-goals (v1)

Accounts, cloud saves, marketplaces, multiple field modes, video export, audio
reactivity. (Several live in `PLAN.md` §15 as stretch goals.) Keep v1 small and perfect.
