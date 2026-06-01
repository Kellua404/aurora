import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuroraGL } from './gl/useAuroraGL';
import { useAuroraStore } from './store/useAuroraStore';
import GrainOverlay from './components/GrainOverlay';
import Wordmark from './components/Wordmark';
import Readout from './components/Readout';
import ControlPanel from './components/ControlPanel';
import ActionBar from './components/ActionBar';
import ExportDialog from './components/ExportDialog';
import Toast from './components/Toast';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import CssFallback from './components/CssFallback';

function SkyCanvas({ canvasRef, glStateRef }) {
  const params = useAuroraStore(s => s.params);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const reducedMotion = usePrefersReducedMotion();

  const glState = useAuroraGL(canvasRef, paramsRef, { reducedMotion });
  // Store the stateRef so Readout can poll fps
  glStateRef.current = glState;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, display: glState.current?.noWebGL ? 'none' : 'block' }}
      aria-hidden="true"
    />
  );
}

export default function App() {
  const canvasRef = useRef(null);
  const glStateRef = useRef(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [toast, setToast] = useState('');
  const [noWebGL, setNoWebGL] = useState(false);
  const loadFromUrl = useAuroraStore(s => s.loadFromUrl);

  useEffect(() => {
    loadFromUrl();
  }, []);

  // Detect no-WebGL after first render
  useEffect(() => {
    const id = setTimeout(() => {
      if (glStateRef.current?.current?.noWebGL) setNoWebGL(true);
    }, 500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-ink-900">
      {/* Layer 0: WebGL Sky (or CSS fallback) */}
      {noWebGL ? <CssFallback /> : <SkyCanvas canvasRef={canvasRef} glStateRef={glStateRef} />}

      {/* Layer 1: Film grain */}
      <GrainOverlay />

      {/* Layer 2+: UI chrome */}
      {!chromeHidden && (
        <>
          <motion.div
            className="fixed top-6 left-6 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Wordmark />
          </motion.div>

          <div className="fixed z-20" style={{ top: '6rem', right: '1.5rem' }}>
            <Readout glStateRef={glStateRef} />
          </div>

          <ControlPanel />
        </>
      )}

      <ActionBar
        onExport={() => setExportOpen(true)}
        onToggleChrome={() => setChromeHidden(h => !h)}
        chromeHidden={chromeHidden}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        canvasRef={canvasRef}
        onToast={setToast}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
