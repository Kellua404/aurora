import { create } from 'zustand';
import { PRESETS, WARP_LOOKUP, COMPLEXITY_LOOKUP } from '../lib/palettes';
import { morphTo } from '../lib/tween';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const DEFAULT_PRESET = PRESETS.Borealis;

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useAuroraStore = create((set, get) => ({
  params: {
    ...DEFAULT_PRESET,
    paused: false,
    presetName: 'Borealis',
    seed: Math.random() * 100,
    _frozenTime: null,
  },

  set(key, value) {
    set(state => ({ params: { ...state.params, [key]: value } }));
  },

  setMany(patch) {
    set(state => ({ params: { ...state.params, ...patch } }));
  },

  applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    const from = get().params;
    const target = { ...preset, seed: Math.random() * 100, presetName: name };
    morphTo(from, target, patch => get().setMany(patch), reducedMotion());
  },

  randomize() {
    const rand = (min, max) => min + Math.random() * (max - min);
    const rv3 = () => [rand(0.35, 0.65), rand(0.35, 0.65), rand(0.35, 0.65)];
    const from = get().params;
    const target = {
      palette: {
        a: rv3(),
        b: rv3(),
        c: [rand(0.5, 1.5), rand(0.5, 1.5), rand(0.5, 1.5)],
        d: [Math.random(), Math.random(), Math.random()],
      },
      speed:      rand(0.15, 0.6),
      flowAngle:  rand(0, 360),
      warp:       pick(WARP_LOOKUP),
      scale:      rand(1.0, 2.5),
      complexity: pick(COMPLEXITY_LOOKUP),
      contrast:   rand(0.9, 1.4),
      grain:      rand(0.04, 0.12),
      brightness: rand(0.8, 1.2),
      seed:       Math.random() * 100,
      hueShift:   0,
      saturation: 1.0,
      presetName: 'Custom',
    };
    morphTo(from, target, patch => get().setMany(patch), reducedMotion());
  },

  togglePause() {
    set(state => ({
      params: { ...state.params, paused: !state.params.paused },
    }));
  },

  loadFromUrl() {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const decoded = JSON.parse(atob(hash));
      set(state => ({ params: { ...state.params, ...decoded } }));
    } catch {}
  },

  toUrl() {
    const p = get().params;
    const data = {
      speed:      +p.speed.toFixed(3),
      flowAngle:  +p.flowAngle.toFixed(1),
      scale:      +p.scale.toFixed(3),
      warp:       +p.warp.toFixed(3),
      complexity: p.complexity,
      contrast:   +p.contrast.toFixed(3),
      brightness: +p.brightness.toFixed(3),
      grain:      +p.grain.toFixed(3),
      hueShift:   +p.hueShift.toFixed(3),
      saturation: +p.saturation.toFixed(3),
      seed:       +p.seed.toFixed(3),
      palette:    p.palette,
      presetName: p.presetName,
    };
    return `${window.location.origin}${window.location.pathname}#${btoa(JSON.stringify(data))}`;
  },
}));
