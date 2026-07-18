import { jsPDF } from 'jspdf'
import type { AdvanceDirectives } from './types'

const LOGO_ICON_URL = '/logo-securpats-icon.png'

type DirectivesLike =
  | AdvanceDirectives
  | (Omit<AdvanceDirectives, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string
      signedAt: string | null
    })

export type DirectivesDocOptions = {
  directives: DirectivesLike
  ownerLabel: string
  petLabels: string[]
}

const BRAND = {
  green: [5, 150, 105] as [number, number, number],
  greenDark: [4, 120, 87] as [number, number, number],
  slate: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  line: [226, 232, 240] as [number, number, number],
  soft: [236, 253, 245] as [number, number, number],
  card: [248, 250, 252] as [number, number, number],
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function formatSignedAt(iso: string | null): string {
  return (iso ? new Date(iso) : new Date()).toLocaleString('fr-FR')
}

export const DIRECTIVES_DOC_NAME = 'Directives anticipées'

export function directivesFileName(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `directives-anticipees-${y}-${m}-${d}.pdf`
}

/**
 * PDF A4 une page : occupe toute la surface (marges serrées),
 * agrandit / densifie pour remplir la hauteur sans supprimer de contenu.
 */
export async function buildDirectivesPdf(options: DirectivesDocOptions): Promise<{
  blob: Blob
  fileName: string
}> {
  const logoData = await fetchAsDataUrl(LOGO_ICON_URL)
  // Du plus grand au plus petit : on veut le rendu le plus grand qui tient sur 1 page.
  // L’espace restant est ensuite réparti pour occuper toute la hauteur A4.
  const candidates = [1.4, 1.28, 1.16, 1.08, 1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52]

  for (const scale of candidates) {
    const result = renderFilledPage(options, logoData, scale)
    if (result.fits) {
      return { blob: result.blob, fileName: directivesFileName() }
    }
  }

  const fallback = renderFilledPage(options, logoData, 0.48)
  return { blob: fallback.blob, fileName: directivesFileName() }
}

function renderFilledPage(
  options: DirectivesDocOptions,
  logoData: string | null,
  scale: number,
): { blob: Blob; fits: boolean; fill: number } {
  const d = options.directives
  const signedAt = formatSignedAt(d.signedAt)
  const petsLine =
    options.petLabels.length > 0 ? options.petLabels.join(', ') : 'Tous les animaux du compte'

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth() // 210
  const pageH = doc.internal.pageSize.getHeight() // 297
  // Marges minimales pour utiliser quasi toute la page
  const marginX = 8
  const marginTop = 8
  const marginBottom = 10
  const contentW = pageW - marginX * 2
  const usableH = pageH - marginTop - marginBottom
  const footerReserve = 6
  const maxY = pageH - marginBottom - footerReserve

  const s = (n: number) => n * scale

  // ——— Préparer les blocs (hauteurs intrinsèques) ———
  type Block =
    | { kind: 'header' }
    | { kind: 'row2'; left: { title: string; body: string }; right: { title: string; body: string } }
    | { kind: 'persons'; items: { title: string; lines: string[] }[] }
    | { kind: 'row2text'; left: { title: string; body: string }; right?: { title: string; body: string } }
    | { kind: 'signature' }

  const persons = [
    {
      title: '1. Personne prioritaire',
      lines: [d.priorityName, d.priorityPhone, d.priorityRelation].filter(t => t.trim()),
    },
    {
      title: '2. Si cette personne est indisponible',
      lines: [d.backupName, d.backupPhone, d.backupRelation].filter(t => t.trim()),
    },
    {
      title: '3. Si cette personne ne peut pas les prendre',
      lines: [d.tertiaryName, d.tertiaryPhone, d.tertiaryRelation].filter(t => t.trim()),
    },
  ].filter(p => p.lines.length > 0 && p.lines[0])

  const textSections: { title: string; body: string }[] = [
    { title: 'Personnes à prévenir', body: d.peopleToNotify },
    { title: 'Médicaments / traitements', body: d.medication },
    { title: 'Habitudes alimentaires', body: d.feedingHabits },
    { title: 'Habitudes quotidiennes', body: d.dailyHabits },
    { title: 'Vétérinaire habituel', body: d.veterinarianInfo },
    { title: 'Instructions particulières', body: d.specialInstructions },
  ].filter(sec => sec.body.trim())

  const blocks: Block[] = [
    { kind: 'header' },
    {
      kind: 'row2',
      left: { title: 'Animaux concernés', body: petsLine },
      right: {
        title: 'Autorisations',
        body:
          `Refuge partenaire : ${d.allowPartnerShelter ? 'Oui' : 'Non'}\n` +
          `Famille d’accueil : ${d.allowFosterFamily ? 'Oui' : 'Non'}`,
      },
    },
  ]
  if (persons.length) blocks.push({ kind: 'persons', items: persons })
  for (let i = 0; i < textSections.length; i += 2) {
    blocks.push({
      kind: 'row2text',
      left: textSections[i],
      right: textSections[i + 1],
    })
  }
  blocks.push({ kind: 'signature' })

  const gapBase = s(3.5)
  const colGap = s(3.5)

  const measureTextBox = (title: string, body: string, width: number, pad: number) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(s(10))
    const t = doc.splitTextToSize(title, width - pad * 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(s(9))
    const b = doc.splitTextToSize(body || '—', width - pad * 2)
    const h = pad + t.length * s(4.2) + b.length * s(3.8) + pad
    return { t, b, h }
  }

  const measureBlock = (block: Block): number => {
    if (block.kind === 'header') return s(26)
    if (block.kind === 'row2') {
      const w = (contentW - colGap) / 2
      const pad = s(4)
      return Math.max(
        measureTextBox(block.left.title, block.left.body, w, pad).h,
        measureTextBox(block.right.title, block.right.body, w, pad).h,
      )
    }
    if (block.kind === 'persons') {
      const n = block.items.length
      const pGap = s(3)
      const pW = (contentW - pGap * (n - 1)) / n
      const pad = s(3.5)
      let maxH = 0
      for (const p of block.items) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(s(9))
        const t = doc.splitTextToSize(p.title, pW - pad * 2)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(s(8.5))
        const lines = p.lines.flatMap(l => doc.splitTextToSize(l, pW - pad * 2))
        maxH = Math.max(maxH, pad + t.length * s(3.8) + lines.length * s(3.6) + pad)
      }
      return maxH
    }
    if (block.kind === 'row2text') {
      const w = (contentW - colGap) / 2
      const pad = s(4)
      const lh = measureTextBox(block.left.title, block.left.body, w, pad).h
      const rh = block.right
        ? measureTextBox(block.right.title, block.right.body, w, pad).h
        : 0
      return Math.max(lh, rh)
    }
    // signature
    return s(8) + s(5) + (d.signatureData ? s(32) : 0) + s(6)
  }

  const heights = blocks.map(measureBlock)
  const contentH = heights.reduce((a, b) => a + b, 0) + gapBase * (blocks.length - 1)
  const targetH = usableH - footerReserve
  const fits = contentH <= targetH + 0.5

  // Espace libre à répartir entre les gaps pour remplir la page
  const spare = Math.max(0, targetH - contentH)
  const gapExtra = blocks.length > 1 ? spare / (blocks.length - 1) : 0
  const gap = gapBase + gapExtra

  // Agrandir aussi la zone signature avec une partie du spare (déjà dans gap)
  // Si encore beaucoup de place et un seul gap insuffisant, étirer les boîtes
  const stretch = fits && spare > 20 ? spare * 0.15 / Math.max(1, blocks.length) : 0

  let y = marginTop
  const startY = y

  const drawTextBox = (
    x: number,
    title: string,
    body: string,
    width: number,
    boxH: number,
  ) => {
    const pad = s(4)
    const { t, b } = measureTextBox(title, body, width, pad)
    doc.setFillColor(...BRAND.card)
    doc.setDrawColor(...BRAND.line)
    doc.roundedRect(x, y, width, boxH, 2.5, 2.5, 'FD')
    doc.setFillColor(...BRAND.green)
    doc.roundedRect(x, y, s(2.2), boxH, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(s(10))
    doc.setTextColor(...BRAND.greenDark)
    doc.text(t, x + pad + s(2), y + pad + s(3))
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(s(9))
    doc.setTextColor(...BRAND.slate)
    doc.text(b, x + pad + s(2), y + pad + s(3) + t.length * s(4.2))
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const h = heights[i] + stretch

    if (block.kind === 'header') {
      doc.setFillColor(...BRAND.soft)
      doc.roundedRect(marginX, y, contentW, h, 3, 3, 'F')
      const logoSize = Math.min(h - s(4), s(22))
      if (logoData) {
        try {
          doc.addImage(
            logoData,
            'PNG',
            marginX + s(4),
            y + (h - logoSize) / 2,
            logoSize,
            logoSize,
          )
        } catch {
          // ignore
        }
      }
      const textX = marginX + (logoData ? logoSize + s(8) : s(5))
      doc.setTextColor(...BRAND.greenDark)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(s(16))
      doc.text('Directives anticipées', textX, y + h * 0.42)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(s(9))
      doc.setTextColor(...BRAND.muted)
      doc.text('SécurPats — Protection animale d’urgence', textX, y + h * 0.68)

      doc.setFontSize(s(8.5))
      doc.setTextColor(...BRAND.slate)
      const meta = [
        `Propriétaire : ${options.ownerLabel}`,
        `Signé le : ${signedAt}`,
        d.consentVersion ? `Consentement : ${d.consentVersion}` : '',
      ].filter(Boolean)
      meta.forEach((line, mi) => {
        doc.text(line, pageW - marginX - s(4), y + s(7) + mi * s(4.5), { align: 'right' })
      })
    }

    if (block.kind === 'row2') {
      const w = (contentW - colGap) / 2
      drawTextBox(marginX, block.left.title, block.left.body, w, h)
      drawTextBox(marginX + w + colGap, block.right.title, block.right.body, w, h)
    }

    if (block.kind === 'persons') {
      const n = block.items.length
      const pGap = s(3)
      const pW = (contentW - pGap * (n - 1)) / n
      const pad = s(3.5)
      block.items.forEach((p, pi) => {
        const x = marginX + pi * (pW + pGap)
        doc.setFillColor(...BRAND.card)
        doc.setDrawColor(...BRAND.line)
        doc.roundedRect(x, y, pW, h, 2.5, 2.5, 'FD')
        doc.setFillColor(...BRAND.green)
        doc.rect(x, y, s(2), h, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(s(9))
        doc.setTextColor(...BRAND.greenDark)
        const t = doc.splitTextToSize(p.title, pW - pad * 2 - s(2))
        doc.text(t, x + pad + s(2), y + pad + s(2.5))
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(s(8.5))
        doc.setTextColor(...BRAND.slate)
        const lines = p.lines.flatMap(l => doc.splitTextToSize(l, pW - pad * 2 - s(2)))
        doc.text(lines, x + pad + s(2), y + pad + s(2.5) + t.length * s(3.8))
      })
    }

    if (block.kind === 'row2text') {
      const w = (contentW - colGap) / 2
      drawTextBox(marginX, block.left.title, block.left.body, w, h)
      if (block.right) {
        drawTextBox(marginX + w + colGap, block.right.title, block.right.body, w, h)
      }
    }

    if (block.kind === 'signature') {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(s(11))
      doc.setTextColor(...BRAND.greenDark)
      doc.text('Signature électronique', marginX, y + s(5))
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(s(9))
      doc.setTextColor(...BRAND.slate)
      doc.text(`Signataire : ${d.signedFullName || options.ownerLabel}`, marginX, y + s(11))

      if (d.signatureData) {
        const sigW = Math.min(s(90), contentW * 0.45)
        const sigH = Math.max(s(22), h - s(18))
        const sigY = y + s(14)
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(...BRAND.line)
        doc.roundedRect(marginX, sigY, sigW, sigH, 2, 2, 'FD')
        try {
          const fmt = d.signatureData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
          doc.addImage(
            d.signatureData,
            fmt,
            marginX + s(2),
            sigY + s(2),
            sigW - s(4),
            sigH - s(4),
          )
        } catch {
          doc.setFontSize(s(8))
          doc.text('(Signature non affichable)', marginX + s(3), sigY + sigH / 2)
        }
      }

      doc.setFontSize(s(7.5))
      doc.setTextColor(...BRAND.muted)
      doc.text(
        'Document généré automatiquement par SécurPats. Conservez une copie imprimée et numérique.',
        marginX,
        y + h - s(2),
      )
    }

    y += h
    if (i < blocks.length - 1) y += gap
  }

  const usedH = y - startY
  const fill = Math.min(1, usedH / targetH)

  // Pied de page collé en bas
  const footerY = pageH - 5
  doc.setDrawColor(...BRAND.line)
  doc.line(marginX, footerY - 3.5, pageW - marginX, footerY - 3.5)
  doc.setFontSize(7)
  doc.setTextColor(...BRAND.muted)
  doc.text('www.securpats.fr', marginX, footerY)
  doc.text('Page 1 / 1', pageW - marginX, footerY, { align: 'right' })

  return {
    blob: doc.output('blob'),
    fits: fits && y <= maxY + 1,
    fill,
  }
}

export function directivesPdfToFile(blob: Blob, fileName = directivesFileName()): File {
  return new File([blob], fileName, { type: 'application/pdf' })
}

export function downloadDirectivesPdf(blob: Blob, fileName = directivesFileName()) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function printDirectivesPdf(blob: Blob): boolean {
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) {
    URL.revokeObjectURL(url)
    return false
  }
  window.setTimeout(() => {
    try {
      win.focus()
      win.print()
    } catch {
      // ignore
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }, 700)
  return true
}
