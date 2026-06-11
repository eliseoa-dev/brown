import { useState } from 'react'
import { COLORS } from '../constants.js'
import IntelligenceTab from './IntelligenceTab.jsx'
import ScienceTab from './ScienceTab.jsx'
import VitalsTab from './VitalsTab.jsx'

const TABS = [
  { id: 'intel', label: 'Intelligence' },
  { id: 'science', label: 'Science' },
  { id: 'vitals', label: 'Vitals' },
]

export default function SidePanel({ colony, events }) {
  const [active, setActive] = useState('intel')

  return (
    <div className="flex h-full flex-col" style={{ borderLeft: `1px solid ${COLORS.line}` }}>
      {/* tab bar — 2px amber underline on active, no other chrome */}
      <div className="flex" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        {TABS.map((tab) => {
          const on = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="font-serif flex-1 text-[10px] uppercase"
              style={{
                color: on ? COLORS.amber : '#7a6c4e',
                letterSpacing: '0.12em',
                padding: '12px 4px',
                background: 'transparent',
                borderBottom: on ? `2px solid ${COLORS.amber}` : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1">
        {active === 'intel' && <IntelligenceTab colony={colony} />}
        {active === 'science' && <ScienceTab />}
        {active === 'vitals' && <VitalsTab colony={colony} events={events} />}
      </div>
    </div>
  )
}
