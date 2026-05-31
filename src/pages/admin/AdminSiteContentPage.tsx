import { useState, useEffect } from 'react'
import {
  Save, RotateCcw, Mail, Phone, MapPin, Image, Home, MessageSquare,
  Plus, Trash2, Edit, CheckCircle, Building2, Wrench,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, Modal } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import { defaultSiteSettings } from '@/lib/mock/data'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadSiteAssetFile } from '@/lib/supabase/uploads'
import type { SiteSettings, SiteTestimonial, SiteMaintenanceMode } from '@/types'

type Tab = 'contact' | 'home' | 'testimonials' | 'legal' | 'maintenance'

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'contact', label: 'Contact & Adresse', icon: MapPin },
  { id: 'home', label: 'Accueil & Images', icon: Home },
  { id: 'testimonials', label: 'Témoignages', icon: MessageSquare },
  { id: 'legal', label: 'Légal & Footer', icon: Building2 },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
]

function ImagePreview({ url, alt, className }: { url: string; alt: string; className?: string }) {
  if (!url) {
    return (
      <div className={cn('bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0', className)}>
        <Image className="w-8 h-8" />
      </div>
    )
  }
  return <img src={url} alt={alt} className={cn('rounded-xl object-cover flex-shrink-0', className)} />
}

function ImageField({ label, value, onChange, previewClass, folder = 'images' }: {
  label: string; value: string; onChange: (v: string) => void; previewClass?: string; folder?: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isSupabaseConfigured()) {
      setUploading(true)
      const { publicUrl, error } = await uploadSiteAssetFile(folder, file)
      setUploading(false)
      if (publicUrl) onChange(publicUrl)
      else if (error) alert(`Upload échoué : ${error}`)
    } else {
      onChange(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-col sm:flex-row gap-4">
        <ImagePreview url={value} alt={label} className={previewClass || 'w-full sm:w-40 h-28'} />
        <div className="flex-1 space-y-2">
          <Input label="URL de l'image" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." />
          <label className="inline-flex cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            <span className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              {uploading ? 'Upload en cours...' : 'Uploader une image (Supabase Storage)'}
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

const emptyTestimonial: Omit<SiteTestimonial, 'id'> = {
  name: '', role: '', text: '', avatar: '',
}

export default function AdminSiteContentPage() {
  const { siteSettings, updateSiteSettings, resetSiteSettings, addTestimonial, updateTestimonial, deleteTestimonial } = useApp()
  const [tab, setTab] = useState<Tab>('contact')
  const [draft, setDraft] = useState<SiteSettings>(siteSettings)
  const [saved, setSaved] = useState(false)
  const [testimonialModal, setTestimonialModal] = useState<{ open: boolean; editing: SiteTestimonial | null; form: Omit<SiteTestimonial, 'id'> }>({
    open: false, editing: null, form: emptyTestimonial,
  })

  useEffect(() => {
    setDraft(siteSettings)
  }, [siteSettings])

  const handleSave = () => {
    updateSiteSettings(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    if (confirm('Réinitialiser tout le contenu du site aux valeurs par défaut ?')) {
      resetSiteSettings()
      setDraft(defaultSiteSettings)
    }
  }

  const openAddTestimonial = () => setTestimonialModal({ open: true, editing: null, form: emptyTestimonial })
  const openEditTestimonial = (t: SiteTestimonial) => setTestimonialModal({ open: true, editing: t, form: { name: t.name, role: t.role, text: t.text, avatar: t.avatar } })

  const saveTestimonial = () => {
    if (testimonialModal.editing) {
      updateTestimonial(testimonialModal.editing.id, testimonialModal.form)
    } else {
      addTestimonial(testimonialModal.form)
    }
    setTestimonialModal({ open: false, editing: null, form: emptyTestimonial })
  }

  const removeTestimonial = (id: string) => {
    if (confirm('Supprimer ce témoignage ?')) {
      deleteTestimonial(id)
      setDraft(prev => ({ ...prev, testimonials: prev.testimonials.filter(x => x.id !== id) }))
    }
  }

  return (
    <DashboardLayout variant="admin" title="Contenu du site">
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            Gérez les coordonnées, images et textes affichés sur le site public.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>Réinitialiser</Button>
            <Button size="sm" icon={saved ? CheckCircle : Save} onClick={handleSave}>
              {saved ? 'Enregistré !' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                tab === t.id ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'contact' && (
          <Card padding="lg">
            <CardHeader title="Coordonnées" subtitle="Affichées sur la page Contact et le footer" />
            <div className="space-y-4">
              <Input label="Nom du site" value={draft.siteName} onChange={e => setDraft({ ...draft, siteName: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Email" type="email" value={draft.contact.email} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })} />
                <Input label="Téléphone" value={draft.contact.phone} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, phone: e.target.value } })} />
              </div>
              <Input label="Adresse (ligne 1)" value={draft.contact.addressLine1} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, addressLine1: e.target.value } })} />
              <Input label="Adresse (ligne 2)" value={draft.contact.addressLine2} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, addressLine2: e.target.value } })} placeholder="Complément d'adresse (optionnel)" />
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Code postal" value={draft.contact.postalCode} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, postalCode: e.target.value } })} />
                <Input label="Ville" value={draft.contact.city} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, city: e.target.value } })} />
                <Input label="Pays" value={draft.contact.country} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, country: e.target.value } })} />
              </div>
              <ImageField label="Logo du site (optionnel)" value={draft.logoUrl} onChange={v => setDraft({ ...draft, logoUrl: v })} previewClass="w-20 h-20" />
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Aperçu contact</p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /><span>{draft.contact.email}</span></div>
                <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /><span>{draft.contact.phone}</span></div>
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /><span>{draft.contact.addressLine1}{draft.contact.addressLine2 && `, ${draft.contact.addressLine2}`}<br />{draft.contact.postalCode} {draft.contact.city}, {draft.contact.country}</span></div>
              </div>
            </div>
          </Card>
        )}

        {tab === 'home' && (
          <Card padding="lg">
            <CardHeader title="Page d'accueil" subtitle="Textes et visuels du hero et du bandeau CTA" />
            <div className="space-y-4">
              <Input label="Badge" value={draft.home.badge} onChange={e => setDraft({ ...draft, home: { ...draft.home, badge: e.target.value } })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Titre (partie 1)" value={draft.home.title} onChange={e => setDraft({ ...draft, home: { ...draft.home, title: e.target.value } })} />
                <Input label="Titre (partie mise en avant)" value={draft.home.titleHighlight} onChange={e => setDraft({ ...draft, home: { ...draft.home, titleHighlight: e.target.value } })} />
              </div>
              <Textarea label="Sous-titre" rows={3} value={draft.home.subtitle} onChange={e => setDraft({ ...draft, home: { ...draft.home, subtitle: e.target.value } })} />
              <ImageField label="Image hero (grande photo d'accueil)" value={draft.home.heroImage} onChange={v => setDraft({ ...draft, home: { ...draft.home, heroImage: v } })} previewClass="w-full h-48" />
              <Input label="Texte alternatif image" value={draft.home.heroImageAlt} onChange={e => setDraft({ ...draft, home: { ...draft.home, heroImageAlt: e.target.value } })} />
              <hr className="border-slate-100 my-6" />
              <Input label="Titre bandeau CTA" value={draft.home.ctaTitle} onChange={e => setDraft({ ...draft, home: { ...draft.home, ctaTitle: e.target.value } })} />
              <Textarea label="Sous-titre bandeau CTA" rows={2} value={draft.home.ctaSubtitle} onChange={e => setDraft({ ...draft, home: { ...draft.home, ctaSubtitle: e.target.value } })} />
            </div>
          </Card>
        )}

        {tab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">{draft.testimonials.length} témoignage(s) — pensez à enregistrer après modification</p>
              <Button size="sm" icon={Plus} onClick={openAddTestimonial}>Ajouter</Button>
            </div>
            {draft.testimonials.length === 0 ? (
              <Card className="text-center py-8 text-slate-500 text-sm">Aucun témoignage. Ajoutez-en un pour la page d'accueil.</Card>
            ) : (
              draft.testimonials.map(t => (
                <Card key={t.id} className="!p-4">
                  <div className="flex items-start gap-4">
                    {t.avatar ? (
                      <img src={t.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center"><Image className="w-5 h-5 text-slate-400" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2 italic">"{t.text}"</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" icon={Edit} onClick={() => openEditTestimonial(t)} />
                      <Button variant="ghost" size="sm" icon={Trash2} className="text-red-500" onClick={() => removeTestimonial(t.id)} />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === 'legal' && (
          <Card padding="lg">
            <CardHeader title="Informations légales & Footer" />
            <div className="space-y-4">
              <Textarea label="Description footer" rows={3} value={draft.footer.description} onChange={e => setDraft({ ...draft, footer: { ...draft.footer, description: e.target.value } })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Raison sociale" value={draft.legal.companyName} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, companyName: e.target.value } })} />
                <Input label="Forme juridique" placeholder="SAS, SARL, EI..." value={draft.legal.legalForm} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, legalForm: e.target.value } })} />
                <Input label="SIRET" value={draft.legal.siret} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, siret: e.target.value } })} />
                <Input label="RCS" value={draft.legal.rcs} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, rcs: e.target.value } })} />
                <Input label="N° TVA" value={draft.legal.vatNumber} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, vatNumber: e.target.value } })} />
                <Input label="Capital social" value={draft.legal.capital} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, capital: e.target.value } })} />
                <Input label="Directeur de publication" value={draft.legal.directorName} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, directorName: e.target.value } })} />
                <Input label="Email DPO (RGPD)" type="email" value={draft.legal.dpoEmail} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, dpoEmail: e.target.value } })} />
                <Input label="Hébergeur site" value={draft.legal.hostName} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, hostName: e.target.value } })} />
                <Input label="Hébergement données" value={draft.legal.dataHostName} onChange={e => setDraft({ ...draft, legal: { ...draft.legal, dataHostName: e.target.value } })} />
              </div>
              <p className="text-xs text-slate-500">Ces informations alimentent les mentions légales, CGU et politique de confidentialité.</p>
            </div>
          </Card>
        )}

        {tab === 'maintenance' && (
          <Card padding="lg">
            <CardHeader
              title="Bannière maintenance / développement"
              subtitle="Affiche une alerte sur tout le site et peut suspendre les paiements Stripe"
            />
            <div className="space-y-6">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  checked={draft.maintenance.enabled}
                  onChange={e => setDraft({
                    ...draft,
                    maintenance: { ...draft.maintenance, enabled: e.target.checked },
                  })}
                />
                <div>
                  <p className="font-semibold text-slate-900">Activer la bannière</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Visible sur le site public et les espaces connectés (propriétaire, pet-sitter, admin).
                  </p>
                </div>
              </label>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Type de bannière</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {([
                    { id: 'development' as SiteMaintenanceMode, label: 'En cours de développement', desc: 'Bannière jaune — site en préparation' },
                    { id: 'maintenance' as SiteMaintenanceMode, label: 'Maintenance', desc: 'Bannière orange — indisponibilité temporaire' },
                  ]).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraft({
                        ...draft,
                        maintenance: { ...draft.maintenance, mode: opt.id },
                      })}
                      className={cn(
                        'text-left p-4 rounded-xl border-2 transition-colors',
                        draft.maintenance.mode === opt.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <p className="font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="Message affiché"
                rows={3}
                value={draft.maintenance.message}
                onChange={e => setDraft({
                  ...draft,
                  maintenance: { ...draft.maintenance, message: e.target.value },
                })}
                placeholder="Ex. : Nous mettons à jour la plateforme. Les paiements reprendront très bientôt."
              />

              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  checked={draft.maintenance.blockPayments}
                  onChange={e => setDraft({
                    ...draft,
                    maintenance: { ...draft.maintenance, blockPayments: e.target.checked },
                  })}
                />
                <div>
                  <p className="font-semibold text-slate-900">Bloquer les paiements Stripe</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Empêche la création de sessions de paiement (checkout). Les abonnements déjà actifs restent gérables via le portail Stripe.
                  </p>
                </div>
              </label>

              {draft.maintenance.enabled && (
                <div className={cn(
                  'p-4 rounded-xl text-sm',
                  draft.maintenance.mode === 'development'
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-orange-50 border border-orange-200 text-orange-900',
                )}>
                  <p className="font-semibold">Aperçu de la bannière</p>
                  <p className="mt-1">
                    {draft.maintenance.mode === 'development' ? 'Site en cours de développement' : 'Maintenance en cours'}
                    {draft.maintenance.message && ` — ${draft.maintenance.message}`}
                    {draft.maintenance.blockPayments && ' · Paiements suspendus'}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500">
                Pensez à cliquer sur « Enregistrer » pour appliquer les changements sur le site en production.
              </p>
            </div>
          </Card>
        )}
      </div>

      <Modal open={testimonialModal.open} onClose={() => setTestimonialModal({ open: false, editing: null, form: emptyTestimonial })} title={testimonialModal.editing ? 'Modifier le témoignage' : 'Nouveau témoignage'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom" value={testimonialModal.form.name} onChange={e => setTestimonialModal(m => ({ ...m, form: { ...m.form, name: e.target.value } }))} />
            <Input label="Rôle" value={testimonialModal.form.role} onChange={e => setTestimonialModal(m => ({ ...m, form: { ...m.form, role: e.target.value } }))} />
          </div>
          <Textarea label="Témoignage" rows={4} value={testimonialModal.form.text} onChange={e => setTestimonialModal(m => ({ ...m, form: { ...m.form, text: e.target.value } }))} />
          <ImageField label="Photo" value={testimonialModal.form.avatar} onChange={v => setTestimonialModal(m => ({ ...m, form: { ...m.form, avatar: v } }))} previewClass="w-16 h-16 rounded-full" />
          <Button className="w-full" onClick={saveTestimonial}>Enregistrer le témoignage</Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
