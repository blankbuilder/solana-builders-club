import sharp from 'sharp'
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC_SVG = '/Users/julien/WORK/SOLANA BUILDERS CLUB/favicon-sbc.svg'
const PUBLIC = resolve(import.meta.dirname, '..', 'public')

const svgBuffer = readFileSync(SRC_SVG)

async function renderSquarePng(size) {
  return sharp(svgBuffer, { density: 384 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const headerSize = 6
  const dirEntrySize = 16
  const directorySize = headerSize + count * dirEntrySize

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  const entries = []
  let offset = directorySize

  for (const { size, data } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize)
    entry.writeUInt8(size === 256 ? 0 : size, 0)
    entry.writeUInt8(size === 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += data.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.data)])
}

async function main() {
  copyFileSync(SRC_SVG, resolve(PUBLIC, 'favicon.svg'))
  console.log('wrote favicon.svg')

  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
  ]

  for (const { name, size } of sizes) {
    const buf = await renderSquarePng(size)
    writeFileSync(resolve(PUBLIC, name), buf)
    console.log(`wrote ${name} (${size}x${size})`)
  }

  const icoSizes = [16, 32, 48]
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => ({ size, data: await renderSquarePng(size) }))
  )
  const ico = buildIco(icoPngs)
  writeFileSync(resolve(PUBLIC, 'favicon.ico'), ico)
  console.log(`wrote favicon.ico (${icoSizes.join(', ')})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
