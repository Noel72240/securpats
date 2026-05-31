import { useState } from 'react'
import { Plus, Users, GripVertical, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, Modal } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useOwnerReferents, useApp } from '@/contexts/AppContext'
import type { Referent } from '@/types'

const emptyRef = { firstName: '', lastName: '', phone: '', email: '', address: '' }

export default function ReferentsPage() {
  const referents = useOwnerReferents()
  const { addReferent, updateReferent, deleteReferent, reorderReferents } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Referent | null>(null)
  const [form, setForm] = useState(emptyRef)
  const [referentConsent, setReferentConsent] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const openCreate = () => { setEditing(null); setForm(emptyRef); setReferentConsent(false); setModalOpen(true) }
  const openEdit = (ref: Referent) => { setEditing(ref); setForm({ ...ref }); setReferentConsent(true); setModalOpen(true) }

  const handleSave = () => {
    if (!editing && !referentConsent) return
    if (editing) updateReferent(editing.id, form)
    else addReferent(form)
    setModalOpen(false)
  }

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const ids = referents.map(r => r.id)
    const [moved] = ids.splice(dragIndex, 1)
    ids.splice(index, 0, moved)
    reorderReferents(ids)
    setDragIndex(index)
  }

  return (
    <DashboardLayout variant="owner" title="Référents d'urgence">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-600">{referents.length}/5 référents enregistrés</p>
          <Button icon={Plus} onClick={openCreate} disabled={referents.length >= 5}>Ajouter un référent</Button>
        </div>

        {referents.length === 0 ? (
          <Card>
            <EmptyState icon={Users} title="Aucun référent" description="Ajoutez des contacts de confiance qui seront alertés en cas d'urgence." action={<Button icon={Plus} onClick={openCreate}>Ajouter</Button>} />
          </Card>
        ) : (
          <div className="space-y-3">
            {referents.map((ref, i) => (
              <Card
                key={ref.id}
                hover
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e: React.DragEvent) => handleDragOver(e, i)}
                onDragEnd={() => setDragIndex(null)}
                className="cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {ref.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{ref.firstName} {ref.lastName}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{ref.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{ref.email}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ref.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(ref)} icon={Edit} />
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Supprimer ?')) deleteReferent(ref.id) }} icon={Trash2} className="text-red-500" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le référent' : 'Nouveau référent'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Nom" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Téléphone" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="Adresse" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          {!editing && (
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={referentConsent} onChange={e => setReferentConsent(e.target.checked)} className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              Je certifie avoir obtenu le consentement de cette personne pour enregistrer et afficher ses coordonnées sur la fiche de secours (RGPD) *
            </label>
          )}
          <Button onClick={handleSave} className="w-full" disabled={!editing && !referentConsent}>{editing ? 'Enregistrer' : 'Ajouter'}</Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
