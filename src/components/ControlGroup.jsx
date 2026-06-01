export default function ControlGroup({ title, children }) {
  return (
    <div className="space-y-3">
      <div
        className="font-mono uppercase text-mist-200 border-b border-white/[0.10] pb-1"
        style={{ fontSize: 10, letterSpacing: '0.18em' }}
      >
        {title}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
