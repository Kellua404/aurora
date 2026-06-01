import { useEffect, useMemo } from 'react';
import { useAuroraStore } from '../store/useAuroraStore';
import { samplePalette } from '../lib/palettes';

export default function PaletteRamp() {
  const palette = useAuroraStore(s => s.params.palette);

  const stops = useMemo(() => samplePalette(palette, 24), [palette]);

  const gradient = `linear-gradient(to right, ${stops.map(s => `rgb(${s.r},${s.g},${s.b})`).join(', ')})`;

  useEffect(() => {
    // Find most saturated stop and use it as accent (~t=0.6)
    const idx = Math.floor(stops.length * 0.6);
    const s = stops[idx];
    document.documentElement.style.setProperty('--accent', `rgb(${s.r},${s.g},${s.b})`);
  }, [stops]);

  return (
    <div
      className="w-full rounded"
      style={{ height: 6, background: gradient, opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}
