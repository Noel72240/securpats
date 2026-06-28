import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchOwnerRescueBundle } from '@/lib/supabase/services'
import type { OwnerRescueBundle } from '@/lib/supabase/services'
import { useApp } from '@/contexts/AppContext'

export function useOwnerRescue(token: string) {
  const { currentUser, pets, referents, allUsers } = useApp()
  const [bundle, setBundle] = useState<OwnerRescueBundle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    if (isSupabaseConfigured()) {
      fetchOwnerRescueBundle(token).then(({ bundle: data }) => {
        setBundle(data)
        setLoading(false)
      })
      return
    }

    const owner = currentUser?.qrToken === token
      ? currentUser
      : allUsers.find(u => u.qrToken === token && u.role === 'owner')
    if (!owner) {
      setBundle(null)
      setLoading(false)
      return
    }

    const ownerPets = pets.filter(p => p.ownerId === owner.id)
    const ownerRefs = referents
      .filter(r => r.ownerId === owner.id)
      .sort((a, b) => a.priority - b.priority)

    setBundle({
      owner: { first_name: owner.firstName, last_name: owner.lastName },
      pets: ownerPets.map(p => ({
        name: p.name,
        species: p.species,
        breed: p.breed,
        sex: p.sex,
        birth_date: p.birthDate,
        weight: p.weight,
        photo: p.photo ?? null,
        allergies: p.allergies,
        treatments: p.treatments,
        special_instructions: p.specialInstructions,
        diet: p.diet,
        vet_name: p.vetName,
        vet_phone: p.vetPhone,
        vet_address: p.vetAddress,
        identification_number: p.identificationNumber,
        qr_token: p.qrToken,
      })),
      referents: ownerRefs.map(r => ({
        priority: r.priority,
        first_name: r.firstName,
        last_name: r.lastName,
        phone: r.phone,
        email: r.email,
        address: r.address,
      })),
    })
    setLoading(false)
  }, [token, currentUser, pets, referents, allUsers])

  return { bundle, loading }
}
