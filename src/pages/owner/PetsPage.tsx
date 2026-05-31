import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Dog, Edit, Trash2, Search, ImagePlus } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, Modal } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useOwnerPets, useApp } from '@/contexts/AppContext'
import { calculateAge } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadPetPhotoFile } from '@/lib/supabase/uploads'
import type { Pet } from '@/types'

type PetForm = Omit<Pet, 'id' | 'ownerId' | 'qrToken' | 'createdAt'>

const emptyPet: PetForm = {
  name: '', species: 'Chien', breed: '', sex: 'Mâle', birthDate: '',
  weight: 0, color: '', identificationNumber: '', treatments: '', allergies: '',
  diet: '', specialInstructions: '', vetName: '', vetPhone: '', vetAddress: '', photo: '',
}

export default function PetsPage() {
  const pets = useOwnerPets()
  const { currentUser, addPet, updatePet, deletePet } = useApp()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Pet | null>(null)
  const [form, setForm] = useState<PetForm>(emptyPet)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase())
  )

  const resetPhotoState = () => {
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPendingPhoto(null)
    setPhotoPreview('')
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyPet)
    resetPhotoState()
    setModalOpen(true)
  }

  const openEdit = (pet: Pet) => {
    const { id: _id, ownerId: _oid, qrToken: _qt, createdAt: _ca, ...rest } = pet
    setEditing(pet)
    setForm(rest)
    resetPhotoState()
    setPhotoPreview(pet.photo || '')
    setModalOpen(true)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPendingPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const uploadPhotoForPet = async (petId: string, file: File) => {
    if (!currentUser || !isSupabaseConfigured()) return null
    setPhotoUploading(true)
    const { publicUrl, error } = await uploadPetPhotoFile(currentUser.id, petId, file)
    setPhotoUploading(false)
    if (error) {
      alert(`Upload photo échoué : ${error}`)
      return null
    }
    return publicUrl
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)

    if (editing) {
      let photoUrl = form.photo
      if (pendingPhoto) {
        const uploaded = await uploadPhotoForPet(editing.id, pendingPhoto)
        if (uploaded) photoUrl = uploaded
      }
      updatePet(editing.id, { ...form, photo: photoUrl })
      setModalOpen(false)
      resetPhotoState()
      setSaving(false)
      return
    }

    const created = await addPet(form)
    if (created && pendingPhoto) {
      const uploaded = await uploadPhotoForPet(created.id, pendingPhoto)
      if (uploaded) updatePet(created.id, { photo: uploaded })
    }

    setModalOpen(false)
    resetPhotoState()
    setSaving(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet animal ?')) deletePet(id)
  }

  return (
    <DashboardLayout variant="owner" title="Mes animaux">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Rechercher un animal..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button icon={Plus} onClick={openCreate}>Ajouter un animal</Button>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={Dog}
              title="Aucun animal"
              description="Ajoutez votre premier compagnon pour commencer à le protéger."
              action={<Button icon={Plus} onClick={openCreate}>Ajouter un animal</Button>}
            />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(pet => (
              <Card key={pet.id} hover>
                <div className="flex items-start gap-4">
                  {pet.photo ? (
                    <img src={pet.photo} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                      <Dog className="w-8 h-8 text-brand-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{pet.name}</h3>
                    <p className="text-sm text-slate-500">{pet.species} — {pet.breed}</p>
                    <p className="text-xs text-slate-400 mt-1">{calculateAge(pet.birthDate)} — {pet.weight} kg</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link to={`/app/animaux/${pet.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" icon={Edit}>Fiche</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(pet)} icon={Edit} />
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(pet.id)} icon={Trash2} className="text-red-500 hover:bg-red-50" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetPhotoState() }} title={editing ? 'Modifier l\'animal' : 'Nouvel animal'}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <Input label="Nom" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Espèce" value={form.species} onChange={e => setForm({ ...form, species: e.target.value })}
              options={[{ value: 'Chien', label: 'Chien' }, { value: 'Chat', label: 'Chat' }, { value: 'Lapin', label: 'Lapin' }, { value: 'Autre', label: 'Autre' }]} />
            <Input label="Race" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Sexe" value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value as 'Mâle' | 'Femelle' })}
              options={[{ value: 'Mâle', label: 'Mâle' }, { value: 'Femelle', label: 'Femelle' }]} />
            <Input label="Date de naissance" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Poids (kg)" type="number" value={form.weight || ''} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} />
            <Input label="Couleur" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          </div>
          <Input label="N° identification" value={form.identificationNumber} onChange={e => setForm({ ...form, identificationNumber: e.target.value })} />

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">Photo de l&apos;animal</span>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" disabled={photoUploading} />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {photoUploading ? 'Upload...' : 'Choisir une photo'}
                </span>
              </label>
            </div>
            {!isSupabaseConfigured() && (
              <p className="text-xs text-slate-500 mt-1">Mode démo : la photo sera enregistrée localement uniquement.</p>
            )}
          </div>

          <Textarea label="Traitements" value={form.treatments} onChange={e => setForm({ ...form, treatments: e.target.value })} />
          <Textarea label="Allergies" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
          <Textarea label="Alimentation" value={form.diet} onChange={e => setForm({ ...form, diet: e.target.value })} />
          <Textarea label="Consignes particulières" value={form.specialInstructions} onChange={e => setForm({ ...form, specialInstructions: e.target.value })} />
          <Input label="Vétérinaire" value={form.vetName} onChange={e => setForm({ ...form, vetName: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tél. vétérinaire" value={form.vetPhone} onChange={e => setForm({ ...form, vetPhone: e.target.value })} />
            <Input label="Adresse vétérinaire" value={form.vetAddress} onChange={e => setForm({ ...form, vetAddress: e.target.value })} />
          </div>
          <Button onClick={handleSave} className="w-full" loading={saving || photoUploading}>
            {editing ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
