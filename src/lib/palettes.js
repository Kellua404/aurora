export function evalPalette(a, b, c, d, t) {
  return [
    a[0] + b[0] * Math.cos(6.28318 * (c[0] * t + d[0])),
    a[1] + b[1] * Math.cos(6.28318 * (c[1] * t + d[1])),
    a[2] + b[2] * Math.cos(6.28318 * (c[2] * t + d[2])),
  ];
}

export function samplePalette(palette, steps = 24) {
  const { a, b, c, d } = palette;
  const stops = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const [r, g, bl] = evalPalette(a, b, c, d, t);
    stops.push({
      t,
      r: Math.round(Math.min(1, Math.max(0, r)) * 255),
      g: Math.round(Math.min(1, Math.max(0, g)) * 255),
      b: Math.round(Math.min(1, Math.max(0, bl)) * 255),
    });
  }
  return stops;
}

// Curated lookup tables used by randomize() — values known to look good
export const WARP_LOOKUP   = [0.4, 0.55, 0.7, 0.85, 1.0, 1.15, 1.3, 1.5];
export const COMPLEXITY_LOOKUP = [2, 3, 3, 4, 4, 4, 5, 5]; // weighted toward 3-5

export const PRESETS = {
  Borealis: {
    palette: {
      a: [0.5, 0.5, 0.5],
      b: [0.5, 0.5, 0.5],
      c: [1.0, 1.0, 1.0],
      d: [0.30, 0.20, 0.20],
    },
    speed: 0.35,
    flowAngle: 90,
    scale: 1.6,
    warp: 0.9,
    complexity: 4,
    contrast: 1.1,
    brightness: 1.0,
    grain: 0.08,
    hueShift: 0,
    saturation: 1.0,
  },

  Nebula: {
    palette: {
      a: [0.5, 0.5, 0.5],
      b: [0.5, 0.5, 0.5],
      c: [1.0, 1.0, 1.0],
      d: [0.00, 0.10, 0.20],
    },
    speed: 0.25,
    flowAngle: 45,
    scale: 1.2,
    warp: 1.1,
    complexity: 5,
    contrast: 1.3,
    brightness: 0.9,
    grain: 0.06,
    hueShift: 0,
    saturation: 1.0,
  },

  Glacier: {
    palette: {
      a: [0.5, 0.6, 0.7],
      b: [0.4, 0.45, 0.5],
      c: [1.0, 1.0, 1.0],
      d: [0.55, 0.60, 0.70],
    },
    speed: 0.18,
    flowAngle: 270,
    scale: 1.4,
    warp: 0.6,
    complexity: 3,
    contrast: 1.0,
    brightness: 1.1,
    grain: 0.05,
    hueShift: 0,
    saturation: 0.9,
  },

  Magma: {
    palette: {
      a: [0.5, 0.3, 0.2],
      b: [0.5, 0.4, 0.3],
      c: [1.0, 0.8, 0.7],
      d: [0.0, 0.1, 0.2],
    },
    speed: 0.4,
    flowAngle: 180,
    scale: 1.8,
    warp: 1.3,
    complexity: 4,
    contrast: 1.4,
    brightness: 0.95,
    grain: 0.10,
    hueShift: 0,
    saturation: 1.2,
  },

  Dusk: {
    palette: {
      a: [0.6, 0.5, 0.5],
      b: [0.5, 0.4, 0.4],
      c: [0.8, 0.8, 0.9],
      d: [0.10, 0.20, 0.35],
    },
    speed: 0.22,
    flowAngle: 110,
    scale: 1.5,
    warp: 0.6,
    complexity: 4,
    contrast: 1.0,
    brightness: 1.05,
    grain: 0.07,
    hueShift: 0,
    saturation: 1.0,
  },

  Static: {
    palette: {
      a: [0.4, 0.4, 0.45],
      b: [0.12, 0.12, 0.14],
      c: [1.0, 1.0, 1.0],
      d: [0.5, 0.5, 0.5],
    },
    speed: 0.12,
    flowAngle: 60,
    scale: 2.0,
    warp: 0.5,
    complexity: 3,
    contrast: 0.9,
    brightness: 0.85,
    grain: 0.12,
    hueShift: 0,
    saturation: 0.4,
  },

  // Three new palettes

  Prism: {
    // Full rainbow sweep — c channels at different frequencies drive fast color cycling
    palette: {
      a: [0.5, 0.5, 0.5],
      b: [0.5, 0.5, 0.5],
      c: [1.0, 2.0, 3.0],
      d: [0.0, 0.33, 0.67],
    },
    speed: 0.28,
    flowAngle: 75,
    scale: 1.4,
    warp: 0.85,
    complexity: 4,
    contrast: 1.1,
    brightness: 1.0,
    grain: 0.06,
    hueShift: 0,
    saturation: 1.0,
  },

  Tide: {
    // Deep ocean — teal/cyan/aqua shifting slowly
    palette: {
      a: [0.25, 0.5, 0.55],
      b: [0.35, 0.4, 0.35],
      c: [0.8, 0.9, 1.1],
      d: [0.60, 0.70, 0.20],
    },
    speed: 0.20,
    flowAngle: 200,
    scale: 1.3,
    warp: 0.7,
    complexity: 4,
    contrast: 1.05,
    brightness: 1.0,
    grain: 0.06,
    hueShift: 0,
    saturation: 1.0,
  },

  Void: {
    // Dark crimson/indigo — deep, mysterious, high contrast
    palette: {
      a: [0.2, 0.1, 0.25],
      b: [0.3, 0.15, 0.3],
      c: [1.2, 1.0, 0.9],
      d: [0.05, 0.18, 0.40],
    },
    speed: 0.18,
    flowAngle: 150,
    scale: 1.7,
    warp: 1.4,
    complexity: 5,
    contrast: 1.5,
    brightness: 0.75,
    grain: 0.09,
    hueShift: 0,
    saturation: 1.1,
  },
};
