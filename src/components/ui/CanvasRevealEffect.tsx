'use client'

import { useEffect, useRef } from 'react'

type RGB = [number, number, number]

type Props = {
  colors?: RGB[]
  dotSize?: number
  gap?: number
  speed?: number
  opacities?: number[]
  showGradient?: boolean
  className?: string
  containerClassName?: string
}

const DEFAULT_OPACITIES = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]

function hash2(x: number, y: number): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)
  h = (h ^ (h >>> 13)) | 0
  h = Math.imul(h, 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

export function CanvasRevealEffect({
  colors = [[255, 255, 255]],
  dotSize = 3,
  gap = 18,
  speed = 1,
  opacities = DEFAULT_OPACITIES,
  showGradient = true,
  className,
  containerClassName,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let cellPx = gap
    let dotPx = dotSize
    let dpr = 1

    let inView = false
    let startedAt: number | null = null
    let rafId = 0
    let lastFrame = 0

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cellPx = gap
      dotPx = dotSize
      cols = Math.ceil(width / cellPx) + 1
      rows = Math.ceil(height / cellPx) + 1
    }

    const draw = (now: number) => {
      rafId = requestAnimationFrame(draw)
      if (!inView) return
      if (now - lastFrame < 1000 / 60) return
      lastFrame = now
      if (startedAt === null) startedAt = now

      const elapsed = (now - startedAt) / 1000
      const t = reducedMotion ? 1000 : elapsed * speed * 0.5

      ctx.clearRect(0, 0, width, height)

      const cx = cols / 2
      const cy = rows / 2
      const dotOffset = (cellPx - dotPx) / 2

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const dx = i - cx
          const dy = j - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const showOffset = hash2(i + 1, j + 1)
          const reveal = dist * 0.02 + showOffset * 0.15

          if (t < reveal) continue

          const frequency = 5
          const bucket = Math.floor(t / frequency + showOffset + frequency)
          const flick = hash2((i + 1) * 31 + bucket, (j + 1) * 17 + bucket * 13)
          const opIdx = Math.min(opacities.length - 1, Math.max(0, Math.floor(flick * opacities.length)))
          let alpha = opacities[opIdx]

          const fadeIn = Math.min(1, (t - reveal) / 0.5)
          alpha *= fadeIn
          if (alpha <= 0.01) continue

          const palette = colors.length > 0 ? colors : ([[255, 255, 255]] as RGB[])
          const color = palette[Math.floor(showOffset * palette.length) % palette.length]

          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`
          ctx.fillRect(
            i * cellPx + dotOffset,
            j * cellPx + dotOffset,
            dotPx,
            dotPx,
          )
        }
      }
    }

    resize()

    const ro = new ResizeObserver(() => {
      resize()
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting
        }
      },
      { threshold: 0.05 },
    )
    io.observe(wrap)

    rafId = requestAnimationFrame(draw)

    return () => {
      ro.disconnect()
      io.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [colors, dotSize, gap, speed, opacities])

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${containerClassName ?? ''}`}
    >
      <canvas ref={canvasRef} className={`block ${className ?? ''}`} />
      {showGradient && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.85)_0%,_rgba(0,0,0,0.4)_45%,_transparent_100%)]" />
      )}
    </div>
  )
}
