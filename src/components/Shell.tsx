import { useState, useCallback } from 'react'
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

const NAV_H = 52

interface Props {
  lightMode: boolean
  onToggleLight: () => void
}

export default function Shell({ lightMode, onToggleLight }: Props) {
  const [activeGame, setActiveGame]       = useState('powerwash')
  const [soundEnabled, setSoundEnabled]   = useState(true)
  const [progress, setProgress]           = useState(0)
  const [showUnlock, setShowUnlock]       = useState(false)
  const [showSelector, setShowSelector]   = useState(false)
  const [isPlaying, setIsPlaying]         = useState(false)

  const handleProgress  = useCallback((pct: number) => setProgress(pct), [])
  const handlePlayStart = useCallback(() => setIsPlaying(true), [])
  const handlePlayEnd   = useCallback(() => setIsPlaying(false), [])

  const terracotta = '#b84828'
  const navBg      = lightMode ? '#f0e6d6' : '#0c0806'
  const navBorder  = lightMode ? 'rgba(24,12,4,0.06)' : 'rgba(237,226,206,0.06)'

  const pillBtn = (label: string, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
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
        textTransform: 'uppercase' as const,
        lineHeight: 1,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {label}
    </button>
  )

  const gameCard = (game: typeof GAMES[0]) => {
    const isActive = game.id === activeGame
    return (
      <button
        key={game.id}
        onClick={() => {
          if (game.free) {
            setActiveGame(game.id)
            setShowSelector(false)
          } else {
            setShowSelector(false)
            setTimeout(() => setShowUnlock(true), 60)
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
  }

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif" }}>

      {/* ── Top navbar ────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: NAV_H,
        zIndex: 100,
        background: navBg,
        borderBottom: `1px solid ${navBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        transition: 'background 0.3s',
      }}>
        {/* Left: animated wordmark — grid is the selector trigger */}
        <Wordmark
          lightMode={lightMode}
          paused={isPlaying}
          onGridClick={() => setShowSelector(v => !v)}
        />

        {/* Right: sound + light pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {pillBtn(soundEnabled ? 'SOUND ON' : 'SOUND OFF', () => setSoundEnabled(v => !v))}
          {pillBtn(lightMode ? 'LIGHT' : 'DARK', onToggleLight)}
        </div>
      </div>

      {/* ── Game canvas — fills everything below navbar ───────────────── */}
      <div style={{
        position: 'fixed',
        top: NAV_H,
        left: 0, right: 0, bottom: 0,
      }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <PowerWash
            soundEnabled={soundEnabled}
            onProgress={handleProgress}
            onPlayStart={handlePlayStart}
            onPlayEnd={handlePlayEnd}
          />

          {/* Progress bar — 2px terracotta overlay at canvas bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 2,
              width: `${progress * 100}%`,
              background: terracotta,
              transition: 'width 0.2s linear',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* ── Game selector backdrop ────────────────────────────────────── */}
      <div
        onClick={() => setShowSelector(false)}
        style={{
          position: 'fixed',
          top: NAV_H, left: 0, right: 0, bottom: 0,
          zIndex: 90,
          background: 'rgba(0,0,0,0.45)',
          opacity: showSelector ? 1 : 0,
          pointerEvents: showSelector ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* ── Game selector dropdown — drops from navbar, left-aligned ──── */}
      <div
        style={{
          position: 'fixed',
          top: NAV_H,
          left: 16,
          zIndex: 95,
          background: '#1a1008',
          border: '1px solid rgba(237,226,206,0.1)',
          borderRadius: '0 0 12px 12px',
          padding: 14,
          display: 'flex',
          gap: 10,
          transform: showSelector ? 'translateY(0)' : 'translateY(-6px)',
          opacity: showSelector ? 1 : 0,
          pointerEvents: showSelector ? 'auto' : 'none',
          transition: 'transform 0.25s ease, opacity 0.25s ease',
        }}
      >
        {GAMES.map(gameCard)}
      </div>

      {showUnlock && <UnlockModal onClose={() => setShowUnlock(false)} />}
    </div>
  )
}
