export default function Slider({ label, min, max, step = 0.01, value, onChange, displayFn }) {
  const displayValue = displayFn
    ? displayFn(value)
    : typeof value === 'number'
      ? value.toFixed(step < 0.1 ? 2 : 0)
      : value;

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1">
        <label className="font-mono uppercase text-mist-50" style={{ fontSize: 10, letterSpacing: '0.18em' }}>
          {label}
        </label>
        <span className="font-mono tabular-nums" style={{ fontSize: 12, color: 'var(--accent)' }}>
          {displayValue}
        </span>
      </div>
      <div className="relative">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] rounded pointer-events-none"
          style={{ width: `${pct}%`, background: 'var(--accent)', opacity: 0.45 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => {
            const raw = parseFloat(e.target.value);
            onChange(step >= 1 ? Math.round(raw) : raw);
          }}
          aria-label={label}
          className="w-full"
        />
      </div>
    </div>
  );
}
