import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../server/lib/cors.js'
import {
  createDigitalSignedDownloadUrl,
  getDigitalDownloadMeta,
} from '../../server/lib/shop-digital.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return

  const token =
    typeof req.query.token === 'string'
      ? req.query.token
      : typeof req.body?.token === 'string'
        ? req.body.token
        : ''

  if (!token) {
    return res.status(400).json({ error: 'token requis' })
  }

  if (req.method === 'GET' && req.query.meta === '1') {
    const meta = await getDigitalDownloadMeta(token)
    if (meta.error && !meta.productName) {
      return res.status(404).json({ error: meta.error })
    }
    return res.status(200).json(meta)
  }

  if (req.method === 'GET' || req.method === 'POST') {
    const result = await createDigitalSignedDownloadUrl(token)
    if (!result.url) {
      return res.status(400).json({ error: result.error || 'Téléchargement impossible' })
    }
    if (req.query.redirect === '1') {
      res.setHeader('Location', result.url)
      return res.status(302).end()
    }
    return res.status(200).json({
      url: result.url,
      fileName: result.fileName,
      productName: result.productName,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
