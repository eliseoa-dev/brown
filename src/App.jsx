import { useCallback, useEffect, useRef, useState } from 'react'
import { COLORS, INITIAL_COLONY, VITALS, EVENT_POOL } from './constants.js'
import ColonySVG from './colony/ColonySVG.jsx'
import SidePanel from './panel/SidePanel.jsx'

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))
const drift = (v, lo = 38, hi = 100) => {
  const delta = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1) // ±1–3
  return Math.round(clamp(v + delta, lo, hi))
}

function nowStamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

let eventSeq = 0
function makeEvent() {
  return { id: ++eventSeq, time: nowStamp(), text: EVENT_POOL[(Math.random() * EVENT_POOL.length) | 0] }
}

// Fresh, lightly jittered colony — used on first load and on regenerate.
function spawnColony() {
  return {
    ...INITIAL_COLONY,
    population: INITIAL_COLONY.population + ((Math.random() * 400) | 0) - 200,
    eggs: INITIAL_COLONY.eggs + ((Math.random() * 120) | 0) - 60,
    food: drift(INITIAL_COLONY.food),
    fungus: drift(INITIAL_COLONY.fungus),
    foragerActivity: drift(INITIAL_COLONY.foragerActivity),
    broodDev: drift(INITIAL_COLONY.broodDev),
  }
}

export default function App() {
  const [colony, setColony] = useState(spawnColony)
  const [events, setEvents] = useState(() => [makeEvent()])
  const [svgKey, setSvgKey] = useState(0)
  const colonyRef = useRef(colony)
  colonyRef.current = colony

  // Vitals drift slowly — realistic bounded noise on the seven bars.
  useEffect(() => {
    const id = setInterval(() => {
      setColony((c) => {
        const next = { ...c }
        VITALS.forEach((v) => {
          next[v.key] = drift(c[v.key])
        })
        // brood/forager couplings give the eggs + population a gentle pulse
        next.eggs = clamp(c.eggs + ((Math.random() * 7) | 0) - 3, 280, 540)
        next.population = clamp(c.population + ((Math.random() * 11) | 0) - 5, 2400, 3300)
        return next
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // Procedurally surfaced colony events, every 45 seconds.
  useEffect(() => {
    const id = setInterval(() => {
      setEvents((e) => [makeEvent(), ...e].slice(0, 9))
    }, 45000)
    return () => clearInterval(id)
  }, [])

  const regenerate = useCallback(() => {
    setColony(spawnColony())
    setEvents([makeEvent()])
    setSvgKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-full w-full flex-col" style={{ background: COLORS.bg }}>
      <div className="flex min-h-0 flex-1">
        {/* colony cross-section */}
        <div className="relative min-w-0 flex-1">
          <ColonySVG key={svgKey} colony={colony} />

          {/* regenerate — circular SVG button, icon only */}
          <button
            onClick={regenerate}
            aria-label="regenerate colony"
            title="Regenerate colony"
            className="absolute right-4 top-4"
            style={{ background: 'transparent', cursor: 'pointer', padding: 0 }}
          >
            <svg width="40" height="40" viewBox="-20 -20 40 40">
              <circle r="17" fill="#1a120a99" stroke={COLORS.line} strokeWidth="1" />
              {/* parametric refresh arc + arrowhead */}
              <path
                d={describeArc(0, 0, 9, 40, 300)}
                fill="none"
                stroke={COLORS.amber}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {arrowHead(0, 0, 9, 40)}
            </svg>
          </button>
        </div>

        {/* side panel */}
        <aside className="w-[260px] shrink-0 md:w-[300px]">
          <SidePanel colony={colony} events={events} />
        </aside>
      </div>

      {/* header — minimal, single hairline above */}
      <header
        className="flex shrink-0 items-center justify-between px-5"
        style={{ height: 60, borderTop: `1px solid ${COLORS.line}` }}
      >
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[18px] tracking-[0.18em]" style={{ color: COLORS.cream }}>
            FORMICARIUM
          </span>
          <span className="font-mono hidden text-[9px] sm:inline" style={{ color: '#6d5e44' }}>
            Atta cephalotes · live cross-section
          </span>
        </div>
        <div className="font-mono flex items-center gap-5 text-[11px]" style={{ color: COLORS.amberSoft }}>
          <Vital label="POP" value={colony.population.toLocaleString()} />
          <Vital label="FOOD" value={`${colony.food}%`} />
          <Vital label="EGGS" value={colony.eggs} />
          <Vital label="DAY" value={colony.age} />
        </div>
      </header>
    </div>
  )
}

function Vital({ label, value }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span style={{ color: '#6d5e44' }}>{label}</span>
      <span style={{ color: COLORS.cream }}>{value}</span>
    </span>
  )
}

// ── tiny polar helpers for the regenerate glyph ──
function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
function describeArc(cx, cy, r, startDeg, endDeg) {
  const s = polar(cx, cy, r, endDeg)
  const e = polar(cx, cy, r, startDeg)
  const large = endDeg - startDeg <= 180 ? '0' : '1'
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}
function arrowHead(cx, cy, r, deg) {
  const tip = polar(cx, cy, r, deg)
  return (
    <path
      d={`M ${(tip.x - 3).toFixed(2)} ${(tip.y - 2).toFixed(2)} L ${tip.x.toFixed(2)} ${tip.y.toFixed(2)} L ${(tip.x + 1).toFixed(2)} ${(tip.y - 4).toFixed(2)}`}
      fill="none"
      stroke={COLORS.amber}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}
