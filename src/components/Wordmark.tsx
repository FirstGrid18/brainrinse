interface Props {
  lightMode: boolean
  paused?: boolean
  onGridClick?: () => void
  size?: number
  gap?: number
}

const STAGGER = 0.48

export default function Wordmark({ lightMode, paused = false, onGridClick, size = 9, gap = 3 }: Props) {
  const grid = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${size}px)`,
      gap: `${gap}px`,
      flexShrink: 0,
    }}>
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const isTerracotta = (row + col) % 2 === 0
        const delay = (row + col) * STAGGER
        return (
          <div key={i} style={{
            width: size,
            height: size,
            background: isTerracotta
              ? '#b84828'
              : lightMode ? 'rgba(24,12,4,0.45)' : 'rgba(237,226,206,0.72)',
            animation: `gridPulse 2.4s ease-in-out ${delay}s infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }} />
        )
      })}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Grid mark — clickable when onGridClick is provided */}
      {onGridClick ? (
        <button
          onClick={onGridClick}
          aria-label="Open game selector"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {grid}
        </button>
      ) : grid}

      {/* Text — never interactive */}
      <div style={{ lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 26,
          fontWeight: 400,
          color: lightMode ? 'rgba(24,12,4,0.86)' : 'rgba(237,226,206,0.88)',
          letterSpacing: '0.02em',
        }}>brain </span>
        <em style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 26,
          fontWeight: 500,
          fontStyle: 'italic',
          color: '#b84828',
          letterSpacing: '0.02em',
        }}>rinse</em>
      </div>
    </div>
  )
}
