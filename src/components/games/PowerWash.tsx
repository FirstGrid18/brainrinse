import { useRef, useEffect, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

interface Props {
  soundEnabled: boolean
  onProgress: (pct: number) => void
}

const MAX_WIDTH = 800
const RATIO = 3 / 4

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62)
  sky.addColorStop(0, '#6b1a1a')
  sky.addColorStop(0.35, '#c94a1e')
  sky.addColorStop(0.65, '#e07b2a')
  sky.addColorStop(1, '#f5c842')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  // Sun
  const sunX = w * 0.78
  const sunY = h * 0.18
  const sunR = w * 0.06
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.5)
  sunGlow.addColorStop(0, 'rgba(255,240,100,0.9)')
  sunGlow.addColorStop(0.4, 'rgba(255,200,50,0.4)')
  sunGlow.addColorStop(1, 'rgba(255,160,0,0)')
  ctx.fillStyle = sunGlow
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff8c0'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()

  // Arch cutout (clip everything to arch shape)
  const archW = w * 0.72
  const archX = (w - archW) / 2
  const archBaseY = h * 0.62
  const archRadius = archW / 2

  ctx.save()
  ctx.beginPath()
  // Arch: rectangle bottom + semicircle top
  ctx.moveTo(archX, h)
  ctx.lineTo(archX, archBaseY)
  ctx.arc(archX + archRadius, archBaseY, archRadius, Math.PI, 0)
  ctx.lineTo(archX + archW, h)
  ctx.closePath()
  // We don't clip — the arch frame is drawn around the scene

  // Tree silhouettes
  const treeY = h * 0.56
  const treeColor = '#1a0f00'
  const trees = [
    { x: w * 0.08, h: h * 0.22, w: w * 0.04 },
    { x: w * 0.16, h: h * 0.30, w: w * 0.05 },
    { x: w * 0.26, h: h * 0.18, w: w * 0.035 },
    { x: w * 0.68, h: h * 0.25, w: w * 0.04 },
    { x: w * 0.78, h: h * 0.32, w: w * 0.05 },
    { x: w * 0.88, h: h * 0.20, w: w * 0.04 },
  ]
  trees.forEach(t => {
    ctx.fillStyle = treeColor
    // Trunk
    ctx.fillRect(t.x - t.w * 0.15, treeY - t.h, t.w * 0.3, t.h)
    // Canopy (triangle-ish)
    ctx.beginPath()
    ctx.moveTo(t.x - t.w * 0.6, treeY - t.h * 0.5)
    ctx.lineTo(t.x, treeY - t.h * 1.35)
    ctx.lineTo(t.x + t.w * 0.6, treeY - t.h * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(t.x - t.w * 0.5, treeY - t.h * 0.85)
    ctx.lineTo(t.x, treeY - t.h * 1.6)
    ctx.lineTo(t.x + t.w * 0.5, treeY - t.h * 0.85)
    ctx.closePath()
    ctx.fill()
  })
  ctx.restore()

  // Arch frame
  ctx.save()
  const frameColor = '#d4a76a'
  const frameW = w * 0.04

  // Left pillar
  ctx.fillStyle = frameColor
  ctx.fillRect(archX - frameW, h * 0.58, frameW, h * 0.42)
  // Right pillar
  ctx.fillRect(archX + archW, h * 0.58, frameW, h * 0.42)

  // Arch border (ring)
  ctx.strokeStyle = frameColor
  ctx.lineWidth = frameW
  ctx.beginPath()
  ctx.arc(archX + archRadius, archBaseY, archRadius + frameW / 2, Math.PI, 0)
  ctx.stroke()

  // Decorative arch detail: inner ring
  ctx.strokeStyle = '#b8833a'
  ctx.lineWidth = frameW * 0.3
  ctx.beginPath()
  ctx.arc(archX + archRadius, archBaseY, archRadius - frameW * 0.6, Math.PI, 0)
  ctx.stroke()
  ctx.restore()

  // Gold border strip between arch and floor
  const borderY = h * 0.62
  const borderH = h * 0.03
  const grad = ctx.createLinearGradient(0, borderY, 0, borderY + borderH)
  grad.addColorStop(0, '#d4a020')
  grad.addColorStop(0.5, '#f0c040')
  grad.addColorStop(1, '#c08820')
  ctx.fillStyle = grad
  ctx.fillRect(0, borderY, w, borderH)

  // Tiled floor
  const floorY = borderY + borderH
  const floorH = h - floorY
  const tileSize = w / 8
  const tileRows = Math.ceil(floorH / tileSize) + 1

  for (let row = 0; row < tileRows; row++) {
    for (let col = 0; col < 8; col++) {
      const tx = col * tileSize
      const ty = floorY + row * tileSize
      const isEven = (row + col) % 2 === 0
      ctx.fillStyle = isEven ? '#e8d9b8' : '#3a7a78'
      ctx.fillRect(tx, ty, tileSize, tileSize)

      // Tile inner detail
      const inset = tileSize * 0.12
      if (isEven) {
        ctx.strokeStyle = '#c8b890'
        ctx.lineWidth = 1
        ctx.strokeRect(tx + inset, ty + inset, tileSize - inset * 2, tileSize - inset * 2)
        // Corner accents
        ctx.fillStyle = '#b84828'
        const as = tileSize * 0.08
        ctx.fillRect(tx + inset * 0.5, ty + inset * 0.5, as, as)
        ctx.fillRect(tx + tileSize - inset * 0.5 - as, ty + inset * 0.5, as, as)
        ctx.fillRect(tx + inset * 0.5, ty + tileSize - inset * 0.5 - as, as, as)
        ctx.fillRect(tx + tileSize - inset * 0.5 - as, ty + tileSize - inset * 0.5 - as, as, as)
      } else {
        ctx.strokeStyle = '#2a5a58'
        ctx.lineWidth = 1
        ctx.strokeRect(tx + inset, ty + inset, tileSize - inset * 2, tileSize - inset * 2)
        // Geometric centre pattern
        ctx.strokeStyle = '#4a9a98'
        ctx.beginPath()
        ctx.moveTo(tx + tileSize / 2, ty + inset * 1.5)
        ctx.lineTo(tx + tileSize - inset * 1.5, ty + tileSize / 2)
        ctx.lineTo(tx + tileSize / 2, ty + tileSize - inset * 1.5)
        ctx.lineTo(tx + inset * 1.5, ty + tileSize / 2)
        ctx.closePath()
        ctx.stroke()
      }
    }
  }

  // Tile grid lines
  ctx.strokeStyle = '#c0a860'
  ctx.lineWidth = 1.5
  for (let col = 1; col < 8; col++) {
    ctx.beginPath()
    ctx.moveTo(col * tileSize, floorY)
    ctx.lineTo(col * tileSize, h)
    ctx.stroke()
  }
  for (let row = 0; row <= tileRows; row++) {
    ctx.beginPath()
    ctx.moveTo(0, floorY + row * tileSize)
    ctx.lineTo(w, floorY + row * tileSize)
    ctx.stroke()
  }
}

function drawGrime(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Multi-layer grime for texture
  const g1 = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.8)
  g1.addColorStop(0, 'rgba(28,18,10,0.94)')
  g1.addColorStop(0.6, 'rgba(20,12,6,0.97)')
  g1.addColorStop(1, 'rgba(10,6,2,1)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, w, h)

  // Texture streaks
  ctx.save()
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = Math.random() * 60 + 20
    const streak = ctx.createRadialGradient(x, y, 0, x, y, r)
    streak.addColorStop(0, `rgba(${35 + Math.random() * 20},${20 + Math.random() * 12},${8 + Math.random() * 8},0.3)`)
    streak.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = streak
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.restore()
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  type: 'drop' | 'mist'
}

export default function PowerWash({ soundEnabled, onProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLCanvasElement>(null)
  const grimeRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const { startSpray, stopSpray, playChime } = useAudio()

  const isPointerDown = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const particles = useRef<Particle[]>([])
  const animFrame = useRef<number>(0)
  const frameCount = useRef(0)
  const progressPct = useRef(0)
  const completed = useRef(false)
  const completionShown = useRef(false)

  const getCanvasCoords = useCallback((e: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const spawnParticles = useCallback((x: number, y: number, dx: number, dy: number) => {
    const speed = Math.sqrt(dx * dx + dy * dy)
    const count = Math.min(Math.floor(speed * 0.3 + 3), 10)
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2
      const v = Math.random() * 3 + 1.5
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - Math.random() * 1.5,
        life: 1,
        maxLife: Math.random() * 20 + 15,
        size: Math.random() * 3 + 1,
        type: Math.random() < 0.7 ? 'drop' : 'mist',
      })
    }
    // Limit particle pool
    if (particles.current.length > 200) {
      particles.current = particles.current.slice(-150)
    }
  }, [])

  const eraseGrime = useCallback((x: number, y: number, dx: number, dy: number) => {
    const gCtx = grimeRef.current?.getContext('2d')
    if (!gCtx) return

    const speed = Math.sqrt(dx * dx + dy * dy)
    const baseR = 28 + speed * 0.5

    // Directional oval
    gCtx.save()
    gCtx.globalCompositeOperation = 'destination-out'
    gCtx.translate(x, y)
    if (speed > 1) {
      gCtx.rotate(Math.atan2(dy, dx))
      const stretch = Math.min(1 + speed * 0.04, 2.2)
      gCtx.scale(stretch, 1)
    }
    const grad = gCtx.createRadialGradient(0, 0, 0, 0, 0, baseR)
    grad.addColorStop(0, 'rgba(0,0,0,1)')
    grad.addColorStop(0.6, 'rgba(0,0,0,0.85)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    gCtx.fillStyle = grad
    gCtx.beginPath()
    gCtx.arc(0, 0, baseR, 0, Math.PI * 2)
    gCtx.fill()
    gCtx.restore()
  }, [])

  const sampleProgress = useCallback(() => {
    const gCanvas = grimeRef.current
    if (!gCanvas) return
    const gCtx = gCanvas.getContext('2d')
    if (!gCtx) return
    // Sample a grid of 40x30 points
    const step = 16
    const cols = Math.floor(gCanvas.width / step)
    const rows = Math.floor(gCanvas.height / step)
    const total = cols * rows
    let transparent = 0
    const data = gCtx.getImageData(0, 0, gCanvas.width, gCanvas.height)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = col * step
        const py = row * step
        const idx = (py * gCanvas.width + px) * 4
        if (data.data[idx + 3] < 30) transparent++
      }
    }
    const pct = transparent / total
    progressPct.current = pct
    onProgress(pct)

    if (pct >= 0.9 && !completed.current) {
      completed.current = true
      // Clear remaining grime
      const gc = gCanvas.getContext('2d')
      if (gc) {
        gc.globalCompositeOperation = 'destination-out'
        gc.fillStyle = 'rgba(0,0,0,1)'
        gc.fillRect(0, 0, gCanvas.width, gCanvas.height)
        gc.globalCompositeOperation = 'source-over'
      }
      onProgress(1)
    }
  }, [onProgress])

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw particles
    for (const p of particles.current) {
      const alpha = p.life / p.maxLife
      if (p.type === 'drop') {
        ctx.fillStyle = `rgba(160,210,240,${alpha * 0.85})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = `rgba(200,230,250,${alpha * 0.3})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Completion overlay
    if (completed.current && !completionShown.current) {
      completionShown.current = true
    }
    if (completionShown.current) {
      ctx.fillStyle = 'rgba(237,226,206,0.0)'
      // Fade in handled by CSS opacity on a separate div
    }
  }, [])

  const tick = useCallback(() => {
    // Update particles
    particles.current = particles.current
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.12, life: p.life - 1 }))
      .filter(p => p.life > 0)

    frameCount.current++
    if (frameCount.current % 5 === 0) sampleProgress()

    drawOverlay()
    animFrame.current = requestAnimationFrame(tick)
  }, [sampleProgress, drawOverlay])

  const setupCanvas = useCallback(() => {
    const container = containerRef.current
    const scene = sceneRef.current
    const grime = grimeRef.current
    const overlay = overlayRef.current
    if (!container || !scene || !grime || !overlay) return

    const maxW = Math.min(container.clientWidth, MAX_WIDTH)
    const w = maxW
    const h = Math.round(w * RATIO)

    ;[scene, grime, overlay].forEach(c => {
      c.width = w
      c.height = h
    })

    // Draw scene
    const sCtx = scene.getContext('2d')
    if (sCtx) drawScene(sCtx, w, h)

    // Draw initial grime
    const gCtx = grime.getContext('2d')
    if (gCtx) {
      gCtx.globalCompositeOperation = 'source-over'
      drawGrime(gCtx, w, h)
    }

    completed.current = false
    completionShown.current = false
    progressPct.current = 0
    particles.current = []
  }, [])

  useEffect(() => {
    setupCanvas()
    animFrame.current = requestAnimationFrame(tick)

    const handleResize = () => setupCanvas()
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animFrame.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [setupCanvas, tick])

  // Pointer event handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isPointerDown.current = true
    const canvas = grimeRef.current
    if (!canvas) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    const pos = getCanvasCoords(e.nativeEvent, canvas)
    lastPos.current = pos
    startSpray(soundEnabled)
  }, [getCanvasCoords, startSpray, soundEnabled])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown.current || completed.current) return
    const canvas = grimeRef.current
    if (!canvas) return
    const pos = getCanvasCoords(e.nativeEvent, canvas)
    const last = lastPos.current
    if (!last) { lastPos.current = pos; return }
    const dx = pos.x - last.x
    const dy = pos.y - last.y
    eraseGrime(pos.x, pos.y, dx, dy)
    spawnParticles(pos.x, pos.y, dx, dy)
    lastPos.current = pos
  }, [eraseGrime, spawnParticles])

  const onPointerUp = useCallback(() => {
    isPointerDown.current = false
    lastPos.current = null
    stopSpray()
  }, [stopSpray])

  // Completion chime
  useEffect(() => {
    if (completed.current) {
      playChime(soundEnabled)
    }
  })

  // Watch for completion to play chime once
  const prevCompleted = useRef(false)
  useEffect(() => {
    const check = setInterval(() => {
      if (completed.current && !prevCompleted.current) {
        prevCompleted.current = true
        playChime(soundEnabled)
      }
    }, 100)
    return () => clearInterval(check)
  }, [playChime, soundEnabled])

  return (
    <div ref={containerRef} className="relative w-full flex justify-center" style={{ maxWidth: MAX_WIDTH }}>
      {/* Scene canvas */}
      <canvas ref={sceneRef} className="block w-full" style={{ maxWidth: MAX_WIDTH, aspectRatio: '4/3' }} />

      {/* Grime canvas — layered on top, handles interaction */}
      <canvas
        ref={grimeRef}
        className="absolute inset-0 w-full cursor-crosshair touch-none"
        style={{ maxWidth: MAX_WIDTH, aspectRatio: '4/3' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {/* Particle overlay */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full pointer-events-none"
        style={{ maxWidth: MAX_WIDTH, aspectRatio: '4/3' }}
      />

      {/* Completion message */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000"
        style={{ opacity: completed.current ? 1 : 0 }}
      >
        <div className="text-center" style={{ color: 'rgba(237,226,206,0.92)', fontFamily: "'Cormorant Garamond', serif" }}>
          <div style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 300, letterSpacing: '0.12em' }}>
            RINSED
          </div>
          <div style={{ fontSize: 'clamp(0.85rem,2.5vw,1.1rem)', marginTop: '0.5em', opacity: 0.7, letterSpacing: '0.2em' }}>
            TAP TO PLAY AGAIN
          </div>
        </div>
      </div>
    </div>
  )
}
