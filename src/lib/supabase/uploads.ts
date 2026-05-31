import { uploadFile, documentPath, STORAGE_BUCKETS } from './storage'

function safeFileName(name: string) {
  return `${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
}

export async function uploadDocumentFile(userId: string, petId: string | undefined, file: File) {
  const path = documentPath(userId, petId, safeFileName(file.name))
  return uploadFile(STORAGE_BUCKETS.documents, path, file)
}

export async function uploadPetPhotoFile(userId: string, petId: string, file: File) {
  const path = `${userId}/${petId}/${safeFileName(file.name)}`
  return uploadFile(STORAGE_BUCKETS.pets, path, file, { upsert: true })
}

export async function uploadSiteAssetFile(folder: string, file: File) {
  const path = `${folder}/${safeFileName(file.name)}`
  return uploadFile(STORAGE_BUCKETS.site, path, file, { upsert: true })
}

export async function uploadAvatarFile(userId: string, file: File) {
  const path = `${userId}/${safeFileName(file.name)}`
  return uploadFile(STORAGE_BUCKETS.avatars, path, file, { upsert: true })
}

export async function uploadPetSitterDocFile(userId: string, kind: 'id' | 'address', file: File) {
  const path = `${userId}/${kind}/${safeFileName(file.name)}`
  return uploadFile(STORAGE_BUCKETS.petsitter, path, file, { upsert: true })
}

export async function getDocumentSignedUrl(storagePath: string, expiresIn = 3600) {
  const { getSupabase } = await import('./client')
  const { data, error } = await getSupabase().storage
    .from(STORAGE_BUCKETS.documents)
    .createSignedUrl(storagePath, expiresIn)
  if (error) return { url: null as string | null, error: error.message }
  return { url: data.signedUrl, error: null }
}
