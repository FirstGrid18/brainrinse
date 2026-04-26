import { useState, useCallback, useRef } from 'react'
import PowerWash from './games/PowerWash'
import UnlockModal from './UnlockModal'
import Wordmark from './Wordmark'

const GAMES = [
  { id: 'powerwash', label: 'POWER WASH', free: true,  bg: '#1e1008' },
  { id: 'sand',      label: 'SAND',        free: false, bg: '#1a1508' },
  { id: 'rain',      label: 'RAIN',        free: false, bg: '#080e18' },
  { id: 'leaves',    label: 'LEAVES',      free: false, bg: '#0a1408' },
  { id: 'snow',      label: 'SNOW',        free: false, bg: '#0e1018' },
  { id: 'tide',      label: 'TIDE',        free: false, bg: '#081418' },
]

const STAGGER = 0.48

// Small checkerboard grid used inside the floating trigger
function MiniGrid({ lightMode, paused }: { lightMode: boolean; paused: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 5px)',
      gap: '2px',
      flexShrink: 0,
    }}>
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const isTerracotta = (row + col) % 2 === 0
        const delay = (row + col) * STAGGER
        return (
          <div key={i} style={{
            width: 5,
            height: 5,
            background: isTerracotta
              ? '#b84828'
              : lightMode ? 'rgba(24,12,4,0.45)' : 'rgba(237,226,206,0.55)',
            animation: `gridPulse 2.4s ease-in-out ${delay}s infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }} />
        )
      })}
    </div>
  )
}

interface Props {
  lightMode: boolean
  onToggleLight: () => void
}

export default function Shell({ lightMode, onToggleLight }: Props) {
  const [activeGame, setActiveGame] = useState('powerwash')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showUnlock, setShowUnlock] = useState(false)
  const [shelfHidden, setShelfHidden] = useState(false)
  const [showGameRow, setShowGameRow] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const shelfTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleProgress = useCallback((pct: number) => setProgress(pct), [])

  const handlePlayStart = useCallback(() => {
    if (shelfTimer.current) clearTimeout(shelfTimer.current)
    setShelfHidden(true)
    setIsPlaying(true)
  }, [])

  const handlePlayEnd = useCallback(() => {
    if (shelfTimer.current) clearTimeout(shelfTimer.current)
    shelfTimer.current = setTimeout(() => setShelfHidden(false), 2000)
    setIsPlaying(false)
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
      {/* ── Canvas area ─────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: '72vh' }}>
        <div className="relative w-full h-full">
          <PowerWash
            soundEnabled={soundEnabled}
            onProgress={handleProgress}
            onPlayStart={handlePlayStart}
            onPlayEnd={handlePlayEnd}
          />

          {/* Wordmark — top left */}
          <div
            className="absolute select-none pointer-events-none"
            style={{ top: 14, left: 16 }}
          >
            <Wordmark lightMode={lightMode} paused={isPlaying} />
          </div>

          {/* Controls — top right */}
          <div className="absolute top-3 right-3 flex gap-2">
            {[
              { label: soundEnabled ? 'SOUND ON' : 'SOUND OFF', onClick: () => setSoundEnabled(v => !v) },
              { label: lightMode ? 'LIGHT' : 'DARK', onClick: onToggleLight },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                style={{
                  background: 'transparent',
                  border: `1px solid ${terracotta}`,
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: 'rgba(237,226,206,0.8)',
                  cursor: 'pointer',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  backdropFilter: 'blur(4px)',
                  whiteSpace: 'nowrap',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Progress bar along canvas bottom */}
          <div
            className="absolute bottom-0 left-0 h-[2px] transition-all duration-200"
            style={{ width: `${progress * 100}%`, background: terracotta }}
          />
        </div>
      </div>

      {/* ── Slim bar: progress % + Unlock All ───────────────────────── */}
      <div
        style={{
          height: 52,
          flexShrink: 0,
          background: '#0c0806',
          borderTop: '1px solid rgba(237,226,206,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          transform: shelfHidden ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 48,
          fontWeight: 300,
          lineHeight: 1,
          color: cream,
          letterSpacing: '-0.02em',
        }}>
          {Math.round(progress * 100)}
          <span style={{ fontSize: '0.35em', opacity: 0.5, marginLeft: '0.15em' }}>%</span>
        </div>

        <button
          onClick={() => setShowUnlock(true)}
          style={{
            border: `1px solid ${terracotta}`,
            color: terracotta,
            background: 'transparent',
            borderRadius: 4,
            padding: '6px 16px',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 13,
            letterSpacing: '0.18em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Unlock all
        </button>
      </div>

      {/* ── Backdrop (behind game row, above canvas) ─────────────────── */}
      <div
        onClick={() => setShowGameRow(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.55)',
          opacity: showGameRow ? 1 : 0,
          pointerEvents: showGameRow ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── Game card row — slides up from bottom ────────────────────── */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 72,
          zIndex: 50,
          background: '#0c0806',
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
          padding: '16px 20px',
          transform: showGameRow ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.35s ease',
          pointerEvents: showGameRow ? 'auto' : 'none',
        }}
      >
        {GAMES.map(game => {
          const isActive = game.id === activeGame
          return (
            <button
              key={game.id}
              onClick={() => {
                if (game.free) {
                  setActiveGame(game.id)
                  setShowGameRow(false)
                } else {
                  setShowGameRow(false)
                  setTimeout(() => setShowUnlock(true), 50)
                }
              }}
              style={{
                width: 130,
                height: 90,
                borderRadius: 10,
                background: game.bg,
                border: `1px solid ${isActive ? terracotta : 'rgba(237,226,206,0.07)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '10px 8px',
                flexShrink: 0,
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 15,
                letterSpacing: '0.1em',
                color: 'rgba(237,226,206,0.82)',
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {game.label}
              </div>
              {game.free ? (
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#4a8068',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}>
                  FREE
                </div>
              ) : (
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11,
                  color: 'rgba(237,226,206,0.28)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  ⊠ UNLOCK
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Floating trigger — fixed bottom centre ───────────────────── */}
      <button
        onClick={() => setShowGameRow(v => !v)}
        style={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 55,
          background: '#1a1008',
          border: '1px solid rgba(237,226,206,0.12)',
          borderRadius: 50,
          padding: '10px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <MiniGrid lightMode={lightMode} paused={isPlaying} />
        <span style={{
          color: 'rgba(237,226,206,0.45)',
          fontSize: 12,
          letterSpacing: '0.1em',
          lineHeight: 1,
          display: 'inline-block',
          transform: showGameRow ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          marginTop: showGameRow ? 2 : -2,
        }}>
          ∧
        </span>
      </button>

      {showUnlock && <UnlockModal onClose={() => setShowUnlock(false)} />}
    </div>
  )
}
