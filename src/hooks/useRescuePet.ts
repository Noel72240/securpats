import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchPetByQrToken, fetchReferentsByQrToken } from '@/lib/supabase/services'
import { useApp } from '@/contexts/AppContext'
import type { Pet, Referent } from '@/types'

export function useRescuePet(token: string) {
  const { pets, referents } = useApp()
  const [pet, setPet] = useState<Pet | null>(null)
  const [rescueReferents, setRescueReferents] = useState<Referent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    if (isSupabaseConfigured()) {
      Promise.all([
        fetchPetByQrToken(token),
        fetchReferentsByQrToken(token),
      ]).then(([{ pet: fetchedPet }, { referents: refs }]) => {
        setPet(fetchedPet)
        setRescueReferents(refs)
        setLoading(false)
      })
    } else {
      const localPet = pets.find(p => p.qrToken === token) ?? null
      setPet(localPet)
      if (localPet) {
        setRescueReferents(
          referents.filter(r => r.ownerId === localPet.ownerId).sort((a, b) => a.priority - b.priority).slice(0, 3)
        )
      }
      setLoading(false)
    }
  }, [token, pets, referents])

  return { pet, referents: rescueReferents, loading }
}
