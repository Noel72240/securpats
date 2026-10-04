import sharp from 'sharp'
import fs from 'fs'

const sourcePath = 'public/hero-home-source.png'
const outputPath = 'public/hero-home.png'

const coverWidth = 500
const coverHeight = 620

const texture = await sharp(sourcePath)
  .extract({ left: 690, top: 145, width: 90, height: 90 })
  .resize(coverWidth, coverHeight, { fit: 'fill' })
  .blur(1.4)
  .png()
  .toBuffer()

const ellipseMask = Buffer.from(`<svg width="${coverWidth}" height="${coverHeight}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="255" cy="250" rx="245" ry="300" fill="white"/>
  <ellipse cx="300" cy="120" rx="120" ry="105" fill="white"/>
</svg>`)

const softMask = await sharp(ellipseMask).blur(14).png().toBuffer()

const cover = await sharp(texture)
  .composite([{ input: softMask, blend: 'dest-in' }])
  .png()
  .toBuffer()

await sharp(sourcePath)
  .composite([{ input: cover, top: 55, left: 735 }])
  .png()
  .toFile(outputPath)

console.log('written', outputPath)
