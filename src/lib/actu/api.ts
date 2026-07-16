import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ActuPost } from './types'

type ActuRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  cover_image_url: string
  cover_image_alt: string
  seo_title: string
  seo_description: string
  keywords: string[] | null
  author_name: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export function actuPostFromRow(row: ActuRow): ActuPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt || row.title,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    keywords: row.keywords ?? [],
    authorName: row.author_name || 'SécurPats',
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function actuPostToRow(post: ActuPost) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    cover_image_url: post.coverImageUrl,
    cover_image_alt: post.coverImageAlt || post.title,
    seo_title: post.seoTitle,
    seo_description: post.seoDescription,
    keywords: post.keywords,
    author_name: post.authorName || 'SécurPats',
    published: post.published,
    published_at: post.published
      ? (post.publishedAt || new Date().toISOString())
      : post.publishedAt,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchPublishedActuPosts(): Promise<{ posts: ActuPost[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { posts: [], error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('actu_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) return { posts: [], error: error.message }
  return { posts: (data as ActuRow[]).map(actuPostFromRow), error: null }
}

export async function fetchActuPostBySlug(slug: string): Promise<{ post: ActuPost | null; error: string | null }> {
  if (!isSupabaseConfigured()) return { post: null, error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('actu_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) return { post: null, error: error.message }
  if (!data) return { post: null, error: null }
  return { post: actuPostFromRow(data as ActuRow), error: null }
}

export async function fetchAllActuPostsAdmin(): Promise<{ posts: ActuPost[]; error: string | null }> {
  if (!isSupabaseConfigured()) return { posts: [], error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('actu_posts')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return { posts: [], error: error.message }
  return { posts: (data as ActuRow[]).map(actuPostFromRow), error: null }
}

export async function upsertActuPost(post: ActuPost): Promise<{ post: ActuPost | null; error: string | null }> {
  const { data, error } = await getSupabase()
    .from('actu_posts')
    .upsert(actuPostToRow(post))
    .select()
    .single()
  if (error) return { post: null, error: error.message }
  return { post: actuPostFromRow(data as ActuRow), error: null }
}

export async function deleteActuPost(id: string): Promise<{ error: string | null }> {
  const { error } = await getSupabase().from('actu_posts').delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function setActuPostPublished(id: string, published: boolean): Promise<{ error: string | null }> {
  const { error } = await getSupabase()
    .from('actu_posts')
    .update({
      published,
      updated_at: new Date().toISOString(),
      ...(published ? { published_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)
  return { error: error?.message ?? null }
}
