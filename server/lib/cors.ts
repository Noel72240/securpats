import type { VercelRequest, VercelResponse } from '@vercel/node'

/** CORS pour l’app Android Capacitor (origine https://localhost) et le web. */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '*'
  const allowed =
    origin === 'https://localhost'
    || origin === 'capacitor://localhost'
    || origin === 'http://localhost'
    || origin.endsWith('.securpats.fr')
    || origin === 'https://www.securpats.fr'
    || origin === 'https://securpats.fr'
      ? origin
      : '*'

  res.setHeader('Access-Control-Allow-Origin', allowed)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
  if (allowed !== '*') res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}
