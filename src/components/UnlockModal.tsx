import { useState } from 'react'

const GAMES = [
  'Power Wash',
  'Sand',
  'Rain',
  'Leaves',
  'Snow',
  'Tide',
]

interface Props {
  onClose: () => void
}

export default function UnlockModal({ onClose }: Props) {
  const [yearly, setYearly] = useState(false)
  const terracotta = '#b84828'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a100a',
          borderRadius: 8,
          padding: 'clamp(28px, 6vw, 48px)',
          maxWidth: 400,
          width: '100%',
          fontFamily: "'Cormorant Garamond', serif",
          color: 'rgba(237,226,206,0.88)',
          border: '1px solid rgba(237,226,206,0.08)',
        }}
      >
        {/* Headline */}
        <div style={{ fontSize: 44, fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: 8 }}>
          More to still the mind.
        </div>
        <div style={{ fontSize: 13, opacity: 0.55, letterSpacing: '0.22em', marginBottom: 28 }}>
          ALL 6 GAMES · CANCEL ANYTIME
        </div>

        {/* Game list */}
        <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GAMES.map((g, i) => (
            <li key={g} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 300, opacity: i === 0 ? 0.45 : 1 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === 0 ? 'rgba(237,226,206,0.3)' : terracotta,
                flexShrink: 0,
              }} />
              {g}
              {i === 0 && <span style={{ fontSize: 14, opacity: 0.5, marginLeft: 4 }}>free</span>}
            </li>
          ))}
        </ul>

        {/* Price toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(237,226,206,0.06)',
          borderRadius: 6,
          padding: 3,
          marginBottom: 20,
          gap: 3,
        }}>
          {[false, true].map(isYearly => (
            <button
              key={String(isYearly)}
              onClick={() => setYearly(isYearly)}
              style={{
                flex: 1,
                padding: '8px 6px',
                border: 'none',
                borderRadius: 4,
                background: yearly === isYearly ? 'rgba(184,72,40,0.85)' : 'transparent',
                color: 'rgba(237,226,206,0.88)',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 300,
                cursor: 'pointer',
                letterSpacing: '0.08em',
                transition: 'background 0.2s',
              }}
            >
              {isYearly ? '$36 / year' : '$3.99 / month'}
              {isYearly && (
                <span style={{ display: 'block', fontSize: 13, opacity: 0.7, marginTop: 1 }}>
                  saves $12
                </span>
              )}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: terracotta,
            border: 'none',
            borderRadius: 5,
            color: 'rgba(237,226,206,0.95)',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: '18px 40px',
            marginBottom: 10,
          }}
        >
          GET ACCESS
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(237,226,206,0.35)',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14,
            letterSpacing: '0.14em',
            cursor: 'pointer',
          }}
        >
          maybe later
        </button>
      </div>
    </div>
  )
}
