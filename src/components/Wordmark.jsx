import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const letters = 'AURORA'.split('');

export default function Wordmark() {
  const reduced = usePrefersReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: 0.3 } },
  };

  const letter = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="select-none">
      <motion.h1
        className="font-serif text-mist-50 leading-none tracking-tight m-0"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {letters.map((ch, i) => (
          <motion.span key={i} variants={letter} style={{ display: 'inline-block' }}>
            {ch}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        className="font-serif text-mist-400 mt-1"
        style={{ fontSize: '1rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.9, duration: 0.6 }}
      >
        A studio for synthetic skies.
      </motion.p>
    </div>
  );
}
