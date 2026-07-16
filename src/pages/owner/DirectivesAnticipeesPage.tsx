import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Save, ScrollText, CheckCircle2, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { SignaturePad } from '@/components/ui/SignaturePad'
import { useApp, useOwnerPets, useOwnerReferents } from '@/contexts/AppContext'
import {
  emptyAdvanceDirectives,
  fetchAdvanceDirectives,
  upsertAdvanceDirectives,
} from '@/lib/directives/api'
import type { AdvanceDirectives } from '@/lib/directives/types'
import { LEGAL_VERSION } from '@/lib/legal/constants'
import { formatDate } from '@/lib/utils'

type FormState = Omit<AdvanceDirectives, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }

function GuardianFields({
  title,
  hint,
  name,
  phone,
  relation,
  onChange,
}: {
  title: string
  hint: string
  name: string
  phone: string
  relation: string
  onChange: (patch: { name?: string; phone?: string; relation?: string }) => void
}) {
  return (
    <div className="space-y-3 p-4 rounded-xl border border-slate-100 bg-slate-50/70">
      <div>
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="Nom et prénom" value={name} onChange={e => onChange({ name: e.target.value })} />
        <Input label="Téléphone" value={phone} onChange={e => onChange({ phone: e.target.value })} />
      </div>
      <Input
        label="Lien / relation"
        value={relation}
        onChange={e => onChange({ relation: e.target.value })}
        placeholder="Ex. sœur, ami, pet-sitter…"
      />
    </div>
  )
}

export default function DirectivesAnticipeesPage() {
  const { currentUser } = useApp()
  const pets = useOwnerPets()
  const referents = useOwnerReferents()
  const [form, setForm] = useState<FormState>(() => emptyAdvanceDirectives(currentUser?.id ?? ''))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!currentUser) return
    void (async () => {
      setLoading(true)
      const { directives, error: err } = await fetchAdvanceDirectives(currentUser.id)
      if (err) setError(err)
      if (directives) {
        setForm({
          id: directives.id,
          ownerId: directives.ownerId,
          petIds: directives.petIds,
          priorityName: directives.priorityName,
          priorityPhone: directives.priorityPhone,
          priorityRelation: directives.priorityRelation,
          backupName: directives.backupName,
          backupPhone: directives.backupPhone,
          backupRelation: directives.backupRelation,
          tertiaryName: directives.tertiaryName,
          tertiaryPhone: directives.tertiaryPhone,
          tertiaryRelation: directives.tertiaryRelation,
          allowPartnerShelter: directives.allowPartnerShelter,
          allowFosterFamily: directives.allowFosterFamily,
          peopleToNotify: directives.peopleToNotify,
          specialInstructions: directives.specialInstructions,
          medication: directives.medication,
          feedingHabits: directives.feedingHabits,
          dailyHabits: directives.dailyHabits,
          veterinarianInfo: directives.veterinarianInfo,
          signedFullName: directives.signedFullName,
          signatureData: directives.signatureData,
          consentAccepted: directives.consentAccepted,
          consentVersion: directives.consentVersion,
          signedAt: directives.signedAt,
        })
      } else {
        setForm(emptyAdvanceDirectives(currentUser.id))
      }
      setLoading(false)
    })()
  }, [currentUser])

  const patch = (updates: Partial<FormState>) => setForm(prev => ({ ...prev, ...updates }))

  const fillFromReferent = (level: 'priority' | 'backup' | 'tertiary', referentId: string) => {
    const ref = referents.find(r => r.id === referentId)
    if (!ref) return
    const name = `${ref.firstName} ${ref.lastName}`.trim()
    if (level === 'priority') {
      patch({ priorityName: name, priorityPhone: ref.phone, priorityRelation: 'Référent SécurPats' })
    } else if (level === 'backup') {
      patch({ backupName: name, backupPhone: ref.phone, backupRelation: 'Référent SécurPats' })
    } else {
      patch({ tertiaryName: name, tertiaryPhone: ref.phone, tertiaryRelation: 'Référent SécurPats' })
    }
  }

  const togglePet = (petId: string) => {
    setForm(prev => {
      const has = prev.petIds.includes(petId)
      return {
        ...prev,
        petIds: has ? prev.petIds.filter(id => id !== petId) : [...prev.petIds, petId],
      }
    })
  }

  const handleSave = async () => {
    if (!currentUser) return
    if (!form.priorityName.trim()) {
      setError('Indiquez au moins la personne prioritaire à qui confier vos animaux.')
      return
    }
    if (!form.consentAccepted) {
      setError('Vous devez accepter les conditions et confirmer vos directives.')
      return
    }
    if (!form.signedFullName.trim()) {
      setError('Saisissez votre nom complet pour la signature.')
      return
    }
    if (!form.signatureData) {
      setError('Merci de signer dans le cadre prévu.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    const payload = {
      ...form,
      ownerId: currentUser.id,
      consentVersion: LEGAL_VERSION,
      signedAt: new Date().toISOString(),
      consentAccepted: true,
    }
    const { directives, error: err } = await upsertAdvanceDirectives(payload)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    if (directives) {
      setForm({
        id: directives.id,
        ownerId: directives.ownerId,
        petIds: directives.petIds,
        priorityName: directives.priorityName,
        priorityPhone: directives.priorityPhone,
        priorityRelation: directives.priorityRelation,
        backupName: directives.backupName,
        backupPhone: directives.backupPhone,
        backupRelation: directives.backupRelation,
        tertiaryName: directives.tertiaryName,
        tertiaryPhone: directives.tertiaryPhone,
        tertiaryRelation: directives.tertiaryRelation,
        allowPartnerShelter: directives.allowPartnerShelter,
        allowFosterFamily: directives.allowFosterFamily,
        peopleToNotify: directives.peopleToNotify,
        specialInstructions: directives.specialInstructions,
        medication: directives.medication,
        feedingHabits: directives.feedingHabits,
        dailyHabits: directives.dailyHabits,
        veterinarianInfo: directives.veterinarianInfo,
        signedFullName: directives.signedFullName,
        signatureData: directives.signatureData,
        consentAccepted: directives.consentAccepted,
        consentVersion: directives.consentVersion,
        signedAt: directives.signedAt,
      })
    }
    setSuccess('Directives anticipées enregistrées et signées électroniquement.')
  }

  return (
    <DashboardLayout variant="owner" title="Directives anticipées">
      <div className="max-w-3xl space-y-6">
        <Card padding="lg">
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
              <ScrollText className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Directives anticipées</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Indiquez à qui confier vos animaux en cas de décès, et vos consignes de soin.
                Vous validez le document par signature électronique.
              </p>
              {form.signedAt && (
                <p className="text-xs text-brand-700 mt-2 inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dernière signature le {formatDate(form.signedAt)}
                </p>
              )}
            </div>
          </div>
        </Card>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : (
          <>
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
            )}
            {success && (
              <div className="text-sm text-brand-800 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">{success}</div>
            )}

            <Card padding="lg" className="space-y-4">
              <h3 className="font-semibold text-slate-900">Animaux concernés</h3>
              <p className="text-xs text-slate-500 -mt-2">
                Laissez tout décoché pour appliquer à tous vos animaux, ou cochez ceux concernés.
              </p>
              {pets.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Ajoutez d’abord un animal dans{' '}
                  <Link to="/app/animaux" className="underline font-medium">Mes animaux</Link>.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pets.map(pet => {
                    const on = form.petIds.includes(pet.id)
                    return (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => togglePet(pet.id)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border ${
                          on
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {pet.name}
                      </button>
                    )
                  })}
                </div>
              )}
              {form.petIds.length === 0 && pets.length > 0 && (
                <p className="text-xs text-brand-700">Tous vos animaux seront concernés.</p>
              )}
            </Card>

            <Card padding="lg" className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-900">À qui confier vos animaux</h3>
              </div>

              {referents.length > 0 && (
                <div className="text-xs text-slate-500 space-y-2 p-3 rounded-xl bg-brand-50/50 border border-brand-100">
                  <p className="font-medium text-brand-800">Remplir depuis un référent SécurPats :</p>
                  <div className="flex flex-wrap gap-2">
                    {referents.map(r => (
                      <div key={r.id} className="flex flex-wrap gap-1">
                        <Button type="button" size="sm" variant="outline" onClick={() => fillFromReferent('priority', r.id)}>
                          Prio ← {r.firstName}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => fillFromReferent('backup', r.id)}>
                          Relais
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => fillFromReferent('tertiary', r.id)}>
                          3e
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <GuardianFields
                title="1. Personne prioritaire"
                hint="À qui confier en premier vos animaux."
                name={form.priorityName}
                phone={form.priorityPhone}
                relation={form.priorityRelation}
                onChange={p => patch({
                  priorityName: p.name ?? form.priorityName,
                  priorityPhone: p.phone ?? form.priorityPhone,
                  priorityRelation: p.relation ?? form.priorityRelation,
                })}
              />
              <GuardianFields
                title="2. Si cette personne est indisponible"
                hint="Personne de relais si la prioritaire ne répond pas ou est absente."
                name={form.backupName}
                phone={form.backupPhone}
                relation={form.backupRelation}
                onChange={p => patch({
                  backupName: p.name ?? form.backupName,
                  backupPhone: p.phone ?? form.backupPhone,
                  backupRelation: p.relation ?? form.backupRelation,
                })}
              />
              <GuardianFields
                title="3. Si cette personne ne peut pas les prendre"
                hint="Solution de secours si les deux premières ne peuvent pas accueillir."
                name={form.tertiaryName}
                phone={form.tertiaryPhone}
                relation={form.tertiaryRelation}
                onChange={p => patch({
                  tertiaryName: p.name ?? form.tertiaryName,
                  tertiaryPhone: p.phone ?? form.tertiaryPhone,
                  tertiaryRelation: p.relation ?? form.tertiaryRelation,
                })}
              />
            </Card>

            <Card padding="lg" className="space-y-4">
              <h3 className="font-semibold text-slate-900">Autorisations</h3>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.allowPartnerShelter}
                  onChange={e => patch({ allowPartnerShelter: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm text-slate-800">
                  J’autorise à confier temporairement mon/mes animal(aux) à un <strong>refuge partenaire</strong>
                  si aucune personne désignée ne peut les prendre.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.allowFosterFamily}
                  onChange={e => patch({ allowFosterFamily: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm text-slate-800">
                  J’autorise à faire appel à une <strong>famille d’accueil</strong>
                  si besoin pour assurer la continuité des soins.
                </span>
              </label>
              <Textarea
                label="Personnes à prévenir"
                rows={3}
                value={form.peopleToNotify}
                onChange={e => patch({ peopleToNotify: e.target.value })}
                placeholder="Noms, téléphones, lien de parenté…"
              />
            </Card>

            <Card padding="lg" className="space-y-4">
              <h3 className="font-semibold text-slate-900">Consignes de soin</h3>
              <Textarea
                label="Médicaments / traitements"
                rows={3}
                value={form.medication}
                onChange={e => patch({ medication: e.target.value })}
                placeholder="Posologie, horaires, allergies médicamenteuses…"
              />
              <Textarea
                label="Habitudes alimentaires"
                rows={3}
                value={form.feedingHabits}
                onChange={e => patch({ feedingHabits: e.target.value })}
                placeholder="Croquettes, rations, horaires, interdits…"
              />
              <Textarea
                label="Habitudes quotidiennes"
                rows={3}
                value={form.dailyHabits}
                onChange={e => patch({ dailyHabits: e.target.value })}
                placeholder="Sorties, lit, jouets, peurs, sociabilité…"
              />
              <Textarea
                label="Vétérinaire habituel"
                rows={2}
                value={form.veterinarianInfo}
                onChange={e => patch({ veterinarianInfo: e.target.value })}
                placeholder="Nom, adresse, téléphone…"
              />
              <Textarea
                label="Instructions particulières"
                rows={4}
                value={form.specialInstructions}
                onChange={e => patch({ specialInstructions: e.target.value })}
                placeholder="Toute consigne importante pour la prise en charge…"
              />
            </Card>

            <Card padding="lg" className="space-y-4">
              <h3 className="font-semibold text-slate-900">Signature électronique</h3>
              <p className="text-sm text-slate-500">
                En signant, vous confirmez que ces directives expriment votre volonté concernant
                la prise en charge de vos animaux.
              </p>
              <Input
                label="Nom et prénom du signataire *"
                value={form.signedFullName}
                onChange={e => patch({ signedFullName: e.target.value })}
                placeholder={`${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim()}
              />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1.5">Signature manuscrite *</p>
                <SignaturePad
                  key={form.id || form.signatureData ? `sig-${form.id || 'draft'}` : 'sig-empty'}
                  value={form.signatureData}
                  onChange={dataUrl => patch({ signatureData: dataUrl })}
                />
              </div>
              {form.signatureData && (
                <div className="rounded-xl border border-slate-100 p-3 bg-white">
                  <p className="text-xs text-slate-500 mb-2">Aperçu de la signature enregistrée</p>
                  <img src={form.signatureData} alt="Signature" className="h-16 object-contain" />
                </div>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consentAccepted}
                  onChange={e => patch({ consentAccepted: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 text-brand-600"
                />
                <span className="text-sm text-slate-800">
                  Je confirme l’exactitude de ces informations et j’autorise SécurPats à les
                  communiquer aux personnes et structures concernées en cas de besoin
                  (version {LEGAL_VERSION}).
                </span>
              </label>
              <Button icon={Save} loading={saving} onClick={() => void handleSave()}>
                Enregistrer et signer
              </Button>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
