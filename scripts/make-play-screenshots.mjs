import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import os from 'os'

const desk = path.join(os.homedir(), 'Desktop', 'SecurPats-play-screenshots')
fs.mkdirSync(desk, { recursive: true })
fs.mkdirSync('resources/play-screenshots', { recursive: true })

const logoSrc = ['resources/play-icon-512.png', 'resources/logo-final.png', 'resources/play-logo-src.jpg'].find(
  (p) => fs.existsSync(p),
)
if (!logoSrc) throw new Error('logo missing')

// Logo transparent (flood fill blanc extérieur)
async function loadLogoTransparent(size) {
  let buf = await sharp(logoSrc).ensureAlpha().png().toBuffer()
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const isW = (i) => data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245 && data[i + 3] > 0
  const seen = new Uint8Array(w * h)
  const q = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (seen[p] || !isW(p * 4)) return
    seen[p] = 1
    q.push(p)
  }
  ;[[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].forEach(([x, y]) => push(x, y))
  while (q.length) {
    const p = q.pop()
    data[p * 4 + 3] = 0
    const x = p % w
    const y = (p - x) / w
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }
  return sharp(Buffer.from(data), { raw: { width: w, height: h, channels: 4 } })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

const screens = [
  {
    file: '01-accueil',
    title: 'Protection animale',
    title2: "d'urgence",
    subtitle: 'Alertez vos proches en un geste\nquand votre animal a besoin d’aide.',
    badge: 'Alerte SOS',
    accent: '#0f766e',
    soft: '#ccfbf1',
    cards: [
      { label: 'Propriétaire', desc: 'Animaux & urgences', color: '#0d9488' },
      { label: 'Pet-sitter', desc: 'Missions & profil', color: '#2563eb' },
      { label: 'Bénévole', desc: 'Famille d’accueil', color: '#0f766e' },
    ],
  },
  {
    file: '02-urgence',
    title: 'Alerte d’urgence',
    title2: 'en 1 clic',
    subtitle: 'Prévenez référents, aidants et\npetsitters immédiatement.',
    badge: 'Temps réel',
    accent: '#b91c1c',
    soft: '#fee2e2',
    cards: [
      { label: 'SMS & e-mail', desc: 'Notification instantanée', color: '#dc2626' },
      { label: 'Référents', desc: 'Contacts de confiance', color: '#ea580c' },
      { label: 'Directives', desc: 'Consignes pour l’animal', color: '#b91c1c' },
    ],
  },
  {
    file: '03-reseau',
    title: 'Un réseau',
    title2: 'solidaire',
    subtitle: 'Pet-sitters et bénévoles prêts\nà intervenir près de chez vous.',
    badge: 'Communauté',
    accent: '#1d4ed8',
    soft: '#dbeafe',
    cards: [
      { label: 'Disponibilités', desc: 'Calendrier à jour', color: '#2563eb' },
      { label: 'Profil VIP', desc: 'Confiance & vérification', color: '#1d4ed8' },
      { label: 'Missions', desc: 'Aide aux animaux', color: '#0284c7' },
    ],
  },
  {
    file: '04-boutique',
    title: 'Boutique',
    title2: 'SécurPats',
    subtitle: 'Médailles, accessoires et kits\nlivrés via Mondial Relay.',
    badge: 'Shop',
    accent: '#b45309',
    soft: '#fef3c7',
    cards: [
      { label: 'Médailles', desc: 'Identification sécurisée', color: '#d97706' },
      { label: 'Accessoires', desc: 'Pour chiens & chats', color: '#b45309' },
      { label: 'Livraison', desc: 'Point Relais', color: '#ca8a04' },
    ],
  },
]

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function phoneSvg(s) {
  const lines = s.subtitle.split('\n')
  const cardH = 150
  const cardStart = 1180
  const cards = s.cards
    .map((c, i) => {
      const y = cardStart + i * (cardH + 24)
      return `
      <rect x="72" y="${y}" width="936" height="${cardH}" rx="28" fill="white" fill-opacity="0.95"/>
      <circle cx="156" cy="${y + cardH / 2}" r="36" fill="${c.color}"/>
      <text x="220" y="${y + 62}" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#0f172a">${escapeXml(c.label)}</text>
      <text x="220" y="${y + 108}" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#64748b">${escapeXml(c.desc)}</text>
      `
    })
    .join('')

  return Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${s.accent}"/>
      <stop offset="55%" stop-color="${s.accent}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="900" cy="180" r="220" fill="white" fill-opacity="0.08"/>
  <circle cx="120" cy="1600" r="280" fill="white" fill-opacity="0.06"/>

  <rect x="360" y="80" width="360" height="56" rx="28" fill="white" fill-opacity="0.18"/>
  <text x="540" y="118" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="white">${escapeXml(s.badge)}</text>

  <text x="72" y="520" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="white">${escapeXml(s.title)}</text>
  <text x="72" y="610" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="${s.soft}">${escapeXml(s.title2)}</text>
  <text x="72" y="700" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="white" fill-opacity="0.9">${escapeXml(lines[0] || '')}</text>
  <text x="72" y="750" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="white" fill-opacity="0.9">${escapeXml(lines[1] || '')}</text>

  ${cards}

  <text x="540" y="1840" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="white" fill-opacity="0.85">SécurPats</text>
</svg>`)
}

function tabletSvg(s) {
  const lines = s.subtitle.split('\n')
  const cards = s.cards
    .map((c, i) => {
      const x = 80 + i * 600
      return `
      <rect x="${x}" y="680" width="560" height="220" rx="28" fill="white" fill-opacity="0.95"/>
      <circle cx="${x + 70}" cy="790" r="36" fill="${c.color}"/>
      <text x="${x + 130}" y="775" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#0f172a">${escapeXml(c.label)}</text>
      <text x="${x + 130}" y="825" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#64748b">${escapeXml(c.desc)}</text>
      `
    })
    .join('')

  return Buffer.from(`<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${s.accent}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg)"/>
  <circle cx="1700" cy="200" r="280" fill="white" fill-opacity="0.08"/>
  <rect x="80" y="60" width="280" height="52" rx="26" fill="white" fill-opacity="0.18"/>
  <text x="220" y="95" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="white">${escapeXml(s.badge)}</text>

  <text x="80" y="280" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="white">${escapeXml(s.title)} ${escapeXml(s.title2)}</text>
  <text x="80" y="360" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="white" fill-opacity="0.9">${escapeXml(lines[0] || '')} ${escapeXml(lines[1] || '')}</text>

  ${cards}

  <text x="1840" y="1020" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="white" fill-opacity="0.85">SécurPats</text>
</svg>`)
}

const logoPhone = await loadLogoTransparent(280)
const logoTablet = await loadLogoTransparent(220)

for (const s of screens) {
  const phonePath = path.join('resources/play-screenshots', `phone-${s.file}.png`)
  const tabletPath = path.join('resources/play-screenshots', `tablet7-${s.file}.png`)

  await sharp(phoneSvg(s))
    .composite([{ input: logoPhone, left: 400, top: 180 }])
    .png()
    .toFile(phonePath)

  await sharp(tabletSvg(s))
    .composite([{ input: logoTablet, left: 1580, top: 80 }])
    .png()
    .toFile(tabletPath)

  fs.copyFileSync(phonePath, path.join(desk, path.basename(phonePath)))
  fs.copyFileSync(tabletPath, path.join(desk, path.basename(tabletPath)))

  const m1 = await sharp(phonePath).metadata()
  const m2 = await sharp(tabletPath).metadata()
  console.log(s.file, 'phone', m1.width, m1.height, 'tablet', m2.width, m2.height)
}

console.log('DONE', desk)
