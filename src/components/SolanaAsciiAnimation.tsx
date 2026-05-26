'use client'

import { useEffect, useRef } from 'react'

// Grid
const GRID_COLS = 50
const GRID_ROWS = 18

// Solana mark — 3 stacked parallelograms with ALTERNATING slants.
// Top and bottom bars slant "\" (indent grows down). Middle bar slants "/"
// (indent shrinks down). All bars span the same horizontal range, matching
// the real Solana logo.
const BAR_COUNT = 3
const BAR_HEIGHT = 4
const BAR_COLS = 36
const BAR_GAP = 2
const ROW_SHEAR = 1
const SLANT_SIZE = (BAR_HEIGHT - 1) * ROW_SHEAR // total horizontal slant
const BAR_TOP = 1
const BAR_LEFT = 5

// Effects
const WAVE_WIDTH = 18
const WAVE_SPEED = 16 // cols per second
const BAR_WAVE_OFFSET = 9
const SPOTLIGHT_RADIUS = 9
const SPARKLE_TIME_SCALE = 4
const SPARKLE_THRESHOLD = 0.982
const SCANLINE_PERIOD = 6.5 // seconds
const SCANLINE_WIDTH = 1.4

const BG_CHARS = ['·', '∙']
const FG_CHARS = ['░', '▒', '▓', '█']

interface PointerState {
  col: number
  row: number
  active: boolean
}

function getBarIndent(bar: number, rowInBar: number): number {
  // Even-indexed bars (0, 2) slant "\" — indent grows with row
  // Odd-indexed bars (1) slant "/" — indent shrinks with row
  if (bar % 2 === 0) {
    return rowInBar * ROW_SHEAR
  }
  return (SLANT_SIZE - rowInBar * ROW_SHEAR)
}

function getBarPos(col: number, row: number): { bar: number; colInBar: number } | null {
  for (let b = 0; b < BAR_COUNT; b++) {
    const top = BAR_TOP + b * (BAR_HEIGHT + BAR_GAP)
    if (row < top || row >= top + BAR_HEIGHT) continue
    const rowInBar = row - top
    const indent = BAR_LEFT + getBarIndent(b, rowInBar)
    if (col >= indent && col < indent + BAR_COLS) {
      return { bar: b, colInBar: col - indent }
    }
  }
  return null
}

function hash(a: number, b: number): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function paintCell(
  ctx: CanvasRenderingContext2D,
  t: number,
  col: number,
  row: number,
  pointer: PointerState,
  cellW: number,
  cellH: number
) {
  const barPos = getBarPos(col, row)
  const inBar = barPos !== null

  // Wave (only in bars)
  let waveFactor = 0
  if (barPos) {
    const cyclePeriod = BAR_COLS + WAVE_WIDTH + BAR_WAVE_OFFSET * BAR_COUNT
    const wavePos = (t * WAVE_SPEED + barPos.bar * BAR_WAVE_OFFSET) % cyclePeriod
    const dist = wavePos - barPos.colInBar
    waveFactor = dist >= 0 && dist <= WAVE_WIDTH ? 1 - dist / WAVE_WIDTH : 0
  }

  // Shimmer — every cell breathes
  const shimmer = 0.5 + 0.5 * Math.sin(t * 2.5 + col * 0.55 + row * 0.45)

  // Sparkle — random cells flash bright
  const sparkleSeed = hash(col + Math.floor(t * SPARKLE_TIME_SCALE), row)
  const sparkle =
    sparkleSeed > SPARKLE_THRESHOLD
      ? (sparkleSeed - SPARKLE_THRESHOLD) / (1 - SPARKLE_THRESHOLD)
      : 0

  // Scanline sweeping top-to-bottom
  const scanlineT = (t % SCANLINE_PERIOD) / SCANLINE_PERIOD
  const scanlineRow = scanlineT * GRID_ROWS
  const scanlineDist = Math.abs(row - scanlineRow)
  const scanlineFactor =
    scanlineDist < SCANLINE_WIDTH ? (1 - scanlineDist / SCANLINE_WIDTH) * 0.5 : 0

  // Spotlight (hover)
  let spotlight = 0
  if (pointer.active) {
    const sdx = col - pointer.col
    const sdy = (row - pointer.row) * 2
    const sdist = Math.sqrt(sdx * sdx + sdy * sdy)
    spotlight = sdist < SPOTLIGHT_RADIUS ? 1 - sdist / SPOTLIGHT_RADIUS : 0
  }

  const baseIntensity = inBar ? 0.32 + shimmer * 0.1 : shimmer * 0.05
  const intensity = Math.max(
    baseIntensity,
    waveFactor,
    sparkle,
    scanlineFactor,
    spotlight
  )

  if (intensity < 0.04) return

  // Color: purple → green across columns
  const colProgress = col / GRID_COLS
  let hue = 268 - colProgress * 110
  let saturation = inBar ? 75 : 60
  let lightness = inBar ? 24 + shimmer * 8 : 6 + shimmer * 3

  if (waveFactor > 0) {
    hue -= waveFactor * 45
    saturation = lerp(saturation, 95, waveFactor)
    lightness += waveFactor * 42
  }
  if (sparkle > 0) {
    lightness = lerp(lightness, 92, sparkle)
    saturation = lerp(saturation, 100, sparkle)
  }
  if (scanlineFactor > 0) {
    lightness = lerp(lightness, 55, scanlineFactor)
  }
  if (spotlight > 0) {
    hue = lerp(hue, 105, spotlight)
    saturation = lerp(saturation, 100, spotlight)
    lightness = lerp(lightness, 82, spotlight)
  }

  const chars = inBar ? FG_CHARS : BG_CHARS
  const charIdx = Math.min(Math.floor(intensity * chars.length), chars.length - 1)

  ctx.fillStyle = `hsl(${hue.toFixed(0)} ${saturation.toFixed(0)}% ${lightness.toFixed(0)}%)`
  ctx.fillText(chars[charIdx], col * cellW, row * cellH)
}

export default function SolanaAsciiAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef<PointerState>({ col: 0, row: 0, active: false })

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxRef = canvasEl.getContext('2d')
    if (!ctxRef) return
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxRef

    let rafId = 0
    let mounted = true
    let cellW = 8.4
    let cellH = 15.4
    let fontSize = 14

    function setup() {
      const isSmall = window.innerWidth < 768
      fontSize = isSmall ? 9 : 14
      cellW = fontSize * 0.6
      cellH = fontSize * 1.1

      const cssWidth = GRID_COLS * cellW
      const cssHeight = GRID_ROWS * cellH
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.ceil(cssWidth * dpr)
      canvas.height = Math.ceil(cssHeight * dpr)
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`
      ctx.textBaseline = 'top'
    }

    const start = performance.now()

    function render(now: number) {
      if (!mounted) return
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, GRID_COLS * cellW, GRID_ROWS * cellH)

      const pointer = pointerRef.current
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          paintCell(ctx, t, col, row, pointer, cellW, cellH)
        }
      }

      rafId = requestAnimationFrame(render)
    }

    setup()

    function startLoop() {
      if (!mounted) return
      rafId = requestAnimationFrame(render)
    }
    if (document.fonts?.load) {
      document.fonts.load(`${fontSize}px "JetBrains Mono"`).then(startLoop, startLoop)
    } else {
      startLoop()
    }

    const onResize = () => setup()
    window.addEventListener('resize', onResize)

    return () => {
      mounted = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cellW = rect.width / GRID_COLS
    const cellH = rect.height / GRID_ROWS
    if (cellW <= 0 || cellH <= 0) return
    pointerRef.current = {
      col: (event.clientX - rect.left) / cellW,
      row: (event.clientY - rect.top) / cellH,
      active: true,
    }
  }

  function handlePointerLeave() {
    pointerRef.current.active = false
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="ascii-anim block cursor-crosshair select-none"
    />
  )
}
