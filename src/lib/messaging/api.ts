import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { SupportConversation, SupportMessage, SupportClientRole } from './types'

type ConversationRow = {
  id: string
  client_id: string
  client_role: string
  client_name: string
  client_email: string
  subject: string
  last_message_at: string
  last_message_preview: string
  client_unread: number
  admin_unread: number
  created_at: string
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

function fromConversation(row: ConversationRow): SupportConversation {
  return {
    id: row.id,
    clientId: row.client_id,
    clientRole: (row.client_role === 'petsitter' ? 'petsitter' : 'owner') as SupportClientRole,
    clientName: row.client_name || 'Client',
    clientEmail: row.client_email || '',
    subject: row.subject,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview || '',
    clientUnread: row.client_unread ?? 0,
    adminUnread: row.admin_unread ?? 0,
    createdAt: row.created_at,
  }
}

function fromMessage(row: MessageRow): SupportMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

function missingTableError(err: { message?: string; code?: string } | null): string | null {
  if (!err) return null
  const msg = err.message || ''
  if (
    msg.includes('support_conversations') ||
    msg.includes('support_messages') ||
    msg.includes('get_or_create_support_conversation') ||
    err.code === 'PGRST205' ||
    err.code === '42P01'
  ) {
    return 'Messagerie absente : exécutez supabase/migrations/019_support_messaging.sql dans Supabase.'
  }
  return msg || 'Erreur messagerie'
}

export async function getOrCreateMyConversation(): Promise<{
  conversation: SupportConversation | null
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { conversation: null, error: 'Supabase non configuré' }
  const { data, error } = await getSupabase().rpc('get_or_create_support_conversation')
  if (error) return { conversation: null, error: missingTableError(error) }
  return { conversation: fromConversation(data as ConversationRow), error: null }
}

export async function adminOpenConversation(clientId: string): Promise<{
  conversation: SupportConversation | null
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { conversation: null, error: 'Supabase non configuré' }
  const { data, error } = await getSupabase().rpc('admin_open_support_conversation', {
    p_client_id: clientId,
  })
  if (error) return { conversation: null, error: missingTableError(error) }
  return { conversation: fromConversation(data as ConversationRow), error: null }
}

export async function listConversations(): Promise<{
  conversations: SupportConversation[]
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { conversations: [], error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('support_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
  if (error) return { conversations: [], error: missingTableError(error) }
  return {
    conversations: ((data || []) as ConversationRow[]).map(fromConversation),
    error: null,
  }
}

export async function listMessages(conversationId: string): Promise<{
  messages: SupportMessage[]
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { messages: [], error: 'Supabase non configuré' }
  const { data, error } = await getSupabase()
    .from('support_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) return { messages: [], error: missingTableError(error) }
  return {
    messages: ((data || []) as MessageRow[]).map(fromMessage),
    error: null,
  }
}

export async function sendMessage(conversationId: string, body: string): Promise<{
  message: SupportMessage | null
  error: string | null
}> {
  if (!isSupabaseConfigured()) return { message: null, error: 'Supabase non configuré' }
  const { data, error } = await getSupabase().rpc('send_support_message', {
    p_conversation_id: conversationId,
    p_body: body,
  })
  if (error) return { message: null, error: missingTableError(error) }
  notifySupportUnreadChanged()
  return { message: fromMessage(data as MessageRow), error: null }
}

export async function markConversationRead(conversationId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const { error } = await getSupabase().rpc('mark_support_conversation_read', {
    p_conversation_id: conversationId,
  })
  if (!error) notifySupportUnreadChanged()
  return error ? missingTableError(error) : null
}

/** Nombre de messages non lus pour la pastille rouge du menu. */
export async function fetchUnreadSupportCount(isAdmin: boolean): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  try {
    if (isAdmin) {
      const { data, error } = await getSupabase()
        .from('support_conversations')
        .select('admin_unread')
      if (error || !data) return 0
      return data.reduce((sum, row) => sum + (row.admin_unread || 0), 0)
    }

    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return 0
    const { data, error } = await getSupabase()
      .from('support_conversations')
      .select('client_unread')
      .eq('client_id', user.id)
      .maybeSingle()
    if (error || !data) return 0
    return data.client_unread || 0
  } catch {
    return 0
  }
}

export function notifySupportUnreadChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('support-unread-changed'))
  }
}
