import { scaleLinear, range } from 'd3'

// ── World ────────────────────────────────────────────────────────────────
export const VIEW = { w: 1000, h: 760 }
export const SURFACE_Y = 60 // soil line; everything below is underground
export const DEPTH_MAX = 8 // metres

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]

// Maps metres of depth → y in the SVG. Used by the ruler and (implicitly) by
// chamber placement so the cross-section is dimensionally honest.
export const depthScale = scaleLinear().domain([0, DEPTH_MAX]).range([SURFACE_Y, 745])
export const depthTicks = range(0, DEPTH_MAX + 1)

// ── Chambers ─────────────────────────────────────────────────────────────
// type:  liquid    → sinusoidal wave fill (food / fungus)
//        lissajous → particles float on Lissajous paths (eggs / larvae)
//        royal     → lissajous + violet glow, the largest chamber
//        dark      → flat dark fill (waste)
//        entrance  → small surface ellipse
// fillKey ties a liquid/lissajous chamber's level/density to live colony state.
export const CHAMBERS = [
  { id: 'entrance', label: 'Entrance', type: 'entrance', cx: 500, cy: 56, rx: 24, ry: 15 },
  { id: 'nurseryI', label: 'Nursery I', type: 'lissajous', cx: 250, cy: 182, rx: 72, ry: 52, particles: 'egg', fillKey: 'broodDev' },
  { id: 'fungalI', label: 'Fungal Garden I', type: 'liquid', cx: 772, cy: 200, rx: 76, ry: 56, color: 'fungal', fillKey: 'fungus' },
  { id: 'royal', label: 'Royal Chamber', type: 'royal', cx: 500, cy: 332, rx: 108, ry: 82, particles: 'egg', fillKey: 'queenHealth' },
  { id: 'fungalII', label: 'Fungal Garden II', type: 'liquid', cx: 198, cy: 384, rx: 72, ry: 54, color: 'fungal', fillKey: 'fungus' },
  { id: 'foodI', label: 'Food Storage I', type: 'liquid', cx: 812, cy: 412, rx: 72, ry: 56, color: 'amber', fillKey: 'food' },
  { id: 'foodII', label: 'Food Storage II', type: 'liquid', cx: 500, cy: 562, rx: 78, ry: 56, color: 'amber', fillKey: 'food' },
  { id: 'waste', label: 'Waste Chamber', type: 'dark', cx: 222, cy: 600, rx: 62, ry: 46 },
  { id: 'deepNursery', label: 'Deep Nursery', type: 'lissajous', cx: 780, cy: 612, rx: 74, ry: 54, particles: 'larva', fillKey: 'broodDev' },
]

export const chamberById = Object.fromEntries(CHAMBERS.map((c) => [c.id, c]))

// ── Tunnels (quadratic béziers between chamber centres) ──────────────────
// Each connection bows by a perpendicular offset so the network reads as
// excavated galleries rather than straight pipes. Pure parametric curves.
const LINKS = [
  ['entrance', 'nurseryI', 40],
  ['entrance', 'royal', -10],
  ['entrance', 'fungalI', -40],
  ['nurseryI', 'royal', 30],
  ['royal', 'fungalI', -30],
  ['royal', 'fungalII', 26],
  ['nurseryI', 'fungalII', 24],
  ['royal', 'foodI', -28],
  ['fungalI', 'foodI', 30],
  ['royal', 'foodII', 18],
  ['fungalII', 'waste', 24],
  ['foodII', 'waste', 26],
  ['foodII', 'deepNursery', -22],
  ['foodI', 'deepNursery', 28],
]

function buildTunnel([fromId, toId, bow]) {
  const a = chamberById[fromId]
  const b = chamberById[toId]
  const mx = (a.cx + b.cx) / 2
  const my = (a.cy + b.cy) / 2
  const dx = b.cx - a.cx
  const dy = b.cy - a.cy
  const len = Math.hypot(dx, dy) || 1
  // unit normal, scaled by the bow factor → control point
  const cx = mx + (-dy / len) * bow
  const cy = my + (dx / len) * bow
  return {
    from: fromId,
    to: toId,
    x0: a.cx, y0: a.cy,
    cx, cy,
    x1: b.cx, y1: b.cy,
    d: `M ${a.cx} ${a.cy} Q ${cx} ${cy} ${b.cx} ${b.cy}`,
  }
}

export const TUNNELS = LINKS.map(buildTunnel)

// Adjacency: for each chamber, which tunnel indices touch it. Ants use this
// to choose a new gallery when they reach a chamber.
export const ADJACENCY = (() => {
  const map = {}
  CHAMBERS.forEach((c) => (map[c.id] = []))
  TUNNELS.forEach((t, i) => {
    map[t.from].push(i)
    map[t.to].push(i)
  })
  return map
})()

// Point + tangent on a quadratic bézier.
export function tunnelPoint(t, tn) {
  const u = 1 - t
  const x = u * u * tn.x0 + 2 * u * t * tn.cx + t * t * tn.x1
  const y = u * u * tn.y0 + 2 * u * t * tn.cy + t * t * tn.y1
  const dx = 2 * u * (tn.cx - tn.x0) + 2 * t * (tn.x1 - tn.cx)
  const dy = 2 * u * (tn.cy - tn.y0) + 2 * t * (tn.y1 - tn.cy)
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

// ── Ants ─────────────────────────────────────────────────────────────────
export function buildAnts(count = 84) {
  return range(count).map(() => {
    const tunnel = (Math.random() * TUNNELS.length) | 0
    return {
      tunnel,
      t: Math.random(),
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: rand(0.0016, 0.0042),
      carries: Math.random() < 0.3, // 30% haul a leaf fragment
      tint: Math.random() < 0.5 ? 'antBody' : 'antBodyAlt',
      scale: rand(0.85, 1.2),
      leafAngle: rand(-25, 25),
    }
  })
}

// Advance one ant along its tunnel; at an endpoint, 40% switch galleries,
// otherwise reverse. Mutates the ant in place (called from the RAF loop).
export function stepAnt(ant) {
  ant.t += ant.dir * ant.speed
  if (ant.t > 1 || ant.t < 0) {
    const tn = TUNNELS[ant.tunnel]
    const arrivedAt = ant.t > 1 ? tn.to : tn.from
    ant.t = ant.t > 1 ? 1 : 0
    if (Math.random() < 0.4) {
      const options = ADJACENCY[arrivedAt]
      const next = pick(options)
      const nt = TUNNELS[next]
      ant.tunnel = next
      if (nt.from === arrivedAt) {
        ant.t = 0
        ant.dir = 1
      } else {
        ant.t = 1
        ant.dir = -1
      }
    } else {
      ant.dir *= -1
    }
  }
}

// ── Lissajous particles (eggs / larvae) ──────────────────────────────────
// cx = A·sin(seed1 + t),  cy = B·sin(seed2 + t) — drifting inside the chamber.
export function buildLissajous(chamber, count) {
  const A = chamber.rx * 0.62
  const B = chamber.ry * 0.62
  return range(count).map(() => ({
    cx: chamber.cx,
    cy: chamber.cy,
    seed1: Math.random() * TAU,
    seed2: Math.random() * TAU,
    sp1: rand(0.6, 1.3),
    sp2: rand(0.6, 1.3),
    A: A * rand(0.4, 1),
    B: B * rand(0.4, 1),
    r: chamber.particles === 'larva' ? rand(2.4, 3.6) : rand(1.6, 2.6),
  }))
}

// ── Ambient spores ───────────────────────────────────────────────────────
// Tiny motes drifting upward through the tunnels on a slow sinusoidal sway.
export function buildSpores(count = 40) {
  return range(count).map(() => ({
    baseX: rand(120, 880),
    y: rand(SURFACE_Y, VIEW.h),
    amp: rand(4, 16),
    phase: Math.random() * TAU,
    sway: rand(0.4, 1.1),
    rise: rand(0.18, 0.5),
    r: rand(0.8, 1.8),
  }))
}

// ── Surface grass blades ─────────────────────────────────────────────────
// SVG lines with sin-based tilt; HSL greens in the 95–130° band.
export function buildGrass(count = 130) {
  return range(count).map((i) => {
    const x = (i / count) * VIEW.w + rand(-3, 3)
    const h = rand(8, 22)
    const tilt = Math.sin(i * 0.6) * 6 + rand(-2, 2)
    const hue = 95 + Math.random() * 35
    const sat = 50 + Math.random() * 10
    const light = 16 + Math.random() * 12
    return { x, y2: SURFACE_Y - h, tilt, color: `hsl(${hue} ${sat}% ${light}%)` }
  })
}

export const TAU_CONST = TAU
