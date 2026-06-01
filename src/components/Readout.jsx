import { useEffect, useState } from 'react';
import { useAuroraStore } from '../store/useAuroraStore';

export default function Readout({ glStateRef }) {
  const presetName = useAuroraStore(s => s.params.presetName);
  const seed = useAuroraStore(s => s.params.seed);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let raf;
    function tick() {
      // glStateRef.current is the stateRef from useAuroraGL
      // stateRef.current = { raf, start, fps }
      const inner = glStateRef?.current?.current;
      if (inner) setFps(inner.fps || 0);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [glStateRef]);

  const seedHex = Math.floor(Math.abs(seed) * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();

  return (
    <div className="font-mono text-right select-none" style={{ lineHeight: '1.8' }}>
      <Row label="PALETTE" value={presetName} />
      <Row label="SEED" value={`#${seedHex}`} />
      <Row label="FPS" value={fps} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <span className="text-mist-400 uppercase tracking-widest" style={{ fontSize: 10, letterSpacing: '0.18em' }}>
        {label}
      </span>
      <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--accent)' }}>
        {value}
      </span>
    </div>
  );
}
