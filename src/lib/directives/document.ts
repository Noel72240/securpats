import type { AdvanceDirectives } from './types'

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function section(title: string, body: string): string {
  if (!body.trim()) return ''
  return `<section><h2>${esc(title)}</h2><p>${esc(body).replace(/\n/g, '<br/>')}</p></section>`
}

function personBlock(title: string, name: string, phone: string, relation: string): string {
  if (!name.trim()) return ''
  return `<section><h2>${esc(title)}</h2>
    <ul>
      <li><strong>Nom :</strong> ${esc(name)}</li>
      ${phone.trim() ? `<li><strong>Téléphone :</strong> ${esc(phone)}</li>` : ''}
      ${relation.trim() ? `<li><strong>Relation :</strong> ${esc(relation)}</li>` : ''}
    </ul></section>`
}

export function buildDirectivesDocumentHtml(options: {
  directives: AdvanceDirectives | (Omit<AdvanceDirectives, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; signedAt: string | null })
  ownerLabel: string
  petLabels: string[]
}): string {
  const d = options.directives
  const signedAt = d.signedAt
    ? new Date(d.signedAt).toLocaleString('fr-FR')
    : new Date().toLocaleString('fr-FR')
  const petsLine = options.petLabels.length > 0
    ? options.petLabels.join(', ')
    : 'Tous les animaux du compte'

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Directives anticipées — SécurPats</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #0f172a; max-width: 800px; margin: 32px auto; padding: 0 20px; line-height: 1.55; }
    h1 { font-size: 1.6rem; margin-bottom: 0.25rem; }
    .meta { color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.1rem; margin-top: 1.4rem; margin-bottom: 0.4rem; color: #047857; border-bottom: 1px solid #d1fae5; padding-bottom: 0.25rem; }
    ul { padding-left: 1.2rem; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-top: 8px; }
    .sig { margin-top: 1.5rem; }
    .sig img { max-height: 90px; border: 1px solid #e2e8f0; background: white; padding: 6px; }
    .footer { margin-top: 2rem; font-size: 0.85rem; color: #64748b; }
    @media print {
      body { margin: 12mm; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <h1>Directives anticipées</h1>
  <p class="meta">
    Document SécurPats — volonté du propriétaire concernant la prise en charge de ses animaux<br/>
    Propriétaire : <strong>${esc(options.ownerLabel)}</strong><br/>
    Signé le : <strong>${esc(signedAt)}</strong>
    ${d.consentVersion ? ` — Version consentement : ${esc(d.consentVersion)}` : ''}
  </p>

  <section>
    <h2>Animaux concernés</h2>
    <p>${esc(petsLine)}</p>
  </section>

  ${personBlock('1. Personne prioritaire', d.priorityName, d.priorityPhone, d.priorityRelation)}
  ${personBlock('2. Si cette personne est indisponible', d.backupName, d.backupPhone, d.backupRelation)}
  ${personBlock('3. Si cette personne ne peut pas les prendre', d.tertiaryName, d.tertiaryPhone, d.tertiaryRelation)}

  <section>
    <h2>Autorisations</h2>
    <ul>
      <li>Refuge partenaire : <strong>${d.allowPartnerShelter ? 'Oui' : 'Non'}</strong></li>
      <li>Famille d’accueil : <strong>${d.allowFosterFamily ? 'Oui' : 'Non'}</strong></li>
    </ul>
  </section>

  ${section('Personnes à prévenir', d.peopleToNotify)}
  ${section('Médicaments / traitements', d.medication)}
  ${section('Habitudes alimentaires', d.feedingHabits)}
  ${section('Habitudes quotidiennes', d.dailyHabits)}
  ${section('Vétérinaire habituel', d.veterinarianInfo)}
  ${section('Instructions particulières', d.specialInstructions)}

  <section class="sig">
    <h2>Signature électronique</h2>
    <p><strong>Signataire :</strong> ${esc(d.signedFullName || options.ownerLabel)}</p>
    ${d.signatureData ? `<div class="box"><img src="${d.signatureData}" alt="Signature" /></div>` : ''}
  </section>

  <p class="footer">
    Document généré automatiquement par SécurPats. Conservez une copie imprimée et numérique.
  </p>
</body>
</html>`
}

export const DIRECTIVES_DOC_NAME = 'Directives anticipées'

export function directivesFileName(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `directives-anticipees-${y}-${m}-${d}.html`
}

export function directivesHtmlToFile(html: string, fileName = directivesFileName()): File {
  return new File([html], fileName, { type: 'text/html;charset=utf-8' })
}

export function downloadDirectivesHtml(html: string, fileName = directivesFileName()) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function printDirectivesHtml(html: string) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!win) return false
  win.document.open()
  win.document.write(html)
  win.document.close()
  // Attendre le rendu (signature image) avant impression
  win.focus()
  window.setTimeout(() => {
    win.print()
  }, 350)
  return true
}
