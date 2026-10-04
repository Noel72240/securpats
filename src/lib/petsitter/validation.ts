const MAX_ID_FILE_BYTES = 10 * 1024 * 1024 // 10 Mo — aligné bucket petsitter-docs

const ALLOWED_ID_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
])

const ALLOWED_EXT = /\.(jpe?g|png|webp|pdf|heic|heif)$/i

export function validatePetsitterIdFile(file: File): string | null {
  if (!file) return 'La pièce d\'identité est obligatoire.'
  const name = file.name || ''
  const typeOk = !file.type || ALLOWED_ID_TYPES.has(file.type)
  const extOk = ALLOWED_EXT.test(name)
  // Mobile : file.type souvent vide — on se fie alors à l’extension
  if (!typeOk && !extOk) {
    return 'Format non accepté. Utilisez JPG, PNG, WEBP ou PDF.'
  }
  if (file.size > MAX_ID_FILE_BYTES) {
    return 'Fichier trop volumineux (maximum 10 Mo).'
  }
  return null
}

export const PETSITTER_ID_LEGAL_NOTICE = `Votre pièce d'identité est collectée uniquement pour vérifier votre identité en tant que pet-sitter sur SécurPats. Elle est stockée de manière chiffrée sur un serveur sécurisé en Union européenne (Supabase/AWS), accessible uniquement par vous et l'équipe d'administration SécurPats. Durée de conservation : tant que votre compte pet-sitter est actif, puis suppression sous 3 ans après clôture du compte (prescription légale). Vous disposez d'un droit d'accès, de rectification et de suppression (RGPD art. 15 à 17) via contact@securpats.fr ou le DPO indiqué dans notre politique de confidentialité.`
