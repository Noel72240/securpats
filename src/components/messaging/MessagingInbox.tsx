import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageSquare, Send, UserRound, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { useI18n } from '@/i18n/LanguageContext'
import {
  adminOpenConversation,
  getOrCreateMyConversation,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} from '@/lib/messaging/api'
import type { SupportConversation, SupportMessage } from '@/lib/messaging/types'
import { formatDateTime, cn } from '@/lib/utils'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

type Mode = 'client' | 'admin'

type Props = {
  mode: Mode
  accent?: 'brand' | 'blue' | 'purple'
}

export function MessagingInbox({ mode, accent = 'brand' }: Props) {
  const { t } = useI18n()
  const { currentUser, allUsers } = useApp()
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [pickUserId, setPickUserId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const active = conversations.find(c => c.id === activeId) || null

  const roleLabel = (role: string) =>
    role === 'petsitter' ? t('messaging.petsitter') : role === 'owner' ? t('messaging.owner') : role

  const clients = useMemo(
    () =>
      allUsers
        .filter(u => u.role === 'owner' || u.role === 'petsitter')
        .slice()
        .sort((a, b) => `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, 'fr')),
    [allUsers],
  )

  const bubbleMine =
    accent === 'purple'
      ? 'bg-purple-600 text-white'
      : accent === 'blue'
        ? 'bg-blue-600 text-white'
        : 'bg-brand-600 text-white'

  const refreshConversations = useCallback(async () => {
    if (!isSupabaseConfigured() || !currentUser) return

    if (mode === 'client') {
      const { conversation, error: err } = await getOrCreateMyConversation()
      if (err) {
        setError(err)
        return
      }
      if (conversation) {
        setConversations([conversation])
        setActiveId(conversation.id)
      }
      return
    }

    const { conversations: list, error: err } = await listConversations()
    if (err) {
      setError(err)
      return
    }
    setConversations(list)
    setActiveId(prev => {
      if (prev && list.some(c => c.id === prev)) return prev
      return list[0]?.id ?? null
    })
  }, [currentUser, mode])

  const refreshMessages = useCallback(async (conversationId: string) => {
    const { messages: list, error: err } = await listMessages(conversationId)
    if (err) {
      setError(err)
      return
    }
    setMessages(list)
    await markConversationRead(conversationId)
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              clientUnread: mode === 'client' ? 0 : c.clientUnread,
              adminUnread: mode === 'admin' ? 0 : c.adminUnread,
            }
          : c,
      ),
    )
  }, [mode])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError('')
      await refreshConversations()
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [refreshConversations])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    void refreshMessages(activeId)
  }, [activeId, refreshMessages])

  // Polling + temps réel côté boîte
  useEffect(() => {
    if (!activeId) return
    const t = window.setInterval(() => {
      void refreshMessages(activeId)
      if (mode === 'admin') void refreshConversations()
    }, 5000)

    if (!isSupabaseConfigured()) {
      return () => window.clearInterval(t)
    }

    const channel = getSupabase()
      .channel(`inbox-${mode}-${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${activeId}`,
        },
        () => {
          void refreshMessages(activeId)
          if (mode === 'admin') void refreshConversations()
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_conversations',
          filter: `id=eq.${activeId}`,
        },
        () => {
          void refreshConversations()
        },
      )
      .subscribe()

    return () => {
      window.clearInterval(t)
      void getSupabase().removeChannel(channel)
    }
  }, [activeId, mode, refreshConversations, refreshMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!activeId || !draft.trim() || sending) return
    setSending(true)
    setError('')
    const body = draft.trim()
    const { message, error: err } = await sendMessage(activeId, body)
    setSending(false)
    if (err) {
      setError(err)
      return
    }
    setDraft('')
    if (message) {
      setMessages(prev => [...prev, message])
      setConversations(prev =>
        prev
          .map(c =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessageAt: message.createdAt,
                  lastMessagePreview: body.slice(0, 160),
                }
              : c,
          )
          .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
      )
    }
  }

  const handleAdminOpen = async () => {
    if (!pickUserId) return
    setError('')
    const { conversation, error: err } = await adminOpenConversation(pickUserId)
    if (err) {
      setError(err)
      return
    }
    if (!conversation) return
    setConversations(prev => {
      const others = prev.filter(c => c.id !== conversation.id)
      return [conversation, ...others]
    })
    setActiveId(conversation.id)
    setPickUserId('')
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card>
        <EmptyState
          icon={MessageSquare}
          title={t('messaging.unavailable')}
          description="Connectez Supabase pour activer la messagerie."
        />
      </Card>
    )
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{t('messaging.loading')}</p>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {mode === 'admin' && (
        <Card className="!p-4">
          <p className="text-sm font-medium text-slate-800 mb-2">Ouvrir une conversation avec un client</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={pickUserId}
              onChange={e => setPickUserId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">{t('messaging.pickUser')}</option>
              {clients.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} — {u.email} ({roleLabel(u.role)})
                </option>
              ))}
            </select>
            <Button onClick={() => void handleAdminOpen()} disabled={!pickUserId}>
              {t('messaging.open')}
            </Button>
          </div>
        </Card>
      )}

      <div
        className={cn(
          'grid gap-4',
          mode === 'admin' ? 'lg:grid-cols-[280px_1fr]' : 'grid-cols-1',
        )}
      >
        {mode === 'admin' && (
          <Card className="!p-0 overflow-hidden max-h-[70vh] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-900 text-sm">
              {t('messaging.conversations')}
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <p className="text-sm text-slate-500 p-4">{t('messaging.noConversations')}</p>
              ) : (
                conversations.map(c => {
                  const unread = c.adminUnread
                  const selected = c.id === activeId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                        selected && 'bg-purple-50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{c.clientName}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {roleLabel(c.clientRole)} · {c.clientEmail}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {c.lastMessagePreview || t('messaging.noMessages')}
                          </p>
                        </div>
                        {unread > 0 && (
                          <span className="shrink-0 text-[11px] font-bold bg-purple-600 text-white rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </Card>
        )}

        <Card className="!p-0 overflow-hidden flex flex-col min-h-[420px] max-h-[70vh]">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              {mode === 'admin' ? (
                <UserRound className="w-4 h-4 text-slate-600" />
              ) : (
                <Shield className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {mode === 'admin'
                  ? active
                    ? `${active.clientName} (${roleLabel(active.clientRole)})`
                    : t('messaging.select')
                  : t('messaging.support')}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {mode === 'admin'
                  ? active?.clientEmail || 'Répondez aux messages des clients'
                  : 'Écrivez à l’équipe administrateur'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/60">
            {!active ? (
              <EmptyState
                icon={MessageSquare}
                title={t('messaging.noConversation')}
                description={
                  mode === 'admin'
                    ? 'Ouvrez une conversation avec un client ou attendez un message.'
                    : 'Impossible d’ouvrir la messagerie.'
                }
              />
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                {t('messaging.noMessages')}
              </p>
            ) : (
              messages.map(m => {
                const mine = m.senderId === currentUser?.id
                return (
                  <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm',
                        mine ? bubbleMine : 'bg-white text-slate-800 border border-slate-100',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={cn('text-[10px] mt-1', mine ? 'text-white/70' : 'text-slate-400')}>
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={2}
                disabled={!active || sending}
                placeholder={active ? t('messaging.placeholder') : t('messaging.select')}
                className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-slate-50"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
              />
              <Button
                icon={Send}
                loading={sending}
                disabled={!active || !draft.trim()}
                onClick={() => void handleSend()}
              >
                {t('commonApp.send')}
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">{t('messaging.hint')}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
