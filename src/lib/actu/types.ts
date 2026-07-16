export type ActuPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  coverImageUrl: string
  coverImageAlt: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  authorName: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export function slugifyActuTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'article'
}

export function formatActuDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

/** Découpe le corps en paragraphes (séparés par une ligne vide). */
export function splitActuParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
}
