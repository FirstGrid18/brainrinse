import { useRef, useEffect, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

interface Props {
  soundEnabled: boolean
  onProgress: (pct: number) => void
}


function archPath(ctx: CanvasRenderingContext2D, archX: number, archBaseY: number, archRadius: number, archW: number, h: number) {
  ctx.beginPath()
  ctx.moveTo(archX, h)
  ctx.lineTo(archX, archBaseY)
  ctx.arc(archX + archRadius, archBaseY, archRadius, Math.PI, 0)
  ctx.lineTo(archX + archW, h)
  ctx.closePath()
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const archW = w * 0.72
  const archX = (w - archW) / 2
  const archBaseY = h * 0.56
  const archRadius = archW / 2
  const frameColor = '#c8944a'
  const frameW = w * 0.045

  // --- 1. Wall background (outside the arch) ---
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h)
  wallGrad.addColorStop(0, '#2a1808')
  wallGrad.addColorStop(1, '#1a0e06')
  ctx.fillStyle = wallGrad
  ctx.fillRect(0, 0, w, h)

  // Wall texture — subtle noise patches
  ctx.save()
  for (let i = 0; i < 60; i++) {
    const wx = Math.random() * w
    const wy = Math.random() * h
    const wr = Math.random() * 40 + 10
    const wg = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr)
    wg.addColorStop(0, `rgba(${60 + Math.random() * 30},${30 + Math.random() * 20},${10 + Math.random() * 10},0.18)`)
    wg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = wg
    ctx.fillRect(wx - wr, wy - wr, wr * 2, wr * 2)
  }
  ctx.restore()

  // --- 2. Inside the arch: sky, sun, trees ---
  ctx.save()
  archPath(ctx, archX, archBaseY, archRadius, archW, h * 0.62)
  ctx.clip()

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, archBaseY)
  sky.addColorStop(0, '#5c1010')
  sky.addColorStop(0.3, '#c03a18')
  sky.addColorStop(0.65, '#e07228')
  sky.addColorStop(1, '#f0b830')
  ctx.fillStyle = sky
  ctx.fillRect(archX, 0, archW, archBaseY + archRadius)

  // Sun glow
  const sunX = archX + archW * 0.76
  const sunY = archBaseY * 0.22
  const sunR = archW * 0.065
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3)
  sunGlow.addColorStop(0, 'rgba(255,248,180,1)')
  sunGlow.addColorStop(0.25, 'rgba(255,210,60,0.7)')
  sunGlow.addColorStop(0.6, 'rgba(255,160,20,0.25)')
  sunGlow.addColorStop(1, 'rgba(255,120,0,0)')
  ctx.fillStyle = sunGlow
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff8c0'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()

  // Horizon haze
  const haze = ctx.createLinearGradient(0, archBaseY * 0.72, 0, archBaseY)
  haze.addColorStop(0, 'rgba(240,170,60,0)')
  haze.addColorStop(1, 'rgba(240,170,60,0.22)')
  ctx.fillStyle = haze
  ctx.fillRect(archX, archBaseY * 0.72, archW, archBaseY * 0.28)

  // Tree silhouettes along horizon
  const treeBaseY = archBaseY * 0.88
  const treeColor = '#0e0600'
  type TreeDef = { x: number; th: number; tw: number }
  const trees: TreeDef[] = [
    { x: archX + archW * 0.06, th: archBaseY * 0.28, tw: archW * 0.045 },
    { x: archX + archW * 0.18, th: archBaseY * 0.38, tw: archW * 0.055 },
    { x: archX + archW * 0.30, th: archBaseY * 0.22, tw: archW * 0.038 },
    { x: archX + archW * 0.62, th: archBaseY * 0.30, tw: archW * 0.045 },
    { x: archX + archW * 0.76, th: archBaseY * 0.40, tw: archW * 0.055 },
    { x: archX + archW * 0.90, th: archBaseY * 0.24, tw: archW * 0.042 },
  ]
  trees.forEach(t => {
    ctx.fillStyle = treeColor
    // Trunk
    const trunkW = t.tw * 0.22
    ctx.fillRect(t.x - trunkW / 2, treeBaseY - t.th * 0.5, trunkW, t.th * 0.5)
    // Upper canopy
    ctx.beginPath()
    ctx.moveTo(t.x - t.tw * 0.55, treeBaseY - t.th * 0.45)
    ctx.lineTo(t.x, treeBaseY - t.th * 1.4)
    ctx.lineTo(t.x + t.tw * 0.55, treeBaseY - t.th * 0.45)
    ctx.closePath()
    ctx.fill()
    // Lower canopy (wider)
    ctx.beginPath()
    ctx.moveTo(t.x - t.tw * 0.75, treeBaseY - t.th * 0.18)
    ctx.lineTo(t.x, treeBaseY - t.th * 0.92)
    ctx.lineTo(t.x + t.tw * 0.75, treeBaseY - t.th * 0.18)
    ctx.closePath()
    ctx.fill()
  })

  ctx.restore()

  // --- 3. Arch frame (drawn on top of the clip area) ---
  ctx.save()

  // Left pillar
  ctx.fillStyle = frameColor
  ctx.fillRect(archX - frameW, archBaseY - frameW * 0.5, frameW, h - archBaseY + frameW * 0.5)
  // Right pillar
  ctx.fillRect(archX + archW, archBaseY - frameW * 0.5, frameW, h - archBaseY + frameW * 0.5)

  // Arch ring — outer
  ctx.strokeStyle = frameColor
  ctx.lineWidth = frameW
  ctx.beginPath()
  ctx.arc(archX + archRadius, archBaseY, archRadius + frameW / 2, Math.PI, 0)
  ctx.stroke()

  // Arch ring — inner decorative line
  ctx.strokeStyle = '#a06830'
  ctx.lineWidth = frameW * 0.22
  ctx.beginPath()
  ctx.arc(archX + archRadius, archBaseY, archRadius - frameW * 0.65, Math.PI, 0)
  ctx.stroke()

  // Outer decorative line
  ctx.strokeStyle = '#e0b870'
  ctx.lineWidth = frameW * 0.18
  ctx.beginPath()
  ctx.arc(archX + archRadius, archBaseY, archRadius + frameW * 1.1, Math.PI, 0)
  ctx.stroke()

  // Pillar edge highlights
  ctx.strokeStyle = '#e0b870'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(archX - frameW, archBaseY)
  ctx.lineTo(archX - frameW, h)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(archX + archW + frameW, archBaseY)
  ctx.lineTo(archX + archW + frameW, h)
  ctx.stroke()

  ctx.restore()

  // --- 4. Gold border strip ---
  const borderY = h * 0.62
  const borderH = h * 0.028
  const grad = ctx.createLinearGradient(0, borderY, 0, borderY + borderH)
  grad.addColorStop(0, '#d4a020')
  grad.addColorStop(0.5, '#f0c040')
  grad.addColorStop(1, '#b07818')
  ctx.fillStyle = grad
  ctx.fillRect(0, borderY, w, borderH)

  // Gold border fine lines
  ctx.strokeStyle = '#f8d860'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, borderY + 1)
  ctx.lineTo(w, borderY + 1)
  ctx.stroke()
  ctx.strokeStyle = '#8a5c10'
  ctx.beginPath()
  ctx.moveTo(0, borderY + borderH - 1)
  ctx.lineTo(w, borderY + borderH - 1)
  ctx.stroke()

  // --- 5. Tiled floor ---
  const floorY = borderY + borderH
  const floorH = h - floorY
  const tileSize = w / 8
  const tileRows = Math.ceil(floorH / tileSize) + 1

  for (let row = 0; row < tileRows; row++) {
    for (let col = 0; col < 8; col++) {
      const tx = col * tileSize
      const ty = floorY + row * tileSize
      const isEven = (row + col) % 2 === 0
      ctx.fillStyle = isEven ? '#e2d4b0' : '#2e6a68'
      ctx.fillRect(tx, ty, tileSize, tileSize)

      const inset = tileSize * 0.11
      if (isEven) {
        // Inner border
        ctx.strokeStyle = '#c0a070'
        ctx.lineWidth = 1
        ctx.strokeRect(tx + inset, ty + inset, tileSize - inset * 2, tileSize - inset * 2)
        // Terracotta corner accents
        ctx.fillStyle = '#b84828'
        const as = tileSize * 0.09
        ctx.fillRect(tx + inset * 0.4, ty + inset * 0.4, as, as)
        ctx.fillRect(tx + tileSize - inset * 0.4 - as, ty + inset * 0.4, as, as)
        ctx.fillRect(tx + inset * 0.4, ty + tileSize - inset * 0.4 - as, as, as)
        ctx.fillRect(tx + tileSize - inset * 0.4 - as, ty + tileSize - inset * 0.4 - as, as, as)
        // Centre dot
        ctx.fillStyle = '#c8a870'
        const ds = tileSize * 0.06
        ctx.fillRect(tx + tileSize / 2 - ds / 2, ty + tileSize / 2 - ds / 2, ds, ds)
      } else {
        // Inner border
        ctx.strokeStyle = '#1e5250'
        ctx.lineWidth = 1
        ctx.strokeRect(tx + inset, ty + inset, tileSize - inset * 2, tileSize - inset * 2)
        // Diamond geometric pattern
        ctx.strokeStyle = '#4aaca8'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(tx + tileSize / 2, ty + inset * 1.4)
        ctx.lineTo(tx + tileSize - inset * 1.4, ty + tileSize / 2)
        ctx.lineTo(tx + tileSize / 2, ty + tileSize - inset * 1.4)
        ctx.lineTo(tx + inset * 1.4, ty + tileSize / 2)
        ctx.closePath()
        ctx.stroke()
        // Centre diamond fill
        ctx.fillStyle = '#3a8a88'
        const cs = tileSize * 0.07
        ctx.beginPath()
        ctx.moveTo(tx + tileSize / 2, ty + tileSize / 2 - cs)
        ctx.lineTo(tx + tileSize / 2 + cs, ty + tileSize / 2)
        ctx.lineTo(tx + tileSize / 2, ty + tileSize / 2 + cs)
        ctx.lineTo(tx + tileSize / 2 - cs, ty + tileSize / 2)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  // Tile grout lines
  ctx.strokeStyle = '#b89850'
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
  g1.addColorStop(0, 'rgba(22,14,8,1)')
  g1.addColorStop(0.6, 'rgba(16,10,4,1)')
  g1.addColorStop(1, 'rgba(8,4,2,1)')
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
  const hasInteracted = useRef(false)
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

    if (!hasInteracted.current) return

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

    const w = container.clientWidth
    const h = container.clientHeight

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
    hasInteracted.current = false
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
    hasInteracted.current = true
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
    <div ref={containerRef} className="absolute inset-0">
      {/* Scene canvas */}
      <canvas ref={sceneRef} className="absolute inset-0 w-full h-full block" />

      {/* Grime canvas — layered on top, handles interaction */}
      <canvas
        ref={grimeRef}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {/* Particle overlay */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
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
