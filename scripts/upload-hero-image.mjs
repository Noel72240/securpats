import fs from 'fs'

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    env[line.slice(0, i)] = line.slice(i + 1)
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
const filePath = 'public/hero-home.png'
const storagePath = `images/${Date.now()}-hero-home.png`

const body = fs.readFileSync(filePath)

const uploadRes = await fetch(`${url}/storage/v1/object/site-assets/${storagePath}`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'image/png',
    'x-upsert': 'true',
  },
  body,
})

if (!uploadRes.ok) {
  console.error('upload failed', uploadRes.status, await uploadRes.text())
  process.exit(1)
}

const publicUrl = `${url}/storage/v1/object/public/site-assets/${storagePath}`
console.log('uploaded', publicUrl)

const settingsRes = await fetch(`${url}/rest/v1/site_settings?id=eq.global&select=settings`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
})
const rows = await settingsRes.json()
const settings = rows[0]?.settings ?? {}
settings.home = { ...settings.home, heroImage: publicUrl }

const patchRes = await fetch(`${url}/rest/v1/site_settings?id=eq.global`, {
  method: 'PATCH',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  },
  body: JSON.stringify({ settings }),
})

if (!patchRes.ok) {
  console.error('settings update failed', patchRes.status, await patchRes.text())
  process.exit(1)
}

console.log('site_settings updated')
