import { getSupabase } from './client'

export const STORAGE_BUCKETS = {
  documents: 'documents',
  avatars: 'avatars',
  pets: 'pet-photos',
  petsitter: 'petsitter-docs',
  site: 'site-assets',
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File,
  options?: { upsert?: boolean }
) {
  const { data, error } = await getSupabase().storage
    .from(bucket)
    .upload(path, file, { upsert: options?.upsert ?? false })

  if (error) return { path: null as string | null, error: error.message }

  const { data: urlData } = getSupabase().storage.from(bucket).getPublicUrl(data.path)
  return { path: data.path, publicUrl: urlData.publicUrl, error: null }
}

export async function deleteFile(bucket: StorageBucket, path: string) {
  const { error } = await getSupabase().storage.from(bucket).remove([path])
  return { error: error?.message ?? null }
}

export function getPublicUrl(bucket: StorageBucket, path: string) {
  const { data } = getSupabase().storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/** Chemin recommandé : {userId}/{petId}/{filename} */
export function documentPath(userId: string, petId: string | undefined, fileName: string) {
  return petId ? `${userId}/${petId}/${fileName}` : `${userId}/${fileName}`
}
