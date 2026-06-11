# FORMICARIUM

An interactive ant-colony intelligence visualization. FORMICARIUM renders a living, underground cross-section of a leaf-cutter colony (*Atta cephalotes*) as a single math-driven SVG — chambers, tunnels, and 80+ procedurally drawn ants are all generated from sine, cosine, polar, and parametric-bézier equations in the spirit of Dilum Sanjaya's work. Liquid food and fungal chambers breathe with animated sinusoidal wave fills, eggs and larvae drift on Lissajous paths, spores rise through the galleries, and the colony itself talks back as a distributed superorganism powered by Claude (Fable 5) through the Anthropic Messages API.

## Stack

- **React + Vite**
- **D3** for SVG scales/geometry
- **Tailwind** for layout only
- **Merriweather** (serif labels/headers) + **JetBrains Mono** (data) via Google Fonts
- **Anthropic Messages API** (`claude-fable-5`), called directly from the browser

## Setup

```bash
npm install

# add your Anthropic API key for the Intelligence tab
cp .env.example .env
#   then edit .env and set VITE_ANTHROPIC_API_KEY=sk-ant-...

npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build
```

The colony animates and the Science/Vitals tabs work without a key. The
**Intelligence** tab needs `VITE_ANTHROPIC_API_KEY` set in `.env` — it calls
`https://api.anthropic.com` directly from the browser using
`anthropic-dangerous-direct-browser-access`. That exposes the key to anyone who
opens the page, so this is intended for a **local demo**, not production. For a
public deployment, proxy the call through a small backend that holds the key.

## Layout

Full viewport, no page scroll:

```
┌─────────────────────────────┬──────────────────┐
│   COLONY (underground SVG)   │  SIDE PANEL 300px │
│   surface · depth ruler ·    │  Intelligence ·   │
│   9 chambers · 14 tunnels    │  Science · Vitals │
├─────────────────────────────┴──────────────────┤
│  FORMICARIUM   ·   POP · FOOD · EGGS · DAY       │
└─────────────────────────────────────────────────┘
```

- **Intelligence** — chat with the colony. It speaks in the first-person plural, grounded in real myrmecology, and every reply is conditioned on the live colony state interpolated into the system prompt.
- **Science** — a static bestiary of accurate leaf-cutter myrmecology (architecture, the superorganism, castes, chemical language, fungal cultivation).
- **Vitals** — seven drifting stat bars and a procedurally generated colony event log.

The circular icon button (top-right of the colony) regenerates the colony.

## Project structure

```
src/
  App.jsx                 state, drift/event loops, header, regenerate
  constants.js            palette, colony state, copy pools
  api/claude.js           Anthropic Messages call + colony system prompt
  colony/
    geometry.js           chambers, tunnel béziers, ants, particles (the math)
    ColonySVG.jsx         SVG render + single requestAnimationFrame loop
  panel/
    SidePanel.jsx         tabs
    IntelligenceTab.jsx   colony chat
    ScienceTab.jsx        bestiary
    VitalsTab.jsx         stat bars + event log
```

All animation runs from one `requestAnimationFrame` loop writing DOM attributes
through refs (no per-frame React re-render), so the colony stays smooth.
