import { COLORS, VITALS } from '../constants.js'

// A vital as a thin 2px SVG line filling left→right. No border-radius, amber.
function StatBar({ label, value }) {
  const W = 244
  const fill = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span
          className="font-serif text-[10px] uppercase"
          style={{ color: COLORS.amberLabel, letterSpacing: '0.1em' }}
        >
          {label}
        </span>
        <span className="font-mono text-[10px]" style={{ color: COLORS.cream }}>
          {Math.round(fill)}%
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} 2`} height="2" preserveAspectRatio="none">
        <line x1="0" y1="1" x2={W} y2="1" stroke={COLORS.line} strokeWidth="2" />
        <line x1="0" y1="1" x2={(fill / 100) * W} y2="1" stroke={COLORS.amber} strokeWidth="2" />
      </svg>
    </div>
  )
}

export default function VitalsTab({ colony, events }) {
  return (
    <div className="panel-scroll h-full overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-3.5">
        {VITALS.map((v) => (
          <StatBar key={v.key} label={v.label} value={colony[v.key]} />
        ))}
      </div>

      <div className="mt-6">
        <h3
          className="font-serif mb-2 text-[10px] uppercase"
          style={{ color: COLORS.amber, letterSpacing: '0.12em' }}
        >
          Colony Event Log
        </h3>
        <div className="flex flex-col gap-1.5">
          {events.length === 0 && (
            <p className="font-mono text-[10px]" style={{ color: '#6d5e44' }}>
              awaiting colony activity…
            </p>
          )}
          {events.map((e) => (
            <p key={e.id} className="font-mono text-[11px] leading-snug" style={{ color: '#a08060' }}>
              <span style={{ color: '#6d5e44' }}>{e.time}</span> {e.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
