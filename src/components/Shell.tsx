import { useState, useCallback } from 'react'
import PowerWash from './games/PowerWash'
import UnlockModal from './UnlockModal'

const GAMES = [
  { id: 'powerwash', label: 'POWER WASH', free: true },
  { id: 'sand',      label: 'SAND',        free: false },
  { id: 'rain',      label: 'RAIN',        free: false },
  { id: 'leaves',    label: 'LEAVES',      free: false },
  { id: 'snow',      label: 'SNOW',        free: false },
  { id: 'tide',      label: 'TIDE',        free: false },
]

interface Props {
  lightMode: boolean
  onToggleLight: () => void
}

export default function Shell({ lightMode, onToggleLight }: Props) {
  const [activeGame, setActiveGame] = useState('powerwash')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showUnlock, setShowUnlock] = useState(false)

  const handleProgress = useCallback((pct: number) => {
    setProgress(pct)
  }, [])

  const cream = 'rgba(237,226,206,0.88)'
  const terracotta = '#b84828'
  const shellBg = lightMode ? '#f0e6d6' : '#0c0806'
  const textColor = lightMode ? '#1a0f00' : cream

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: '100svh',
        background: shellBg,
        color: textColor,
        fontFamily: "'Cormorant Garamond', serif",
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Canvas area */}
      <div className="relative flex justify-center w-full" style={{ flex: '1 1 auto' }}>
        {/* Game canvas */}
        <div className="relative w-full flex justify-center" style={{ maxWidth: 800 }}>
          <PowerWash soundEnabled={soundEnabled} onProgress={handleProgress} />

          {/* Wordmark — overlaid top-left */}
          <div
            className="absolute top-4 left-4 select-none pointer-events-none"
            style={{
              color: cream,
              fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)',
              fontWeight: 300,
              letterSpacing: '0.08em',
              textShadow: '0 1px 6px rgba(0,0,0,0.6)',
              lineHeight: 1,
            }}
          >
            brain <em>rinse</em>
          </div>

          {/* Controls — overlaid top-right */}
          <div className="absolute top-3 right-3 flex gap-2">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(v => !v)}
              aria-label="Toggle sound"
              style={{
                background: 'rgba(12,8,6,0.45)',
                border: '1px solid rgba(237,226,206,0.2)',
                borderRadius: 6,
                padding: '6px 10px',
                color: cream,
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                backdropFilter: 'blur(4px)',
              }}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Light mode toggle */}
            <button
              onClick={onToggleLight}
              aria-label="Toggle light mode"
              style={{
                background: 'rgba(12,8,6,0.45)',
                border: '1px solid rgba(237,226,206,0.2)',
                borderRadius: 6,
                padding: '6px 10px',
                color: cream,
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                backdropFilter: 'blur(4px)',
              }}
            >
              {lightMode ? '🌙' : '☀️'}
            </button>
          </div>

          {/* Progress bar — 2px terracotta line along bottom of canvas */}
          <div
            className="absolute bottom-0 left-0 h-[2px] transition-all duration-200"
            style={{ width: `${progress * 100}%`, background: terracotta }}
          />
        </div>
      </div>

      {/* Shelf */}
      <div
        style={{
          background: lightMode ? '#e8d4bc' : '#0a0604',
          borderTop: `1px solid ${lightMode ? 'rgba(0,0,0,0.08)' : 'rgba(237,226,206,0.08)'}`,
        }}
      >
        {/* Stats row */}
        <div className="flex items-center justify-between px-4 py-3" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              fontSize: 'clamp(2rem, 8vw, 3rem)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: textColor,
              opacity: 0.9,
            }}
          >
            {Math.round(progress * 100)}
            <span style={{ fontSize: '0.4em', opacity: 0.6, marginLeft: '0.2em' }}>%</span>
          </div>

          <button
            onClick={() => setShowUnlock(true)}
            style={{
              border: `1px solid ${terracotta}`,
              color: terracotta,
              background: 'transparent',
              borderRadius: 4,
              padding: '7px 18px',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
              letterSpacing: '0.18em',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Unlock all
          </button>
        </div>

        {/* Tab row */}
        <div
          className="flex overflow-x-auto"
          style={{
            maxWidth: 800,
            margin: '0 auto',
            borderTop: `1px solid ${lightMode ? 'rgba(0,0,0,0.06)' : 'rgba(237,226,206,0.06)'}`,
          }}
        >
          {GAMES.map(game => {
            const isActive = game.id === activeGame
            return (
              <button
                key={game.id}
                onClick={() => {
                  if (game.free) setActiveGame(game.id)
                  else setShowUnlock(true)
                }}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  padding: '10px 4px 8px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(0.55rem, 1.8vw, 0.7rem)',
                  letterSpacing: '0.16em',
                  color: isActive
                    ? terracotta
                    : game.free
                    ? textColor
                    : lightMode ? 'rgba(0,0,0,0.3)' : 'rgba(237,226,206,0.3)',
                  background: 'transparent',
                  border: 'none',
                  borderTop: isActive ? `2px solid ${terracotta}` : '2px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {!game.free && (
                  <span style={{ marginRight: 3, fontSize: '0.9em', opacity: 0.5 }}>🔒</span>
                )}
                {game.label}
              </button>
            )
          })}
        </div>
      </div>
      {showUnlock && <UnlockModal onClose={() => setShowUnlock(false)} />}
    </div>
  )
}
