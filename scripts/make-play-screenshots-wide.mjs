import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import os from 'os'

const outDir = path.join('resources', 'play-screenshots')
const desk = path.join(os.homedir(), 'Downloads', 'SecurPats-play-screenshots')
fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(desk, { recursive: true })

const logoSrc = ['resources/play-icon-512.png', 'resources/logo-final.png', 'resources/play-logo-src.jpg'].find(
  (p) => fs.existsSync(p),
)
if (!logoSrc) throw new Error('logo missing')

async function loadLogoTransparent(size) {
  const { data, info } = await sharp(logoSrc).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
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
    subtitle: 'Alertez vos proches en un geste quand votre animal a besoin d’aide.',
    badge: 'Alerte SOS',
    accent: '#0f766e',
    soft: '#ccfbf1',
    cards: [
      { label: 'Propriétaire', desc: 'Animaux & urgences', color: '#0d9488' },
      { label: 'Pet-sitter', desc: 'Missions & profil', color: '#2563eb' },
      { label: 'Bénévole', desc: 'Famille d’accueil', color: '#0f766e' },
      { label: 'Boutique', desc: 'Médailles & accessoires', color: '#d97706' },
    ],
  },
  {
    file: '02-urgence',
    title: 'Alerte d’urgence',
    title2: 'en 1 clic',
    subtitle: 'Prévenez référents, aidants et petsitters immédiatement.',
    badge: 'Temps réel',
    accent: '#b91c1c',
    soft: '#fee2e2',
    cards: [
      { label: 'SMS & e-mail', desc: 'Notification instantanée', color: '#dc2626' },
      { label: 'Référents', desc: 'Contacts de confiance', color: '#ea580c' },
      { label: 'Directives', desc: 'Consignes pour l’animal', color: '#b91c1c' },
      { label: 'Suivi', desc: 'Historique des alertes', color: '#991b1b' },
    ],
  },
  {
    file: '03-reseau',
    title: 'Un réseau',
    title2: 'solidaire',
    subtitle: 'Pet-sitters et bénévoles prêts à intervenir près de chez vous.',
    badge: 'Communauté',
    accent: '#1d4ed8',
    soft: '#dbeafe',
    cards: [
      { label: 'Disponibilités', desc: 'Calendrier à jour', color: '#2563eb' },
      { label: 'Profil VIP', desc: 'Confiance & vérification', color: '#1d4ed8' },
      { label: 'Missions', desc: 'Aide aux animaux', color: '#0284c7' },
      { label: 'Proximité', desc: 'Autour de vous', color: '#0369a1' },
    ],
  },
  {
    file: '04-boutique',
    title: 'Boutique',
    title2: 'SécurPats',
    subtitle: 'Médailles, accessoires et kits livrés via Mondial Relay.',
    badge: 'Shop',
    accent: '#b45309',
    soft: '#fef3c7',
    cards: [
      { label: 'Médailles', desc: 'Identification sécurisée', color: '#d97706' },
      { label: 'Accessoires', desc: 'Pour chiens & chats', color: '#b45309' },
      { label: 'Livraison', desc: 'Point Relais', color: '#ca8a04' },
      { label: 'Paiement', desc: 'Sécurisé Stripe', color: '#a16207' },
    ],
  },
]

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** 2560x1440 — tablette 10" & desktop (16:9, côtés ≥ 1080) */
function wideSvg(s, { deviceLabel }) {
  const cards = s.cards
    .map((c, i) => {
      const x = 100 + (i % 4) * 600
      return `
      <rect x="${x}" y="900" width="560" height="280" rx="32" fill="white" fill-opacity="0.96"/>
      <circle cx="${x + 80}" cy="1040" r="42" fill="${c.color}"/>
      <text x="${x + 150}" y="1025" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#0f172a">${escapeXml(c.label)}</text>
      <text x="${x + 150}" y="1080" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#64748b">${escapeXml(c.desc)}</text>
      `
    })
    .join('')

  return Buffer.from(`<svg width="2560" height="1440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${s.accent}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="2560" height="1440" fill="url(#bg)"/>
  <circle cx="2300" cy="220" r="360" fill="white" fill-opacity="0.07"/>
  <circle cx="200" cy="1200" r="300" fill="white" fill-opacity="0.05"/>

  <rect x="100" y="70" width="300" height="56" rx="28" fill="white" fill-opacity="0.18"/>
  <text x="250" y="108" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="white">${escapeXml(s.badge)}</text>

  <text x="100" y="320" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="700" fill="white">${escapeXml(s.title)}</text>
  <text x="100" y="420" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="700" fill="${s.soft}">${escapeXml(s.title2)}</text>
  <text x="100" y="520" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="white" fill-opacity="0.92">${escapeXml(s.subtitle)}</text>

  ${cards}

  <text x="100" y="1380" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="white" fill-opacity="0.8">SécurPats</text>
  <text x="2460" y="1380" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="white" fill-opacity="0.55">${escapeXml(deviceLabel)}</text>
</svg>`)
}

const logo = await loadLogoTransparent(300)

for (const prefix of ['tablet10', 'desktop']) {
  const label = prefix === 'tablet10' ? 'Tablette' : 'Ordinateur'
  for (const s of screens) {
    const name = `${prefix}-${s.file}.png`
    const file = path.join(outDir, name)
    await sharp(wideSvg(s, { deviceLabel: label }))
      .composite([{ input: logo, left: 2100, top: 120 }])
      .png()
      .toFile(file)
    fs.copyFileSync(file, path.join(desk, name))
    const m = await sharp(file).metadata()
    console.log(name, m.width, m.height)
  }
}

console.log('DONE', desk)
