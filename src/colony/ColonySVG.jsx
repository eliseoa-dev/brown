import { useEffect, useMemo, useRef } from 'react'
import { COLORS } from '../constants.js'
import {
  VIEW,
  SURFACE_Y,
  CHAMBERS,
  TUNNELS,
  depthScale,
  depthTicks,
  tunnelPoint,
  stepAnt,
  buildAnts,
  buildLissajous,
  buildSpores,
  buildGrass,
  TAU_CONST as TAU,
} from './geometry.js'

// Builds the `d` for one clipped sine surface inside a liquid chamber.
function waveD(ch, fill, phase, amp, freq) {
  const left = ch.cx - ch.rx
  const right = ch.cx + ch.rx
  const bottom = ch.cy + ch.ry
  const clamped = Math.max(0.08, Math.min(0.96, fill))
  const level = bottom - clamped * 2 * ch.ry
  const steps = 30
  let d = `M ${left.toFixed(1)} ${level.toFixed(1)}`
  for (let i = 1; i <= steps; i++) {
    const x = left + (i / steps) * 2 * ch.rx
    const y = level + amp * Math.sin(freq * (i / steps) * TAU + phase)
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  d += ` L ${right.toFixed(1)} ${bottom.toFixed(1)} L ${left.toFixed(1)} ${bottom.toFixed(1)} Z`
  return d
}

// One procedurally drawn ant: abdomen / thorax / head / antennae / legs,
// all in local space facing +x. The frame loop only rotates & translates it.
function AntBody({ ant }) {
  const body = COLORS[ant.tint]
  return (
    <g transform={`scale(${ant.scale})`}>
      {/* legs — three thin pairs splayed from the thorax */}
      {[-3, 0, 3].map((lx, i) => (
        <g key={i} stroke={body} strokeWidth={0.5} opacity={0.75}>
          <line x1={lx} y1={0} x2={lx - 2} y2={-4} />
          <line x1={lx} y1={0} x2={lx - 2} y2={4} />
        </g>
      ))}
      <ellipse cx={-6} cy={0} rx={5} ry={3.4} fill={body} />
      <circle cx={0} cy={0} r={2.9} fill={body} />
      <circle cx={5.2} cy={0} r={2.5} fill={body} />
      <g stroke={body} strokeWidth={0.5} strokeLinecap="round">
        <line x1={6.5} y1={-1.4} x2={10.5} y2={-4.5} />
        <line x1={6.5} y1={1.4} x2={10.5} y2={4.5} />
      </g>
      {ant.carries && (
        <ellipse
          cx={7}
          cy={-7}
          rx={4.6}
          ry={2.6}
          fill={`${COLORS.leaf}cc`}
          transform={`rotate(${ant.leafAngle} 7 -7)`}
        />
      )}
    </g>
  )
}

export default function ColonySVG({ colony }) {
  // Live colony state, read inside the RAF loop without re-subscribing it.
  const colonyRef = useRef(colony)
  useEffect(() => {
    colonyRef.current = colony
  }, [colony])

  // Static procedural populations — generated once.
  const ants = useMemo(() => buildAnts(84), [])
  const grass = useMemo(() => buildGrass(130), [])
  const spores = useMemo(() => buildSpores(40), [])
  const lissData = useMemo(() => {
    const map = {}
    CHAMBERS.forEach((c) => {
      if (c.type === 'lissajous' || c.type === 'royal') {
        map[c.id] = buildLissajous(c, c.type === 'royal' ? 16 : 11)
      }
    })
    return map
  }, [])

  // DOM ref registries the animation loop writes to directly.
  const antEls = useRef([])
  const waveEls = useRef({}) // id -> [pathEl, pathEl]
  const lissEls = useRef({}) // id -> [circleEl, ...]
  const sporeEls = useRef([])
  const state = useRef({ t: 0, raf: 0 })

  useEffect(() => {
    const liquidChambers = CHAMBERS.filter((c) => c.type === 'liquid')
    const lissChambers = CHAMBERS.filter((c) => c.type === 'lissajous' || c.type === 'royal')

    const tick = () => {
      const s = state.current
      s.t += 0.008
      const t = s.t

      // ── ants ──
      for (let i = 0; i < ants.length; i++) {
        const ant = ants[i]
        stepAnt(ant)
        const el = antEls.current[i]
        if (!el) continue
        const tn = TUNNELS[ant.tunnel]
        const p = tunnelPoint(ant.t, tn)
        const facing = ant.dir < 0 ? p.angle + 180 : p.angle
        el.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${facing.toFixed(1)})`)
      }

      // ── liquid chambers: two offset sine surfaces ──
      for (const ch of liquidChambers) {
        const pair = waveEls.current[ch.id]
        if (!pair) continue
        const fill = (colonyRef.current[ch.fillKey] ?? 60) / 100
        pair[0].setAttribute('d', waveD(ch, fill, t * 1.3, 4.5, 1.6))
        pair[1].setAttribute('d', waveD(ch, fill - 0.015, t * 1.3 + 1.9, 3.2, 2.2))
      }

      // ── Lissajous particles (eggs / larvae) ──
      for (const ch of lissChambers) {
        const els = lissEls.current[ch.id]
        const data = lissData[ch.id]
        if (!els || !data) continue
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          const el = els[i]
          if (!el) continue
          el.setAttribute('cx', (ch.cx + d.A * Math.sin(d.seed1 + t * d.sp1)).toFixed(2))
          el.setAttribute('cy', (ch.cy + d.B * Math.sin(d.seed2 + t * d.sp2)).toFixed(2))
        }
      }

      // ── ambient spores drifting up ──
      for (let i = 0; i < spores.length; i++) {
        const sp = spores[i]
        const el = sporeEls.current[i]
        sp.y -= sp.rise
        if (sp.y < SURFACE_Y) sp.y = VIEW.h
        if (!el) continue
        el.setAttribute('cx', (sp.baseX + sp.amp * Math.sin(sp.phase + t * sp.sway)).toFixed(2))
        el.setAttribute('cy', sp.y.toFixed(2))
      }

      s.raf = requestAnimationFrame(tick)
    }

    state.current.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(state.current.raf)
  }, [ants, spores, lissData])

  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1409" />
          <stop offset="55%" stopColor="#120c05" />
          <stop offset="100%" stopColor={COLORS.bgDeep} />
        </linearGradient>
        <linearGradient id="surfaceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#24400f" />
          <stop offset="100%" stopColor="#160f06" />
        </linearGradient>
        <radialGradient id="queenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.queenLine} stopOpacity="0.32" />
          <stop offset="60%" stopColor={COLORS.queenLine} stopOpacity="0.10" />
          <stop offset="100%" stopColor={COLORS.queenLine} stopOpacity="0" />
        </radialGradient>
        {CHAMBERS.map((c) => (
          <clipPath id={`clip-${c.id}`} key={c.id}>
            <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} />
          </clipPath>
        ))}
      </defs>

      {/* background soil column */}
      <rect x="0" y="0" width={VIEW.w} height={VIEW.h} fill="url(#bgGrad)" />

      {/* surface strip */}
      <rect x="0" y="0" width={VIEW.w} height={SURFACE_Y} fill="url(#surfaceGrad)" />
      <g>
        {grass.map((g, i) => (
          <line
            key={i}
            x1={g.x}
            y1={SURFACE_Y}
            x2={g.x + g.tilt}
            y2={g.y2}
            stroke={g.color}
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}
      </g>
      <line x1="0" y1={SURFACE_Y} x2={VIEW.w} y2={SURFACE_Y} stroke="#0a0704" strokeWidth={1.5} opacity={0.6} />
      <ellipse cx={500} cy={SURFACE_Y} rx={26} ry={9} fill="#0a0704" />

      {/* depth ruler */}
      <g fontFamily="'JetBrains Mono', monospace" fontSize={9} fill={COLORS.ruler}>
        {depthTicks.map((m) => {
          const y = depthScale(m)
          return (
            <g key={m}>
              <line x1={18} y1={y} x2={30} y2={y} stroke={COLORS.ruler} strokeWidth={1} />
              <text x={44} y={y + 3} textAnchor="end">
                {m}m
              </text>
            </g>
          )
        })}
        <line x1={30} y1={depthScale(0)} x2={30} y2={depthScale(8)} stroke={COLORS.ruler} strokeWidth={0.6} />
      </g>

      {/* tunnels — outer wall + lighter inner channel */}
      <g fill="none" strokeLinecap="round">
        {TUNNELS.map((tn, i) => (
          <path key={`o${i}`} d={tn.d} stroke="#241708" strokeWidth={14} />
        ))}
        {TUNNELS.map((tn, i) => (
          <path key={`i${i}`} d={tn.d} stroke="#3a2710" strokeWidth={7} opacity={0.8} />
        ))}
      </g>

      {/* spores drift above tunnels, beneath chambers */}
      <g fill={COLORS.amber} opacity={0.15}>
        {spores.map((sp, i) => (
          <circle key={i} ref={(el) => (sporeEls.current[i] = el)} cx={sp.baseX} cy={sp.y} r={sp.r} />
        ))}
      </g>

      {/* chambers */}
      {CHAMBERS.map((ch) => (
        <Chamber key={ch.id} ch={ch} lissData={lissData} waveEls={waveEls} lissEls={lissEls} />
      ))}

      {/* chamber labels — floating SVG text, the only chrome */}
      <g
        fontFamily="Merriweather, serif"
        fontSize={9}
        fill={COLORS.amberLabel}
        textAnchor="middle"
        style={{ letterSpacing: '0.1em' }}
      >
        {CHAMBERS.map((ch) => (
          <text key={ch.id} x={ch.cx} y={ch.cy + ch.ry + 15}>
            {ch.label.toUpperCase()}
          </text>
        ))}
      </g>

      {/* ants on top, pouring through the galleries */}
      <g>
        {ants.map((ant, i) => (
          <g key={i} ref={(el) => (antEls.current[i] = el)}>
            <AntBody ant={ant} />
          </g>
        ))}
      </g>
    </svg>
  )
}

// A single chamber, rendered by type. Liquid + Lissajous chambers register
// their DOM nodes into the shared ref registries for the animation loop.
function Chamber({ ch, lissData, waveEls, lissEls }) {
  const stroke =
    ch.type === 'liquid'
      ? ch.color === 'amber'
        ? COLORS.amber
        : COLORS.fungal
      : ch.type === 'royal'
      ? COLORS.queenLine
      : ch.type === 'dark'
      ? '#5a4326'
      : COLORS.amberSoft

  return (
    <g>
      {ch.type === 'royal' && (
        <ellipse cx={ch.cx} cy={ch.cy} rx={ch.rx * 1.7} ry={ch.ry * 1.7} fill="url(#queenGlow)" />
      )}

      {/* chamber wall */}
      <ellipse
        cx={ch.cx}
        cy={ch.cy}
        rx={ch.rx}
        ry={ch.ry}
        fill={ch.type === 'dark' ? COLORS.waste : '#1a120a55'}
        stroke={stroke}
        strokeWidth={1.4}
        opacity={0.92}
      />

      {/* liquid: two clipped sine surfaces */}
      {ch.type === 'liquid' && (
        <g clipPath={`url(#clip-${ch.id})`}>
          <path
            ref={(el) => {
              waveEls.current[ch.id] = waveEls.current[ch.id] || []
              waveEls.current[ch.id][0] = el
            }}
            fill={ch.color === 'amber' ? COLORS.amberFill : COLORS.fungalFill}
          />
          <path
            ref={(el) => {
              waveEls.current[ch.id] = waveEls.current[ch.id] || []
              waveEls.current[ch.id][1] = el
            }}
            fill={ch.color === 'amber' ? `${COLORS.amber}55` : `${COLORS.fungal}55`}
          />
        </g>
      )}

      {/* lissajous: eggs / larvae floating inside the clip */}
      {(ch.type === 'lissajous' || ch.type === 'royal') && (
        <g clipPath={`url(#clip-${ch.id})`}>
          {lissData[ch.id].map((p, i) => (
            <circle
              key={i}
              ref={(el) => {
                lissEls.current[ch.id] = lissEls.current[ch.id] || []
                lissEls.current[ch.id][i] = el
              }}
              cx={ch.cx}
              cy={ch.cy}
              r={p.r}
              fill={
                ch.particles === 'larva'
                  ? `${COLORS.cream}cc`
                  : ch.type === 'royal'
                  ? `${COLORS.queenLine}cc`
                  : `${COLORS.cream}aa`
              }
            />
          ))}
          {ch.type === 'royal' && (
            // the queen: a larger, still ellipse at the chamber's heart
            <ellipse cx={ch.cx} cy={ch.cy} rx={16} ry={7} fill={`${COLORS.queenLine}aa`} />
          )}
        </g>
      )}

      {ch.type === 'entrance' && (
        <ellipse cx={ch.cx} cy={ch.cy} rx={ch.rx * 0.5} ry={ch.ry * 0.5} fill="#0a0704" />
      )}
    </g>
  )
}
