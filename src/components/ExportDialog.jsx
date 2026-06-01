import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Link2 } from 'lucide-react';
import { useAuroraStore } from '../store/useAuroraStore';
import { generateCss } from '../lib/exportCss';

const SIZES = [
  { label: 'Viewport', value: 'viewport' },
  { label: '1080p', value: '1920x1080' },
  { label: '1440p', value: '2560x1440' },
  { label: '4K', value: '3840x2160' },
];

export default function ExportDialog({ open, onClose, canvasRef, onToast }) {
  const [size, setSize] = useState('viewport');
  const dialogRef = useRef(null);
  const params = useAuroraStore(s => s.params);
  const toUrl = useAuroraStore(s => s.toUrl);

  useEffect(() => {
    if (!open) return;
    const handleKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let w, h;
    if (size === 'viewport') {
      w = canvas.width;
      h = canvas.height;
    } else {
      [w, h] = size.split('x').map(Number);
    }

    const seedHex = Math.floor(Math.abs(params.seed) * 0xFFFFFF).toString(16).padStart(6, '0');
    const filename = `aurora-${params.presetName.toLowerCase()}-${seedHex}.png`;

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onToast(`Saved ${filename}`);
      onClose();
    }, 'image/png');
  }

  function handleCopyCss() {
    const css = generateCss(params.palette);
    navigator.clipboard.writeText(css).then(() => {
      onToast('CSS copied to clipboard');
      onClose();
    });
  }

  function handleCopyLink() {
    const url = toUrl();
    window.location.hash = url.split('#')[1] || '';
    navigator.clipboard.writeText(url).then(() => {
      onToast('Link copied');
      onClose();
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Export this sky"
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-white/[0.08] outline-none"
            style={{ background: 'rgba(10,12,18,0.95)', backdropFilter: 'blur(24px)' }}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-serif text-mist-50 m-0" style={{ fontSize: '1.125rem' }}>
                Export this sky
              </h2>
              <button
                onClick={onClose}
                className="text-mist-400 hover:text-mist-50 transition-colors"
                aria-label="Close export dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* PNG Size */}
              <div>
                <div className="font-mono uppercase text-mist-400 mb-2" style={{ fontSize: 10, letterSpacing: '0.18em' }}>
                  Size
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {SIZES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSize(s.value)}
                      className="font-mono rounded px-3 py-1 border transition-all"
                      style={{
                        fontSize: 11,
                        background: size === s.value ? 'var(--accent)' : 'transparent',
                        color: size === s.value ? '#04050A' : '#6B7180',
                        borderColor: size === s.value ? 'var(--accent)' : '#1B1F2A',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.06] font-mono text-mist-200 hover:border-white/[0.15] hover:text-mist-50 transition-all"
                  style={{ fontSize: 12 }}
                >
                  <Download size={14} />
                  Download PNG
                </button>
                <button
                  onClick={handleCopyCss}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.06] font-mono text-mist-200 hover:border-white/[0.15] hover:text-mist-50 transition-all"
                  style={{ fontSize: 12 }}
                >
                  <Copy size={14} />
                  Copy CSS
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.06] font-mono text-mist-200 hover:border-white/[0.15] hover:text-mist-50 transition-all"
                  style={{ fontSize: 12 }}
                >
                  <Link2 size={14} />
                  Copy link
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
