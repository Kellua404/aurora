import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuroraStore } from '../store/useAuroraStore';
import Slider from './Slider';
import ControlGroup from './ControlGroup';
import PaletteRamp from './PaletteRamp';
import PresetChips from './PresetChips';

function usePanelParams() {
  const params = useAuroraStore(s => s.params);
  const set = useAuroraStore(s => s.set);
  return { params, set };
}

function PanelContent({ params, set }) {
  return (
    <div className="p-4 space-y-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
      <div>
        <div
          className="font-mono uppercase text-mist-200 border-b border-white/[0.10] pb-1 mb-3"
          style={{ fontSize: 10, letterSpacing: '0.18em' }}
        >
          Presets
        </div>
        <PresetChips />
      </div>

      <ControlGroup title="Palette">
        <Slider label="Brightness" min={0.4} max={1.5} step={0.01} value={params.brightness} onChange={v => set('brightness', v)} />
        <Slider label="Saturation" min={0} max={1.5} step={0.01} value={params.saturation} onChange={v => set('saturation', v)} />
        <Slider label="Hue Shift" min={0} max={1} step={0.01} value={params.hueShift} onChange={v => set('hueShift', v)} />
      </ControlGroup>

      <ControlGroup title="Motion">
        <Slider label="Speed" min={0} max={2} step={0.01} value={params.speed} onChange={v => set('speed', v)} />
        <Slider
          label="Flow Angle"
          min={0}
          max={360}
          step={1}
          value={params.flowAngle}
          onChange={v => set('flowAngle', v)}
          displayFn={v => `${Math.round(v)}°`}
        />
      </ControlGroup>

      <ControlGroup title="Field">
        <Slider label="Scale" min={0.5} max={4} step={0.05} value={params.scale} onChange={v => set('scale', v)} />
        <Slider label="Warp" min={0} max={2} step={0.01} value={params.warp} onChange={v => set('warp', v)} />
        <Slider
          label="Complexity"
          min={1}
          max={6}
          step={1}
          value={params.complexity}
          onChange={v => set('complexity', v)}
          displayFn={v => String(Math.round(v))}
        />
        <Slider label="Contrast" min={0.5} max={2} step={0.01} value={params.contrast} onChange={v => set('contrast', v)} />
      </ControlGroup>

      <ControlGroup title="Grain">
        <Slider label="Amount" min={0} max={0.3} step={0.005} value={params.grain} onChange={v => set('grain', v)} />
      </ControlGroup>

      <div
        className="text-center font-mono text-mist-400"
        style={{ fontSize: 9, letterSpacing: '0.1em', opacity: 0.5 }}
      >
        Built with React · Vite · WebGL — Portfolio Project #2
      </div>
    </div>
  );
}

function PanelHeader({ collapsed, onToggle }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div
          className="font-mono uppercase text-mist-200"
          style={{ fontSize: 10, letterSpacing: '0.18em' }}
        >
          Controls
        </div>
        <PaletteRamp />
      </div>
      <button
        onClick={onToggle}
        className="ml-3 p-1 rounded text-mist-400 hover:text-mist-50 transition-colors flex-shrink-0"
        aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
      >
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
}

// Desktop card — bottom-left
function DesktopPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { params, set } = usePanelParams();

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-30 hidden md:block"
      style={{ width: 360 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div
        className="rounded-xl border border-white/[0.06] overflow-hidden"
        style={{ background: 'rgba(10,12,18,0.75)', backdropFilter: 'blur(20px)' }}
      >
        <PanelHeader collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <PanelContent params={params} set={set} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Mobile bottom sheet
function MobilePanel() {
  const [expanded, setExpanded] = useState(false);
  const { params, set } = usePanelParams();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
      <motion.div
        className="rounded-t-2xl border-t border-x border-white/[0.06] overflow-hidden"
        style={{ background: 'rgba(10,12,18,0.9)', backdropFilter: 'blur(20px)' }}
        animate={{ y: 0 }}
        initial={{ y: 60 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <PanelHeader collapsed={!expanded} onToggle={() => setExpanded(e => !e)} />
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="sheet-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <PanelContent params={params} set={set} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function ControlPanel() {
  return (
    <>
      <DesktopPanel />
      <MobilePanel />
    </>
  );
}
