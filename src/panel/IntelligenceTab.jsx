import { useEffect, useRef, useState } from 'react'
import { COLORS, QUICK_QUERIES } from '../constants.js'
import { sendToColony } from '../api/claude.js'

// Three amber dots bouncing on sine timing: y = 4·sin(t + i·π/3).
function ThinkingDots() {
  const refs = useRef([])
  useEffect(() => {
    let raf
    let t = 0
    const tick = () => {
      t += 0.12
      refs.current.forEach((el, i) => {
        if (el) el.setAttribute('cy', (8 + 4 * Math.sin(t + (i * Math.PI) / 3)).toFixed(2))
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <svg width="34" height="16" aria-label="the colony is sensing">
      {[0, 1, 2].map((i) => (
        <circle key={i} ref={(el) => (refs.current[i] = el)} cx={5 + i * 12} cy={8} r={2.4} fill={COLORS.amber} />
      ))}
    </svg>
  )
}

export default function IntelligenceTab({ colony }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    const nextHistory = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextHistory)
    setInput('')
    setBusy(true)
    try {
      const reply = await sendToColony(nextHistory, colony)
      setMessages([...nextHistory, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages([...nextHistory, { role: 'error', content: err.message }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* conversation */}
      <div ref={scrollRef} className="panel-scroll flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="font-serif text-[12px] italic leading-relaxed" style={{ color: '#9a8c6e' }}>
            We are {colony.population.toLocaleString()} bodies and one mind. Address the colony — of the
            queen, the foragers, the gardens, the threat at the gate.
          </p>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {busy && (
            <div className="self-start">
              <ThinkingDots />
            </div>
          )}
        </div>
      </div>

      {/* quick queries */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-2 pt-1">
        {QUICK_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={busy}
            className="font-mono text-[10px] disabled:opacity-40"
            style={{
              color: COLORS.amberSoft,
              border: `1px solid ${COLORS.line}`,
              borderRadius: '2px',
              padding: '3px 7px',
              background: 'transparent',
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-stretch gap-2 px-4 pb-4 pt-1"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="signal the colony…"
          className="font-mono flex-1 bg-transparent text-[12px] outline-none"
          style={{
            color: COLORS.cream,
            borderBottom: `1px solid ${COLORS.line}`,
            padding: '4px 0',
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="send"
          className="disabled:opacity-30"
          style={{ background: 'transparent', cursor: 'pointer' }}
        >
          {/* parametric arrow glyph */}
          <svg width="22" height="22" viewBox="-11 -11 22 22">
            <circle r="10" fill="none" stroke={COLORS.amberSoft} strokeWidth="1" />
            <path d="M -4 0 L 4 0 M 1 -3 L 4 0 L 1 3" fill="none" stroke={COLORS.amber} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  )
}

function Bubble({ role, content }) {
  if (role === 'user') {
    return (
      <div className="self-end max-w-[88%]">
        <p
          className="font-mono text-[11px] leading-relaxed"
          style={{ color: COLORS.cream, borderRight: `2px solid ${COLORS.amberSoft}`, paddingRight: 8, textAlign: 'right' }}
        >
          {content}
        </p>
      </div>
    )
  }
  const isError = role === 'error'
  return (
    <div className="self-start max-w-[92%]">
      <p
        className="font-serif text-[12px] leading-relaxed"
        style={{
          color: isError ? '#c98b5a' : COLORS.cream,
          borderLeft: `2px solid ${isError ? '#7a4b2a' : COLORS.fungal}`,
          paddingLeft: 9,
          fontStyle: isError ? 'italic' : 'normal',
        }}
      >
        {content}
      </p>
    </div>
  )
}
