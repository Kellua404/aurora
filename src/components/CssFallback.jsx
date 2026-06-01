import { useAuroraStore } from '../store/useAuroraStore';
import { generateCss } from '../lib/exportCss';

export default function CssFallback() {
  const palette = useAuroraStore(s => s.params.palette);
  const css = generateCss(palette);

  // Parse the CSS into inline styles
  const bgColorMatch = css.match(/background-color: ([^;]+);/);
  const bgImageMatch = css.match(/background-image:\n([\s\S]+);$/);
  const bgColor = bgColorMatch?.[1] || '#04050A';
  const bgImage = bgImageMatch?.[1]?.trim() || '';

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 0, backgroundColor: bgColor, backgroundImage: bgImage }}
      aria-hidden="true"
    >
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 font-mono text-mist-400 text-center"
        style={{ fontSize: 11, zIndex: 5 }}
        role="note"
      >
        WebGL unavailable — showing a static sky.
      </div>
    </div>
  );
}
