import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Play, Pause, Maximize2, Download, EyeOff, Eye } from 'lucide-react';
import { useAuroraStore } from '../store/useAuroraStore';

export default function ActionBar({ onExport, onToggleChrome, chromeHidden }) {
  const paused = useAuroraStore(s => s.params.paused);
  const randomize = useAuroraStore(s => s.randomize);
  const togglePause = useAuroraStore(s => s.togglePause);

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case 'r': randomize(); break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'f':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
          else document.exitFullscreen?.();
          break;
        case 'h': onToggleChrome?.(); break;
        case 'e': onExport?.(); break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [randomize, togglePause, onExport, onToggleChrome]);

  const btn = (onClick, icon, label, title) => (
    <button
      onClick={onClick}
      aria-label={label}
      title={title}
      className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.06] text-mist-400 hover:text-mist-50 hover:border-white/[0.15] transition-all"
      style={{ background: 'rgba(10,12,18,0.75)', backdropFilter: 'blur(12px)' }}
    >
      {icon}
    </button>
  );

  return (
    <motion.div
      className="fixed top-6 right-6 z-30 flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {btn(randomize, <Shuffle size={15} />, 'Randomize sky (R)', 'Randomize sky (R)')}
      {btn(togglePause, paused ? <Play size={15} /> : <Pause size={15} />, paused ? 'Play (Space)' : 'Pause (Space)', 'Pause (Space)')}
      {btn(
        () => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
          else document.exitFullscreen?.();
        },
        <Maximize2 size={15} />,
        'Fullscreen (F)',
        'Fullscreen (F)'
      )}
      {btn(onExport, <Download size={15} />, 'Export (E)', 'Export (E)')}
      {btn(onToggleChrome, chromeHidden ? <Eye size={15} /> : <EyeOff size={15} />, 'Hide chrome (H)', 'Hide chrome (H)')}
    </motion.div>
  );
}
