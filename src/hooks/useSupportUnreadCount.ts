import { useCallback, useEffect, useState } from 'react'
import { fetchUnreadSupportCount } from '@/lib/messaging/api'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useApp } from '@/contexts/AppContext'

/** Pastille rouge : temps réel Supabase + poll de secours (sans F5). */
export function useSupportUnreadCount(enabled: boolean, isAdmin: boolean) {
  const { currentUser } = useApp()
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    if (!enabled || !isSupabaseConfigured() || !currentUser) {
      setCount(0)
      return
    }
    void fetchUnreadSupportCount(isAdmin).then(n => {
      setCount(prev => (prev === n ? prev : n))
    })
  }, [enabled, isAdmin, currentUser])

  useEffect(() => {
    refresh()
    if (!enabled || !isSupabaseConfigured() || !currentUser) return

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    const interval = window.setInterval(refresh, 4_000)
    window.addEventListener('support-unread-changed', refresh)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibility)

    const uid = currentUser.id
    const channel = getSupabase()
      .channel(`support-unread-${isAdmin ? 'admin' : uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations',
          ...(isAdmin ? {} : { filter: `client_id=eq.${uid}` }),
        },
        () => refresh(),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        () => refresh(),
      )
      .subscribe()

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('support-unread-changed', refresh)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibility)
      void getSupabase().removeChannel(channel)
    }
  }, [enabled, isAdmin, currentUser, refresh])

  return count
}
