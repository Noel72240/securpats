import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { departmentSelectOptions } from '@/lib/geo/french-departments'
import { CAREGIVER_UNIFIED } from '@/lib/caregiver/spaces'
import {
  ANIMAL_OPTIONS,
  AVAILABILITY_OPTIONS,
  DOG_SIZE_OPTIONS,
  EMERGENCY_DELAY_OPTIONS,
  ENGAGEMENT_OPTIONS,
  HOUSING_OPTIONS,
  RADIUS_OPTIONS,
  emptyQuestionnaire,
  engagementToKind,
  type CaregiverQuestionnaire,
} from '@/lib/caregiver/form'
import { validatePetsitterIdFile } from '@/lib/petsitter/validation'
import { apiUrl } from '@/lib/platform'

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-slate-100 pt-6 first:border-0 first:pt-0">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function CheckGroup({
  options,
  values,
  onChange,
}: {
  options: readonly { value: string; label: string }[]
  values: string[]
  onChange: (next: string[]) => void
}) {
  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v])
  }
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map(o => (
        <label key={o.value} className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-slate-300"
            checked={values.includes(o.value)}
            onChange={() => toggle(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={value === true} onChange={() => onChange(true)} />
          Oui
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={value === false} onChange={() => onChange(false)} />
          Non
        </label>
      </div>
    </div>
  )
}

function FileField({
  label,
  hint,
  required,
  file,
  onChange,
  accept = '.jpg,.jpeg,.png,.webp,.pdf',
}: {
  label: string
  hint?: string
  required?: boolean
  file: File | null
  onChange: (f: File | null) => void
  accept?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required ? ' *' : ''}
      </label>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <span className="py-2 px-3 rounded-lg bg-teal-50 text-teal-800 text-sm font-medium hover:bg-teal-100">
          Choisir un fichier
        </span>
        <span className="text-sm text-slate-500 truncate max-w-[14rem]">
          {file ? file.name : 'Aucun fichier choisi'}
        </span>
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={e => {
            onChange(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
      </label>
      {file && <p className="text-xs text-teal-700 mt-1">{file.name}</p>}
    </div>
  )
}

function MultiFileField({
  label,
  hint,
  files,
  onChange,
  accept = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
}: {
  label: string
  hint?: string
  files: File[]
  onChange: (files: File[]) => void
  accept?: string
}) {
  return (
    <div>
      <p className="block text-sm font-medium text-slate-700 mb-1">{label}</p>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <span className="py-2 px-3 rounded-lg bg-teal-50 text-teal-800 text-sm font-medium hover:bg-teal-100">
          Choisir des photos
        </span>
        <span className="text-sm text-slate-500">
          {files.length === 0 ? 'Aucun fichier choisi' : `${files.length} photo${files.length > 1 ? 's' : ''} sélectionnée${files.length > 1 ? 's' : ''}`}
        </span>
        <input
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={e => {
            const picked = Array.from(e.target.files || [])
            if (picked.length) onChange([...files, ...picked])
            e.target.value = ''
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center justify-between gap-2 text-xs text-teal-800">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                className="shrink-0 text-slate-500 hover:text-red-600 underline"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function CaregiverRegisterPage() {
  const navigate = useNavigate()
  const { registerCaregiver } = useApp()
  const loginPath = `${CAREGIVER_UNIFIED.basePath}/connexion`
  const deptOpts = departmentSelectOptions('fr')

  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    departmentCode: '',
    password: '',
    confirm: '',
  })
  const [engagementTypes, setEngagementTypes] = useState<string[]>([])
  const [radiusKm, setRadiusKm] = useState('')
  const [canTravel, setCanTravel] = useState<boolean | null>(null)
  const [hasVehicle, setHasVehicle] = useState<boolean | null>(null)
  const [q, setQ] = useState<CaregiverQuestionnaire>(emptyQuestionnaire())
  const [aboutMe, setAboutMe] = useState('')
  const [motivation, setMotivation] = useState('')
  const [importantNotes, setImportantNotes] = useState('')

  const [idFile, setIdFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [criminalFile, setCriminalFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [housingFiles, setHousingFiles] = useState<File[]>([])
  const [outdoorFiles, setOutdoorFiles] = useState<File[]>([])
  const [ownAnimalFiles, setOwnAnimalFiles] = useState<File[]>([])

  const [infoAccurate, setInfoAccurate] = useState(false)
  const [charterOk, setCharterOk] = useState(false)
  const [contactOk, setContactOk] = useState(false)
  const [confidentialOk, setConfidentialOk] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [awaitingEmail, setAwaitingEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const setQField = <K extends keyof CaregiverQuestionnaire>(key: K, value: CaregiverQuestionnaire[K]) => {
    setQ(prev => ({ ...prev, [key]: value }))
  }

  const needsFosterDocs = engagementTypes.includes('foster_family')

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-welcome', email: personal.email }),
      })
      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) setError(payload.error || 'Impossible d’envoyer l’email')
      else setSuccess(`Email renvoyé vers ${personal.email.trim().toLowerCase()}`)
    } catch {
      setError('Impossible d’envoyer l’email')
    }
    setResending(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setAwaitingEmail(false)

    if (personal.password !== personal.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (personal.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!personal.firstName || !personal.lastName || !personal.email || !personal.phone) {
      setError('Nom, prénom, téléphone et e-mail sont obligatoires.')
      return
    }
    if (!personal.birthDate || !personal.address || !personal.postalCode || !personal.city) {
      setError('Date de naissance et adresse complète sont obligatoires.')
      return
    }
    if (!personal.departmentCode) {
      setError('Veuillez sélectionner votre département.')
      return
    }
    if (engagementTypes.length === 0) {
      setError('Choisissez au moins un type d’engagement (bénévole et/ou famille d’accueil).')
      return
    }
    if (!radiusKm) {
      setError('Indiquez votre rayon d’intervention.')
      return
    }
    if (q.acceptedAnimals.length === 0) {
      setError('Sélectionnez au moins un type d’animaux acceptés.')
      return
    }
    if (!aboutMe.trim() || !motivation.trim()) {
      setError('Présentation et motivation sont obligatoires.')
      return
    }
    if (!idFile) {
      setError('La pièce d’identité est obligatoire.')
      return
    }
    const idErr = validatePetsitterIdFile(idFile)
    if (idErr) {
      setError(idErr)
      return
    }
    if (!addressFile) {
      setError('Le justificatif de domicile est obligatoire.')
      return
    }
    const addrErr = validatePetsitterIdFile(addressFile)
    if (addrErr) {
      setError(`Justificatif de domicile : ${addrErr}`)
      return
    }
    if (!infoAccurate || !charterOk || !contactOk || !confidentialOk || !termsAccepted || !privacyAccepted) {
      setError('Veuillez accepter tous les engagements et conditions.')
      return
    }

    const kind = engagementToKind(engagementTypes)
    setLoading(true)
    const result = await registerCaregiver({
      kind,
      engagementTypes,
      email: personal.email,
      password: personal.password,
      firstName: personal.firstName,
      lastName: personal.lastName,
      phone: personal.phone,
      address: personal.address,
      postalCode: personal.postalCode,
      city: personal.city,
      birthDate: personal.birthDate,
      departmentCode: personal.departmentCode,
      interventionRadiusKm: Number(radiusKm) || undefined,
      canTravel,
      hasVehicle,
      questionnaire: q,
      aboutMe,
      motivation,
      importantNotes,
      bio: aboutMe,
      idFile,
      proofOfAddressFile: addressFile,
      criminalRecordFile: criminalFile,
      insuranceFile: insuranceFile,
      housingFiles,
      outdoorFiles,
      ownAnimalsFiles: ownAnimalFiles,
      consent: {
        termsAccepted,
        privacyAccepted,
        infoAccurate,
        charterOk,
        contactOk,
        confidentialOk,
      },
    })
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setAwaitingEmail(true)
      setSuccess('Compte créé. Confirmez votre email, puis reconnectez-vous.')
      return
    }
    if (result.readyToLogin) {
      setAwaitingEmail(true)
      setSuccess(
        (result.message || 'Compte créé ! Votre dossier sera vérifié par SécurPats avant activation.')
        + ` Email de bienvenue envoyé à : ${personal.email.trim().toLowerCase()}.`,
      )
      return
    }
    navigate(CAREGIVER_UNIFIED.basePath)
  }

  return (
    <PublicLayout>
      <section className="py-10 sm:py-14 bg-gradient-to-b from-teal-50/80 to-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 mb-4">
              <Heart className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Devenir bénévole ou famille d’accueil
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl mx-auto text-sm sm:text-base">
              Formulaire complet pour rejoindre le réseau SécurPats. Votre profil sera vérifié
              (documents + validation) avant d’obtenir le badge « Profil vérifié ».
            </p>
          </div>

          <Card className="p-5 sm:p-8">
            {awaitingEmail ? (
              <div className="space-y-4 text-center py-4">
                <Mail className="w-10 h-10 text-teal-600 mx-auto" />
                <p className="text-slate-700">{success}</p>
                <p className="text-sm text-slate-500">
                  Vous pourrez vous connecter, puis compléter votre dossier. L’activation publique
                  attend la validation admin.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => navigate(loginPath)}>Se connecter</Button>
                  <Button variant="outline" loading={resending} onClick={() => void handleResend()}>
                    Renvoyer l’email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={e => void handleSubmit(e)} className="space-y-8">
                <Section title="1. Informations personnelles">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input label="Nom *" value={personal.lastName} onChange={e => setPersonal(p => ({ ...p, lastName: e.target.value }))} required />
                    <Input label="Prénom *" value={personal.firstName} onChange={e => setPersonal(p => ({ ...p, firstName: e.target.value }))} required />
                    <Input label="Date de naissance *" type="date" value={personal.birthDate} onChange={e => setPersonal(p => ({ ...p, birthDate: e.target.value }))} required />
                    <Input label="Téléphone *" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} required />
                    <Input label="E-mail *" type="email" className="sm:col-span-2" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} required />
                    <Input label="Adresse *" className="sm:col-span-2" value={personal.address} onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))} required />
                    <Input label="Code postal *" value={personal.postalCode} onChange={e => setPersonal(p => ({ ...p, postalCode: e.target.value }))} required />
                    <Input label="Ville *" value={personal.city} onChange={e => setPersonal(p => ({ ...p, city: e.target.value }))} required />
                    <Select
                      label="Département *"
                      value={personal.departmentCode}
                      onChange={e => setPersonal(p => ({ ...p, departmentCode: e.target.value }))}
                      options={[{ value: '', label: 'Choisir…' }, ...deptOpts]}
                      required
                    />
                    <div />
                    <Input label="Mot de passe *" type="password" value={personal.password} onChange={e => setPersonal(p => ({ ...p, password: e.target.value }))} required />
                    <Input label="Confirmer *" type="password" value={personal.confirm} onChange={e => setPersonal(p => ({ ...p, confirm: e.target.value }))} required />
                  </div>
                </Section>

                <Section title="2. Type d’engagement" subtitle="Vous pouvez cocher les deux.">
                  <CheckGroup options={ENGAGEMENT_OPTIONS} values={engagementTypes} onChange={setEngagementTypes} />
                </Section>

                <Section title="3. Zone d’intervention">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      label="Rayon d’intervention *"
                      value={radiusKm}
                      onChange={e => setRadiusKm(e.target.value)}
                      options={[{ value: '', label: 'Choisir…' }, ...RADIUS_OPTIONS.map(o => ({ value: o.value, label: o.label }))]}
                    />
                    <YesNo label="Possibilité de se déplacer ?" value={canTravel} onChange={setCanTravel} />
                    <YesNo label="Véhicule personnel ?" value={hasVehicle} onChange={setHasVehicle} />
                  </div>
                </Section>

                <Section title="4. Animaux acceptés">
                  <CheckGroup
                    options={ANIMAL_OPTIONS}
                    values={q.acceptedAnimals}
                    onChange={v => setQField('acceptedAnimals', v)}
                  />
                  {q.acceptedAnimals.includes('other') && (
                    <Input
                      label="Préciser (autres)"
                      value={q.acceptedAnimalsOther}
                      onChange={e => setQField('acceptedAnimalsOther', e.target.value)}
                    />
                  )}
                </Section>

                <Section title="5. Conditions d’accueil" subtitle="Surtout pour les familles d’accueil — utile aussi pour les bénévoles.">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Nombre max. d’animaux" value={q.maxAnimals} onChange={e => setQField('maxAnimals', e.target.value)} />
                    <Select
                      label="Taille maximale des chiens"
                      value={q.maxDogSize}
                      onChange={e => setQField('maxDogSize', e.target.value)}
                      options={[{ value: '', label: 'Choisir…' }, ...DOG_SIZE_OPTIONS.map(o => ({ value: o.value, label: o.label }))]}
                    />
                    <YesNo label="Mâles" value={q.acceptMales} onChange={v => setQField('acceptMales', v)} />
                    <YesNo label="Femelles" value={q.acceptFemales} onChange={v => setQField('acceptFemales', v)} />
                    <YesNo label="Animaux stérilisés uniquement ?" value={q.sterilizedOnly} onChange={v => setQField('sterilizedOnly', v)} />
                    <YesNo label="Chiots / chatons acceptés ?" value={q.acceptPuppiesKittens} onChange={v => setQField('acceptPuppiesKittens', v)} />
                    <YesNo label="Animaux âgés ?" value={q.acceptSenior} onChange={v => setQField('acceptSenior', v)} />
                    <YesNo label="Animaux malades ?" value={q.acceptSick} onChange={v => setQField('acceptSick', v)} />
                    <YesNo label="Traitements médicaux ?" value={q.acceptMedicalTreatments} onChange={v => setQField('acceptMedicalTreatments', v)} />
                    <YesNo label="Animaux handicapés ?" value={q.acceptDisabled} onChange={v => setQField('acceptDisabled', v)} />
                    <YesNo label="Animaux catégorisés ?" value={q.acceptCategorized} onChange={v => setQField('acceptCategorized', v)} />
                    <YesNo label="Animaux non sociables ?" value={q.acceptUnsociable} onChange={v => setQField('acceptUnsociable', v)} />
                    <YesNo label="Animaux fugueurs ?" value={q.acceptRunaways} onChange={v => setQField('acceptRunaways', v)} />
                  </div>
                </Section>

                <Section title="6. Votre logement">
                  <CheckGroup
                    options={HOUSING_OPTIONS}
                    values={q.housingType ? [q.housingType] : []}
                    onChange={v => setQField('housingType', v[v.length - 1] || '')}
                  />
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <YesNo label="Jardin clôturé ?" value={q.gardenFenced} onChange={v => setQField('gardenFenced', v)} />
                    <YesNo label="Présence d’escaliers ?" value={q.hasStairs} onChange={v => setQField('hasStairs', v)} />
                    <YesNo label="Les animaux ont accès à l’intérieur ?" value={q.animalsIndoorAccess} onChange={v => setQField('animalsIndoorAccess', v)} />
                  </div>
                </Section>

                <Section title="7. Vos animaux">
                  <YesNo label="Avez-vous déjà des animaux ?" value={q.hasOwnAnimals} onChange={v => setQField('hasOwnAnimals', v)} />
                  {q.hasOwnAnimals && (
                    <p className="text-sm text-slate-500">
                      Décrivez-les dans « informations importantes » ou ajoutez des photos ci-dessous.
                      Vous pourrez détailler espèce, sexe, âge dans votre profil après inscription.
                    </p>
                  )}
                </Section>

                <Section title="8. Expérience">
                  <div className="space-y-4">
                    <YesNo label="Avez-vous déjà gardé des animaux ?" value={q.hasKeptAnimals} onChange={v => setQField('hasKeptAnimals', v)} />
                    <YesNo
                      label="Disposez-vous de l’ACACED ?"
                      value={q.hasAcaced}
                      onChange={v => setQField('hasAcaced', v)}
                    />
                    <p className="text-xs text-slate-500 -mt-2">
                      Attestation de connaissances pour les animaux de compagnie d’espèces domestiques — facultatif.
                    </p>
                    <Input label="Autres formations (secours animaliers…)" value={q.training} onChange={e => setQField('training', e.target.value)} />
                    <Input label="Profession en lien avec les animaux ?" value={q.animalRelatedJob} onChange={e => setQField('animalRelatedJob', e.target.value)} />
                    <Input label="Association de protection animale ?" value={q.animalAssociation} onChange={e => setQField('animalAssociation', e.target.value)} />
                  </div>
                </Section>

                <Section title="9. Disponibilités">
                  <CheckGroup
                    options={AVAILABILITY_OPTIONS}
                    values={q.availabilityTypes}
                    onChange={v => setQField('availabilityTypes', v)}
                  />
                </Section>

                <Section title="10. Urgences">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <YesNo
                      label="Disponible pour intervenir rapidement ?"
                      value={q.emergencyAvailable}
                      onChange={v => setQField('emergencyAvailable', v)}
                    />
                    <Select
                      label="Délai moyen"
                      value={q.emergencyDelay}
                      onChange={e => setQField('emergencyDelay', e.target.value)}
                      options={[{ value: '', label: 'Choisir…' }, ...EMERGENCY_DELAY_OPTIONS.map(o => ({ value: o.value, label: o.label }))]}
                    />
                  </div>
                </Section>

                <Section
                  title="11. Documents à fournir"
                  subtitle="Pièce d’identité obligatoire. Les autres documents renforcent la confiance et accélèrent la validation."
                >
                  <div className="space-y-4">
                    <FileField label="Pièce d’identité" required file={idFile} onChange={setIdFile} />
                    <FileField label="Justificatif de domicile" required file={addressFile} onChange={setAddressFile} />
                    <FileField
                      label="Extrait de casier judiciaire (bulletin n°3)"
                      hint="Fortement recommandé"
                      file={criminalFile}
                      onChange={setCriminalFile}
                    />
                    <FileField label="Attestation d’assurance RC" file={insuranceFile} onChange={setInsuranceFile} />
                    {needsFosterDocs && (
                      <>
                        <MultiFileField
                          label="Photos du logement"
                          hint="JPG, PNG ou WEBP — plusieurs photos possibles"
                          files={housingFiles}
                          onChange={setHousingFiles}
                        />
                        <MultiFileField
                          label="Photos des espaces extérieurs"
                          hint="JPG, PNG ou WEBP — plusieurs photos possibles"
                          files={outdoorFiles}
                          onChange={setOutdoorFiles}
                        />
                      </>
                    )}
                    <MultiFileField
                      label="Photos des animaux du foyer (facultatif)"
                      hint="JPG, PNG ou WEBP — plusieurs photos possibles"
                      files={ownAnimalFiles}
                      onChange={setOwnAnimalFiles}
                    />
                  </div>
                </Section>

                <Section title="12. Présentation">
                  <Textarea label="Parlez-nous de vous *" rows={4} value={aboutMe} onChange={e => setAboutMe(e.target.value)} required />
                  <Textarea label="Pourquoi rejoindre SécurPats ? *" rows={3} value={motivation} onChange={e => setMotivation(e.target.value)} required />
                  <Textarea label="Informations importantes à connaître" rows={3} value={importantNotes} onChange={e => setImportantNotes(e.target.value)} />
                </Section>

                <Section title="13. Engagements">
                  <div className="space-y-2 text-sm text-slate-700">
                    <label className="flex gap-2 items-start cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={infoAccurate} onChange={e => setInfoAccurate(e.target.checked)} />
                      <span>J’atteste que les informations fournies sont exactes.</span>
                    </label>
                    <label className="flex gap-2 items-start cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={charterOk} onChange={e => setCharterOk(e.target.checked)} />
                      <span>J’accepte la charte SécurPats.</span>
                    </label>
                    <label className="flex gap-2 items-start cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={contactOk} onChange={e => setContactOk(e.target.checked)} />
                      <span>J’autorise SécurPats à me contacter pour des demandes d’urgence.</span>
                    </label>
                    <label className="flex gap-2 items-start cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={confidentialOk} onChange={e => setConfidentialOk(e.target.checked)} />
                      <span>J’accepte que mes coordonnées restent confidentielles et ne soient communiquées qu’en cas de mise en relation validée.</span>
                    </label>
                    <label className="flex gap-2 items-start cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} />
                      <span>J’accepte les <Link to="/cgu" className="text-teal-700 underline">CGU</Link>.</span>
                    </label>
                    <label className="flex gap-2 items-start cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} />
                      <span>J’accepte la <Link to="/confidentialite" className="text-teal-700 underline">politique de confidentialité</Link>.</span>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 flex items-start gap-2 mt-3">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-teal-600" />
                    Après inscription, un administrateur vérifie vos documents. Un badge
                    « Profil vérifié par SécurPats » est attribué une fois le dossier validé.
                  </p>
                </Section>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && !awaitingEmail && <p className="text-sm text-teal-700">{success}</p>}

                <Button type="submit" className="w-full" size="lg" icon={loading ? Loader2 : UserPlus} disabled={loading}>
                  {loading ? 'Création du compte…' : 'Envoyer ma candidature'}
                </Button>
                <p className="text-center text-sm text-slate-500">
                  Déjà inscrit ? <Link to={loginPath} className="text-teal-700 font-medium">Se connecter</Link>
                </p>
              </form>
            )}
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
