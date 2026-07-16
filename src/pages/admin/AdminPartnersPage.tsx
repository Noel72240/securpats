import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, Save, Handshake, Eye, EyeOff, ExternalLink, Upload, X,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge, Card, Modal } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadSiteAssetFile } from '@/lib/supabase/uploads'
import type { SitePartner } from '@/types'

function newId() {
  return `partner-${Date.now().toString(36)}`
}

type Draft = {
  id: string
  name: string
  description: string
  logoUrl: string
  websiteUrl: string
  isNew: boolean
}

function emptyDraft(): Draft {
  return { id: newId(), name: '', description: '', logoUrl: '', websiteUrl: '', isNew: true }
}

function partnerToDraft(p: SitePartner): Draft {
  return { ...p, isNew: false }
}

export default function AdminPartnersPage() {
  const { siteSettings, updateSiteSettings } = useApp()
  const partners = siteSettings.partners
  const [enabled, setEnabled] = useState(partners.enabled)
  const [title, setTitle] = useState(partners.title)
  const [subtitle, setSubtitle] = useState(partners.subtitle)
  const [items, setItems] = useState<SitePartner[]>(partners.items)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEnabled(partners.enabled)
    setTitle(partners.title)
    setSubtitle(partners.subtitle)
    setItems(partners.items)
  }, [partners])

  const savePage = async () => {
    setSaving(true)
    setError(null)
    updateSiteSettings({
      partners: {
        enabled,
        title: title.trim() || 'Nos partenaires',
        subtitle: subtitle.trim(),
        items,
      },
    })
    setSaving(false)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const savePartner = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      setError('Le nom du partenaire est obligatoire.')
      return
    }
    const partner: SitePartner = {
      id: draft.id,
      name: draft.name.trim(),
      description: draft.description.trim(),
      logoUrl: draft.logoUrl.trim(),
      websiteUrl: draft.websiteUrl.trim(),
    }
    setItems(prev => {
      const exists = prev.some(p => p.id === partner.id)
      return exists ? prev.map(p => (p.id === partner.id ? partner : p)) : [...prev, partner]
    })
    setDraft(null)
    setError(null)
  }

  const removePartner = (id: string) => {
    if (!window.confirm('Supprimer ce partenaire ?')) return
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const onUpload = async (file: File | null) => {
    if (!file || !draft) return
    if (!isSupabaseConfigured()) {
      setError('Upload image nécessite Supabase.')
      return
    }
    setUploading(true)
    const { publicUrl, error: upErr } = await uploadSiteAssetFile('partners', file)
    setUploading(false)
    if (upErr || !publicUrl) {
      setError(upErr || 'Échec upload')
      return
    }
    setDraft(prev => prev ? { ...prev, logoUrl: publicUrl } : prev)
  }

  return (
    <DashboardLayout variant="admin" title="Partenaires">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Page partenaires</h2>
          <p className="text-sm text-slate-500 mt-1">
            Préparez vos partenaires à l’avance. La page reste invisible tant que vous ne l’activez pas.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</div>
        )}
        {saved && (
          <div className="text-sm text-brand-800 bg-brand-50 border border-brand-100 px-4 py-3 rounded-xl">
            Enregistré. {enabled ? 'La page est visible sur le site.' : 'La page reste masquée.'}
          </div>
        )}

        <Card className="!p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {enabled ? <Eye className="w-5 h-5 text-brand-600 mt-0.5" /> : <EyeOff className="w-5 h-5 text-slate-400 mt-0.5" />}
              <div>
                <p className="font-semibold text-slate-900">Afficher la page Partenaires</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Active le menu « Partenaires » et l’URL /partenaires.
                </p>
              </div>
            </div>
            <label className="inline-flex items-center gap-3 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-brand-600"
              />
              <Badge variant={enabled ? 'success' : 'default'}>{enabled ? 'Activée' : 'Masquée'}</Badge>
            </label>
          </div>
        </Card>

        <Card className="!p-5 space-y-4">
          <Input label="Titre de la page" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea
            label="Sous-titre"
            rows={2}
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
          />
        </Card>

        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">Liste des partenaires ({items.length})</h3>
          <Button size="sm" icon={Plus} onClick={() => setDraft(emptyDraft())}>Ajouter</Button>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-10">
            <Handshake className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm mb-4">Aucun partenaire pour l’instant — vous pourrez en ajouter plus tard.</p>
            <Button variant="outline" icon={Plus} onClick={() => setDraft(emptyDraft())}>Préparer un partenaire</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(p => (
              <Card key={p.id} className="!p-4">
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border overflow-hidden flex items-center justify-center shrink-0">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Handshake className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    {p.description && <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{p.description}</p>}
                    {p.websiteUrl && (
                      <a href={p.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-700 mt-1 hover:underline">
                        {p.websiteUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" variant="outline" icon={Pencil} onClick={() => setDraft(partnerToDraft(p))}>Modifier</Button>
                      <Button size="sm" variant="ghost" icon={Trash2} className="!text-red-600" onClick={() => removePartner(p.id)}>Suppr.</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button icon={Save} disabled={saving} onClick={() => void savePage()}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          {enabled && (
            <a href="/partenaires" target="_blank" rel="noreferrer" className="text-sm text-brand-700 font-medium self-center hover:underline">
              Voir la page →
            </a>
          )}
        </div>
      </div>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.isNew ? 'Nouveau partenaire' : 'Modifier le partenaire'}
        size="lg"
      >
        {draft && (
          <div className="space-y-4">
            <Input label="Nom *" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
            <Textarea
              label="Description"
              rows={3}
              value={draft.description}
              onChange={e => setDraft({ ...draft, description: e.target.value })}
            />
            <Input
              label="Site web (URL)"
              value={draft.websiteUrl}
              onChange={e => setDraft({ ...draft, websiteUrl: e.target.value })}
              placeholder="https://…"
            />

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-semibold text-sm text-slate-900">Logo</p>
              {draft.logoUrl ? (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white border">
                  <img src={draft.logoUrl} alt="" className="w-full h-full object-contain p-2" />
                  <button type="button" className="absolute top-1 right-1 p-1 bg-white/90 rounded-md" onClick={() => setDraft({ ...draft, logoUrl: '' })}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={e => {
                    void onUpload(e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />
                <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Upload…' : 'Choisir un logo'}
                </span>
              </label>
              <Input
                label="Ou coller une URL"
                value={draft.logoUrl}
                onChange={e => setDraft({ ...draft, logoUrl: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button onClick={savePartner}>Ajouter à la liste</Button>
              <Button variant="outline" onClick={() => setDraft(null)}>Annuler</Button>
            </div>
            <p className="text-xs text-slate-500">Pensez à cliquer sur « Enregistrer » en bas de page pour publier les changements.</p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
