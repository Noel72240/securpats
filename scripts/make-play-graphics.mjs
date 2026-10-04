import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import os from 'os'

const candidates = [
  'resources/play-logo-src.jpg',
  'resources/play-logo-src.png',
  'resources/logo-final.png',
  'resources/logo-clean.png',
  'resources/icon.png',
]
const src = candidates.find(p => fs.existsSync(p))
if (!src) throw new Error('No logo source found')
console.log('source', src)

const trimmed = await sharp(src)
  .trim({ threshold: 35, background: { r: 0, g: 0, b: 0 } })
  .png()
  .toBuffer()

const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const w = info.width
const h = info.height
const ch = info.channels
let minX = w
let minY = h
let maxX = 0
let maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch
    if (data[i] < 248 || data[i + 1] < 248 || data[i + 2] < 248) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}
minY = Math.min(h - 1, Math.max(0, minY + 2))
maxY = Math.max(minY, Math.min(h - 1, maxY - 2))

const logo = await sharp(trimmed)
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png()
  .toBuffer()

console.log('logo', maxX - minX + 1, maxY - minY + 1)

const iconInner = await sharp(logo)
  .resize(420, 420, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toBuffer()

await sharp({
  create: { width: 512, height: 512, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([{ input: iconInner, gravity: 'centre' }])
  .png()
  .toFile('resources/play-icon-512.png')

// Blanc extérieur seulement → transparent (flood fill depuis les coins)
const { data: rgba, info: li } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const lw = li.width
const lh = li.height
const isNearWhite = (i) => rgba[i] > 245 && rgba[i + 1] > 245 && rgba[i + 2] > 245 && rgba[i + 3] > 0
const seen = new Uint8Array(lw * lh)
const q = []
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= lw || y >= lh) return
  const p = y * lw + x
  if (seen[p]) return
  if (!isNearWhite(p * 4)) return
  seen[p] = 1
  q.push(p)
}
;[[0, 0], [lw - 1, 0], [0, lh - 1], [lw - 1, lh - 1]].forEach(([x, y]) => push(x, y))
while (q.length) {
  const p = q.pop()
  rgba[p * 4 + 3] = 0
  const x = p % lw
  const y = (p - x) / lw
  push(x + 1, y)
  push(x - 1, y)
  push(x, y + 1)
  push(x, y - 1)
}
const logoTransparent = await sharp(Buffer.from(rgba), {
  raw: { width: lw, height: lh, channels: 4 },
})
  .png()
  .toBuffer()

const featureLogo = await sharp(logoTransparent)
  .resize(380, 380, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

const titleSvg = Buffer.from(`<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#115e59"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <text x="520" y="230" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="white">SécurPats</text>
  <text x="520" y="300" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#d1fae5">Protection animale d'urgence</text>
</svg>`)

await sharp(titleSvg)
  .composite([{ input: featureLogo, left: 90, top: 60 }])
  .png()
  .toFile('resources/play-feature-1024x500.png')

const desk = path.join(os.homedir(), 'Desktop')
fs.copyFileSync('resources/play-icon-512.png', path.join(desk, 'SecurPats-play-icon-512.png'))
fs.copyFileSync(
  'resources/play-feature-1024x500.png',
  path.join(desk, 'SecurPats-play-feature-1024x500.png'),
)

const m1 = await sharp('resources/play-icon-512.png').metadata()
const m2 = await sharp('resources/play-feature-1024x500.png').metadata()
console.log('icon', m1.width, m1.height, fs.statSync('resources/play-icon-512.png').size)
console.log('feature', m2.width, m2.height, fs.statSync('resources/play-feature-1024x500.png').size)
console.log('copied to', desk)
