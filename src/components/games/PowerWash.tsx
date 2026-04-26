import { useRef, useEffect, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

interface Props {
  soundEnabled: boolean
  onProgress: (pct: number) => void
  onPlayStart: () => void
  onPlayEnd: () => void
}


// Draws a proper Moorish horseshoe arch path.
// The arch sweeps past the horizontal on each side, creating the characteristic
// inward curve at the base before rising to the crown.
function horseshoeArchClipPath(
  ctx: CanvasRenderingContext2D,
  cx: number,       // horizontal center
  springY: number,  // y where columns meet the arch
  R: number,        // arch radius (> half column gap = horseshoe)
  colL: number,     // left column inner edge x
  colR: number,     // right column inner edge x
  floorY: number,   // floor level
) {
  // The center of the circle sits at springY so the arch sweeps below it
  const overshoot = Math.asin((cx - colL) / R)       // angle to column inner edge
  const startAngle = Math.PI + overshoot              // left haunch start (below horiz)
  const endAngle   = -overshoot                       // right haunch end (mirror)

  const lx = cx + R * Math.cos(startAngle)
  const ly = springY + R * Math.sin(startAngle)
  const ry = springY + R * Math.sin(endAngle)

  ctx.beginPath()
  ctx.moveTo(colL, floorY)
  ctx.lineTo(colL, ly)
  ctx.lineTo(lx, ly)
  ctx.arc(cx, springY, R, startAngle, endAngle, false)
  ctx.lineTo(colR, ry)
  ctx.lineTo(colR, floorY)
  ctx.closePath()
}

// Draws an organic cypress silhouette using bezier curves
function drawCypress(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  height: number, width: number,
) {
  ctx.beginPath()
  ctx.moveTo(x, baseY - height)
  // Right side — slightly irregular
  ctx.bezierCurveTo(
    x + width * 0.55, baseY - height * 0.82,
    x + width * 0.70, baseY - height * 0.55,
    x + width * 0.38, baseY - height * 0.28,
  )
  ctx.bezierCurveTo(
    x + width * 0.62, baseY - height * 0.18,
    x + width * 0.28, baseY - height * 0.06,
    x + width * 0.14, baseY,
  )
  // Left side — mirror with slight variation
  ctx.lineTo(x - width * 0.14, baseY)
  ctx.bezierCurveTo(
    x - width * 0.28, baseY - height * 0.06,
    x - width * 0.62, baseY - height * 0.18,
    x - width * 0.38, baseY - height * 0.28,
  )
  ctx.bezierCurveTo(
    x - width * 0.70, baseY - height * 0.55,
    x - width * 0.55, baseY - height * 0.82,
    x, baseY - height,
  )
  ctx.closePath()
  ctx.fill()
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // ── Layout constants ──────────────────────────────────────────────────────
  const borderY  = h * 0.55           // gold strip top edge (sky = top 55%)
  const borderH  = 8                  // gold strip height (fixed 8px)
  const floorY   = borderY + borderH  // tile floor starts here

  // Arch geometry
  const colW     = w * 0.06           // pillar/column width
  const frameW   = colW               // sandstone frame width
  const innerW   = w * 0.68           // gap between column inner edges
  const colL     = (w - innerW) / 2   // left column inner edge
  const colR     = colL + innerW      // right column inner edge
  const cx       = w / 2              // arch center x
  const springY  = borderY            // arch meets columns at the gold strip
  const R        = innerW * 0.56      // horseshoe radius — larger than innerW/2

  const sandstone = '#c89050'
  const sandDark  = '#a07030'
  const sandLight = '#e8b870'

  // ── 1. Terracotta brick walls ─────────────────────────────────────────────
  const wallGrad = ctx.createLinearGradient(0, 0, 0, h)
  wallGrad.addColorStop(0,   '#7a2a18')
  wallGrad.addColorStop(0.4, '#6a2014')
  wallGrad.addColorStop(1,   '#4e1a10')
  ctx.fillStyle = wallGrad
  ctx.fillRect(0, 0, w, h)

  // Horizontal brick lines across full wall
  ctx.strokeStyle = 'rgba(40,12,6,0.45)'
  ctx.lineWidth = 1
  const brickH = h * 0.038
  for (let by = brickH; by < h; by += brickH) {
    ctx.beginPath()
    ctx.moveTo(0, by)
    ctx.lineTo(w, by)
    ctx.stroke()
  }
  // Brick vertical joints — staggered per row
  ctx.strokeStyle = 'rgba(40,12,6,0.25)'
  ctx.lineWidth = 0.75
  const brickW = w * 0.12
  for (let row = 0; row * brickH < h; row++) {
    const offset = (row % 2) * brickW * 0.5
    for (let bx = offset; bx < w; bx += brickW) {
      ctx.beginPath()
      ctx.moveTo(bx, row * brickH)
      ctx.lineTo(bx, (row + 1) * brickH)
      ctx.stroke()
    }
  }
  // Subtle wall highlight on upper area
  const wallTop = ctx.createLinearGradient(0, 0, 0, h * 0.3)
  wallTop.addColorStop(0, 'rgba(200,100,60,0.12)')
  wallTop.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = wallTop
  ctx.fillRect(0, 0, w, h * 0.3)

  // ── 2. Clip and draw sky, sun, trees inside the arch ─────────────────────
  ctx.save()
  horseshoeArchClipPath(ctx, cx, springY, R, colL, colR, floorY)
  ctx.clip()

  // Sky: deep crimson → burnt orange → warm amber
  const sky = ctx.createLinearGradient(0, 0, 0, springY)
  sky.addColorStop(0,    '#3a0808')
  sky.addColorStop(0.25, '#8a1c0c')
  sky.addColorStop(0.5,  '#c83818')
  sky.addColorStop(0.75, '#d86520')
  sky.addColorStop(1,    '#e8a030')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, springY)

  // Horizon haze glow
  const haze = ctx.createLinearGradient(0, springY * 0.75, 0, springY)
  haze.addColorStop(0, 'rgba(230,150,40,0)')
  haze.addColorStop(1, 'rgba(230,150,40,0.28)')
  ctx.fillStyle = haze
  ctx.fillRect(0, springY * 0.75, w, springY * 0.25)

  // Sun — large, soft, upper right inside arch
  const sunX  = cx + innerW * 0.28
  const sunY  = springY * 0.2
  const sunR  = innerW * 0.085
  // Outer halo
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4.5)
  sunGlow.addColorStop(0,    'rgba(255,240,140,0.9)')
  sunGlow.addColorStop(0.18, 'rgba(255,210,60,0.6)')
  sunGlow.addColorStop(0.4,  'rgba(255,160,20,0.25)')
  sunGlow.addColorStop(0.7,  'rgba(200,80,10,0.08)')
  sunGlow.addColorStop(1,    'rgba(180,40,0,0)')
  ctx.fillStyle = sunGlow
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 4.5, 0, Math.PI * 2)
  ctx.fill()
  // Sun disc
  const sunDisc = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, 0, sunX, sunY, sunR)
  sunDisc.addColorStop(0, '#fffce0')
  sunDisc.addColorStop(0.6, '#fff0a0')
  sunDisc.addColorStop(1, '#f8d040')
  ctx.fillStyle = sunDisc
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()

  // Cypress trees — 7 organic silhouettes at varying heights
  const treeBaseY = springY * 0.91
  const treeColor = '#0a0400'
  type CypDef = { x: number; h: number; w: number }
  const cyps: CypDef[] = [
    { x: colL + innerW * 0.04, h: springY * 0.32, w: innerW * 0.038 },
    { x: colL + innerW * 0.14, h: springY * 0.44, w: innerW * 0.044 },
    { x: colL + innerW * 0.24, h: springY * 0.26, w: innerW * 0.032 },
    { x: colL + innerW * 0.37, h: springY * 0.38, w: innerW * 0.040 },
    { x: colL + innerW * 0.63, h: springY * 0.28, w: innerW * 0.034 },
    { x: colL + innerW * 0.76, h: springY * 0.46, w: innerW * 0.046 },
    { x: colL + innerW * 0.88, h: springY * 0.33, w: innerW * 0.038 },
  ]
  ctx.fillStyle = treeColor
  cyps.forEach(t => drawCypress(ctx, t.x, treeBaseY, t.h, t.w))

  // Ground band at horizon — dark earth below trees
  const ground = ctx.createLinearGradient(0, treeBaseY, 0, springY)
  ground.addColorStop(0, 'rgba(8,4,0,0.85)')
  ground.addColorStop(1, 'rgba(8,4,0,0)')
  ctx.fillStyle = ground
  ctx.fillRect(0, treeBaseY, w, springY - treeBaseY)

  ctx.restore()

  // ── 3. Sandstone arch frame ───────────────────────────────────────────────
  ctx.save()

  // Column fills (left and right pillars, full height)
  const colGrad = ctx.createLinearGradient(0, 0, frameW, 0)
  colGrad.addColorStop(0, sandDark)
  colGrad.addColorStop(0.3, sandstone)
  colGrad.addColorStop(1, sandDark)
  ctx.fillStyle = colGrad
  ctx.fillRect(colL - frameW, 0, frameW, h)
  ctx.fillRect(colR, 0, frameW, h)

  // Column inner edge highlight
  ctx.strokeStyle = sandLight
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(colL, 0); ctx.lineTo(colL, springY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(colR, 0); ctx.lineTo(colR, springY); ctx.stroke()

  // Arch band — stroke the horseshoe with thick sandstone line
  // Build the outer arch path (slightly larger R for the outer ring)
  const archStrokeR = R + frameW * 0.5
  const overshootOuter = Math.asin((cx - colL + frameW) / archStrokeR)
  ctx.strokeStyle = sandstone
  ctx.lineWidth = frameW
  ctx.lineCap = 'butt'
  ctx.beginPath()
  ctx.arc(cx, springY, archStrokeR, Math.PI + overshootOuter, -overshootOuter, false)
  ctx.stroke()

  // Inner decorative edge line (lighter)
  const archInnerR = R - frameW * 0.08
  const overshootInner = Math.asin((cx - colL) / archInnerR)
  ctx.strokeStyle = sandLight
  ctx.lineWidth = frameW * 0.15
  ctx.beginPath()
  ctx.arc(cx, springY, archInnerR, Math.PI + overshootInner, -overshootInner, false)
  ctx.stroke()

  // Outer edge shadow line
  ctx.strokeStyle = sandDark
  ctx.lineWidth = frameW * 0.12
  ctx.beginPath()
  ctx.arc(cx, springY, archStrokeR + frameW * 0.48, Math.PI + overshootOuter, -overshootOuter, false)
  ctx.stroke()

  // Column outer shadow lines
  ctx.strokeStyle = sandDark
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(colL - frameW, 0); ctx.lineTo(colL - frameW, h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(colR + frameW, 0); ctx.lineTo(colR + frameW, h); ctx.stroke()

  ctx.restore()

  // ── 4. Gold border strip ──────────────────────────────────────────────────
  const goldGrad = ctx.createLinearGradient(0, borderY, 0, borderY + borderH)
  goldGrad.addColorStop(0,   '#c89020')
  goldGrad.addColorStop(0.4, '#f0c040')
  goldGrad.addColorStop(0.7, '#d4a020')
  goldGrad.addColorStop(1,   '#a07010')
  ctx.fillStyle = goldGrad
  ctx.fillRect(0, borderY, w, borderH)
  // Top glint
  ctx.strokeStyle = 'rgba(255,235,120,0.8)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, borderY + 0.5); ctx.lineTo(w, borderY + 0.5); ctx.stroke()
  // Bottom shadow
  ctx.strokeStyle = 'rgba(60,30,0,0.5)'
  ctx.beginPath(); ctx.moveTo(0, borderY + borderH - 0.5); ctx.lineTo(w, borderY + borderH - 0.5); ctx.stroke()

  // ── 5. Zellige tile floor — 14 columns, small tiles ───────────────────────
  const tileSize  = w / 14
  const tileRows  = Math.ceil((h - floorY) / tileSize) + 1

  for (let row = 0; row < tileRows; row++) {
    for (let col = 0; col < 14; col++) {
      const tx = col * tileSize
      const ty = floorY + row * tileSize
      const isEven = (row + col) % 2 === 0

      // Base tile
      ctx.fillStyle = isEven ? '#ddd0a8' : '#1e5c5a'
      ctx.fillRect(tx, ty, tileSize, tileSize)

      const pad = tileSize * 0.1
      const mid = tileSize / 2

      if (isEven) {
        // Cream tile — inset border + terracotta corner squares
        ctx.strokeStyle = '#b89a60'
        ctx.lineWidth = 0.75
        ctx.strokeRect(tx + pad, ty + pad, tileSize - pad * 2, tileSize - pad * 2)
        // Terracotta corner accents
        const ac = tileSize * 0.1
        ctx.fillStyle = '#b84828'
        ctx.fillRect(tx + pad * 0.3, ty + pad * 0.3, ac, ac)
        ctx.fillRect(tx + tileSize - pad * 0.3 - ac, ty + pad * 0.3, ac, ac)
        ctx.fillRect(tx + pad * 0.3, ty + tileSize - pad * 0.3 - ac, ac, ac)
        ctx.fillRect(tx + tileSize - pad * 0.3 - ac, ty + tileSize - pad * 0.3 - ac, ac, ac)
        // Centre diamond
        const ds = tileSize * 0.13
        ctx.fillStyle = '#c8a868'
        ctx.beginPath()
        ctx.moveTo(tx + mid, ty + mid - ds)
        ctx.lineTo(tx + mid + ds, ty + mid)
        ctx.lineTo(tx + mid, ty + mid + ds)
        ctx.lineTo(tx + mid - ds, ty + mid)
        ctx.closePath()
        ctx.fill()
      } else {
        // Teal tile — inset border + inner diamond outline
        ctx.strokeStyle = '#145250'
        ctx.lineWidth = 0.75
        ctx.strokeRect(tx + pad, ty + pad, tileSize - pad * 2, tileSize - pad * 2)
        ctx.strokeStyle = '#50c0bc'
        ctx.lineWidth = 0.75
        ctx.beginPath()
        ctx.moveTo(tx + mid, ty + pad * 1.2)
        ctx.lineTo(tx + tileSize - pad * 1.2, ty + mid)
        ctx.lineTo(tx + mid, ty + tileSize - pad * 1.2)
        ctx.lineTo(tx + pad * 1.2, ty + mid)
        ctx.closePath()
        ctx.stroke()
        // Centre dot
        ctx.fillStyle = '#3aacaa'
        const cd = tileSize * 0.07
        ctx.beginPath()
        ctx.arc(tx + mid, ty + mid, cd, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // Grout lines
  ctx.strokeStyle = 'rgba(180,150,60,0.55)'
  ctx.lineWidth = 1
  for (let col = 1; col < 14; col++) {
    ctx.beginPath(); ctx.moveTo(col * tileSize, floorY); ctx.lineTo(col * tileSize, h); ctx.stroke()
  }
  for (let row = 0; row <= tileRows; row++) {
    ctx.beginPath(); ctx.moveTo(0, floorY + row * tileSize); ctx.lineTo(w, floorY + row * tileSize); ctx.stroke()
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

export default function PowerWash({ soundEnabled, onProgress, onPlayStart, onPlayEnd }: Props) {
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
    const baseR = 17 + speed * 0.3

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
    onPlayStart()
  }, [getCanvasCoords, startSpray, soundEnabled, onPlayStart])

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
    onPlayEnd()
  }, [stopSpray, onPlayEnd])

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
