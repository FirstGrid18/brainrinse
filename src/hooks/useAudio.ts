import { useRef, useCallback } from 'react'

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  const startSpray = useCallback((enabled: boolean) => {
    if (!enabled) return
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()

    // Create white noise buffer
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    // Highpass to cut rumble
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1200

    // Bandpass for pressure washer character
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000
    bp.Q.value = 0.8

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08)

    source.connect(hp)
    hp.connect(bp)
    bp.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    noiseNodeRef.current = source
    gainRef.current = gain
  }, [getCtx])

  const stopSpray = useCallback(() => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    const node = noiseNodeRef.current
    if (!ctx || !gain || !node) return

    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12)
    setTimeout(() => {
      try { node.stop() } catch {}
    }, 150)
    noiseNodeRef.current = null
    gainRef.current = null
  }, [])

  const playChime = useCallback((enabled: boolean) => {
    if (!enabled) return
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()

    // C E G C ascending
    const freqs = [523.25, 659.25, 783.99, 1046.5]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.7)
    })
  }, [getCtx])

  return { startSpray, stopSpray, playChime }
}
