import { useState } from 'react'
import { Upload, Save, User } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadAvatarFile, uploadPetSitterDocFile } from '@/lib/supabase/uploads'

function fileLabel(path?: string) {
  if (!path) return 'Cliquez pour uploader'
  return path.split('/').pop() || path
}

export default function PetSitterProfilePage() {
  const { currentUser, petSitterProfile, updatePetSitterProfile } = useApp()
  const [form, setForm] = useState({
    bio: petSitterProfile?.bio || '',
    phone: petSitterProfile?.phone || '',
    email: petSitterProfile?.email || '',
    address: petSitterProfile?.address || '',
    photo: petSitterProfile?.photo || '',
  })
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSave = () => updatePetSitterProfile(form)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    if (!isSupabaseConfigured()) {
      setForm(f => ({ ...f, photo: file.name }))
      e.target.value = ''
      return
    }
    setUploading('photo')
    const { publicUrl, error: uploadError } = await uploadAvatarFile(currentUser.id, file)
    setUploading(null)
    if (publicUrl) setForm(f => ({ ...f, photo: publicUrl }))
    else setError(uploadError || 'Échec upload photo')
    e.target.value = ''
  }

  const handleFileUpload = (field: 'idDocument' | 'proofOfAddress', kind: 'id' | 'address') =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !currentUser) return
      if (!isSupabaseConfigured()) {
        updatePetSitterProfile({ [field]: file.name })
        e.target.value = ''
        return
      }
      setUploading(field)
      const { path, error: uploadError } = await uploadPetSitterDocFile(currentUser.id, kind, file)
      setUploading(null)
      if (path) updatePetSitterProfile({ [field]: path })
      else setError(uploadError || 'Échec upload document')
      e.target.value = ''
    }

  return (
    <DashboardLayout variant="petsitter" title="Mon profil">
      <div className="max-w-2xl space-y-6">
        <Card padding="lg">
          <div className="flex items-center gap-4 mb-6">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Profil Pet-Sitter</h2>
              {petSitterProfile?.verified && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">✓ Vérifié</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Input label="URL Photo" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} />
            {isSupabaseConfigured() && (
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">Photo (upload Supabase)</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading === 'photo'} className="text-sm" />
              </label>
            )}
            <Textarea label="Présentation" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            <Input label="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Adresse" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Documents d'identité</h3>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload('idDocument', 'id')} disabled={uploading === 'idDocument'} />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Pièce d'identité</p>
                <p className="text-xs text-slate-400 mt-1">
                  {uploading === 'idDocument' ? 'Upload en cours...' : fileLabel(petSitterProfile?.idDocument)}
                </p>
              </div>
            </label>
            <label className="block">
              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload('proofOfAddress', 'address')} disabled={uploading === 'proofOfAddress'} />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Justificatif domicile</p>
                <p className="text-xs text-slate-400 mt-1">
                  {uploading === 'proofOfAddress' ? 'Upload en cours...' : fileLabel(petSitterProfile?.proofOfAddress)}
                </p>
              </div>
            </label>
          </div>
        </Card>

        <Button icon={Save} onClick={handleSave}>Enregistrer le profil</Button>
      </div>
    </DashboardLayout>
  )
}
