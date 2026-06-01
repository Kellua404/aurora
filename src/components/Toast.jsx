import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, onDone }) {
  // Keep onDone in a ref so the effect never needs it as a dependency
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => onDoneRef.current(), 5000);
    return () => clearTimeout(id);
  }, [message]); // only reset timer when message itself changes

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.08] font-mono"
          style={{
            background: 'rgba(10,12,18,0.9)',
            backdropFilter: 'blur(12px)',
            fontSize: 12,
            color: 'var(--accent)',
          }}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          <CheckCircle size={14} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
