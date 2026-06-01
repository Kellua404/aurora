import { evalPalette } from './palettes';

function toRgb(arr) {
  const [r, g, b] = arr.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255));
  return `rgb(${r}, ${g}, ${b})`;
}

const POSITIONS = [
  [20, 25], [75, 15], [45, 70], [85, 65], [15, 80],
];

export function generateCss(palette) {
  const { a, b, c, d } = palette;
  const base = toRgb(evalPalette(a, b, c, d, 0));
  const tValues = [0.2, 0.4, 0.55, 0.75, 0.9];
  const blobs = tValues.map((t, i) => {
    const color = toRgb(evalPalette(a, b, c, d, t));
    const [px, py] = POSITIONS[i];
    return `  radial-gradient(at ${px}% ${py}%, ${color} 0px, transparent 55%)`;
  });

  return `/* Aurora — CSS sky approximation */
background-color: ${base};
background-image:
${blobs.join(',\n')};`;
}
