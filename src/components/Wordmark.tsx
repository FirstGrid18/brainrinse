interface Props {
  lightMode: boolean
  size?: number   // square size in px (default 9)
  gap?: number    // gap in px (default 3)
}

export default function Wordmark({ lightMode, size = 9, gap = 3 }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* 3×3 checkerboard grid mark */}
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
          return (
            <div key={i} style={{
              width: size,
              height: size,
              background: isTerracotta
                ? '#b84828'
                : lightMode ? 'rgba(24,12,4,0.45)' : 'rgba(237,226,206,0.72)',
            }} />
          )
        })}
      </div>

      {/* Text: brain rinse */}
      <div style={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          fontWeight: 400,
          color: lightMode ? 'rgba(24,12,4,0.86)' : 'rgba(237,226,206,0.88)',
          letterSpacing: '0.02em',
        }}>brain </span>
        <em style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          fontWeight: 500,
          fontStyle: 'italic',
          color: '#b84828',
          letterSpacing: '0.02em',
        }}>rinse</em>
      </div>
    </div>
  )
}
