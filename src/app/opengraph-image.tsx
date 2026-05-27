import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Solana Builders Club'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Mirrors the canvas animation's color ramp. In the full canvas the hue runs
// 268°→158°, but bars only occupy the BAR_LEFT..BAR_LEFT+BAR_COLS slice of
// that grid, so the actual hue range inside bars is ~257°→171° — a muted
// indigo→blue→teal instead of the bright Solana purple/green.
const GRADIENT_HUE_START = 257
const GRADIENT_HUE_END = 171
const BAR_SATURATION = 75
const BAR_LIGHTNESS = 28
const DOT_SATURATION = 65
const DOT_LIGHTNESS = 50

function barColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const hue = GRADIENT_HUE_START + (GRADIENT_HUE_END - GRADIENT_HUE_START) * clamped
  return `hsl(${hue.toFixed(0)}, ${BAR_SATURATION}%, ${BAR_LIGHTNESS}%)`
}

export default async function Image() {
  // Fonts are co-located with the route so the OG never hits the network at
  // request time. `new URL(..., import.meta.url)` resolves to the bundled
  // asset path in both edge and node runtimes.
  const [interSemiBold, jetbrainsMono, jetbrainsMonoBold] = await Promise.all([
    fetch(new URL('./_og-fonts/inter-semibold.ttf', import.meta.url)).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL('./_og-fonts/jetbrains-mono-regular.ttf', import.meta.url)).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL('./_og-fonts/jetbrains-mono-bold.ttf', import.meta.url)).then((res) =>
      res.arrayBuffer()
    ),
  ])

  // Solana mark — 3 stacked parallelograms with alternating slants,
  // mirroring the geometry of the landing's canvas ASCII animation.
  const BAR_HEIGHT = 5
  const BAR_COLS = 22
  const BAR_GAP = 2
  const ROW_SHEAR = 1
  const SLANT_SIZE = (BAR_HEIGHT - 1) * ROW_SHEAR

  const CELL = 12
  const ROW_H = CELL - 1 // 1px gap between rows in the same bar (visible banding)
  const TRAIL_PAD = 4 * CELL // horizontal room for dot trails on each side
  const TOTAL_COLS = BAR_COLS + SLANT_SIZE
  const TOTAL_ROWS = 3 * BAR_HEIGHT + 2 * BAR_GAP
  const BARS_INNER_W = TOTAL_COLS * CELL
  const ART_W = BARS_INNER_W + 2 * TRAIL_PAD
  const ART_H = TOTAL_ROWS * CELL
  const BAR_W = BAR_COLS * CELL

  type BarRow = { x: number; y: number; rowGlobal: number }
  const barRows: BarRow[] = []
  for (let b = 0; b < 3; b++) {
    for (let i = 0; i < BAR_HEIGHT; i++) {
      const indent = b % 2 === 0 ? i * ROW_SHEAR : SLANT_SIZE - i * ROW_SHEAR
      const rowIdx = b * (BAR_HEIGHT + BAR_GAP) + i
      barRows.push({
        x: TRAIL_PAD + indent * CELL,
        y: rowIdx * CELL,
        rowGlobal: rowIdx,
      })
    }
  }

  function colorAt(x: number, opacity: number): string {
    // Map an x in the art-container space to the dot color (lighter than bars
    // so dots stay visible against the dark canvas).
    const t = (x - TRAIL_PAD) / BARS_INNER_W
    const clamped = Math.max(0, Math.min(1, t))
    const hue = GRADIENT_HUE_START + (GRADIENT_HUE_END - GRADIENT_HUE_START) * clamped
    return `hsla(${hue.toFixed(0)}, ${DOT_SATURATION}%, ${DOT_LIGHTNESS}%, ${opacity.toFixed(2)})`
  }

  // Background dots — horizontal trails extending left/right from each bar
  // row, fading with distance. Echoes the shimmering trails in the landing's
  // canvas animation.
  const dots: Array<{ x: number; y: number; size: number; color: string }> = []
  for (const row of barRows) {
    const centerY = row.y + Math.floor(ROW_H / 2) - 1
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 1; i <= 7; i++) {
        const jitter = ((i * 47 + row.rowGlobal * 31) % 5) - 2
        const x =
          side === -1
            ? row.x - i * 6 - ((i * 11) % 4)
            : row.x + BAR_W + i * 6 + ((i * 11) % 4)
        if (x < 0 || x > ART_W - 2) continue
        const y = centerY + jitter
        if (y < 0 || y > ART_H - 2) continue
        const opacity = Math.max(0.08, 0.42 - i * 0.05)
        dots.push({ x, y, size: 2, color: colorAt(x, opacity) })
      }
    }
  }
  // Scattered dots in the bar gaps for additional grid texture
  for (let i = 0; i < 24; i++) {
    const seed = (i * 2654435761) >>> 0
    const gx = (seed % (ART_W / 6)) * 6
    const gapBand = i % 2 === 0 ? BAR_HEIGHT * CELL : (2 * BAR_HEIGHT + BAR_GAP) * CELL
    const gy = gapBand + ((seed >> 8) % (BAR_GAP * CELL))
    if (gx < 0 || gx > ART_W - 2 || gy < 0 || gy > ART_H - 2) continue
    dots.push({ x: gx, y: gy, size: 2, color: colorAt(gx, 0.18) })
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#000000',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#000000',
          }}
        >
          {/* Background grid — same 32px pattern as the landing body */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: 'center top',
              zIndex: 0,
            }}
          />

          {/* Left text column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '62%',
              height: '100%',
              padding: '40px 60px 80px 72px',
              zIndex: 10,
              justifyContent: 'center',
            }}
          >
            {/* Brand tag — bracketed monogram followed by full club name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '24px',
                fontFamily: '"JetBrains Mono"',
                color: '#ffffff',
                marginBottom: '36px',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>[</span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono Bold"',
                  fontWeight: 700,
                  margin: '0 10px',
                  letterSpacing: '0.05em',
                }}
              >
                SBC
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>]</span>
              <span
                style={{
                  marginLeft: '20px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Solana Builders Club
              </span>
            </div>

            {/* Hero heading — mirrors landing typography */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '64px',
                fontWeight: 600,
                fontFamily: '"Inter"',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                color: '#ffffff',
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>Build, ship, and scale</span>
              <span style={{ whiteSpace: 'nowrap' }}>with the best teams</span>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span>on&nbsp;</span>
                <span
                  style={{
                    borderBottom: '3px dashed rgba(255,255,255,0.45)',
                    paddingBottom: '6px',
                  }}
                >
                  Solana
                </span>
                <span>.</span>
              </div>
            </div>
          </div>

          {/* Right ASCII-style Solana mark */}
          <div
            style={{
              display: 'flex',
              width: '38%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              paddingRight: '30px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: `${ART_W}px`,
                height: `${ART_H}px`,
                display: 'flex',
              }}
            >
              {/* Sparse gradient-colored background pixels */}
              {dots.map((dot, i) => (
                <div
                  key={`dot-${i}`}
                  style={{
                    position: 'absolute',
                    left: `${dot.x}px`,
                    top: `${dot.y}px`,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    backgroundColor: dot.color,
                  }}
                />
              ))}

              {/* Bar rows — gradient + halftone overlay for the pixelated
                  ASCII texture. backgroundSize + backgroundPosition anchor the
                  gradient to the full art width so the purple→green ramp stays
                  continuous across all 12 rows. */}
              {barRows.map((row, i) => (
                <div
                  key={`bar-${i}`}
                  style={{
                    position: 'absolute',
                    left: `${row.x}px`,
                    top: `${row.y}px`,
                    width: `${BAR_W}px`,
                    height: `${ROW_H}px`,
                    backgroundImage:
                      `radial-gradient(rgba(0,0,0,0.55) 1px, transparent 1.4px), linear-gradient(90deg, ${barColor(0)} 0%, ${barColor(0.5)} 50%, ${barColor(1)} 100%)`,
                    backgroundSize: `3px 3px, ${BARS_INNER_W}px 100%`,
                    backgroundPosition: `0px 0px, -${row.x - TRAIL_PAD}px 0px`,
                  }}
                />
              ))}

            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: interSemiBold,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'JetBrains Mono',
          data: jetbrainsMono,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'JetBrains Mono Bold',
          data: jetbrainsMonoBold,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )
}
