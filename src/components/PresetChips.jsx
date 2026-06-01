import { useAuroraStore } from '../store/useAuroraStore';
import { PRESETS } from '../lib/palettes';

const PRESET_NAMES = Object.keys(PRESETS);

export default function PresetChips() {
  const presetName = useAuroraStore(s => s.params.presetName);
  const applyPreset = useAuroraStore(s => s.applyPreset);

  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_NAMES.map(name => {
        const active = presetName === name;
        return (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            className="font-mono rounded px-2 py-1 transition-all duration-150 border"
            style={{
              fontSize: 11,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#04050A' : '#6B7180',
              borderColor: active ? 'var(--accent)' : '#1B1F2A',
              fontWeight: active ? 500 : 400,
            }}
            aria-pressed={active}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
