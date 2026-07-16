import { useRef, useState } from 'react'
import { Upload, FileText, Trash2, FolderOpen, Download } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, Badge } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useOwnerDocuments, useOwnerPets, useApp } from '@/contexts/AppContext'
import { DOCUMENT_LABELS, DOCUMENT_HINTS, type DocumentCategory } from '@/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadDocumentFile, getDocumentSignedUrl } from '@/lib/supabase/uploads'

export default function DocumentsPage() {
  const documents = useOwnerDocuments()
  const pets = useOwnerPets()
  const { currentUser, addDocument, deleteDocument } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '')
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('divers')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const filtered = filter === 'all' ? documents : documents.filter(d => d.category === filter)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    if (isSupabaseConfigured() && !selectedPetId) {
      setError('Sélectionnez un animal avant d\'uploader un document.')
      e.target.value = ''
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    const docMeta = {
      name: file.name.replace(/\.[^.]+$/, ''),
      category: uploadCategory,
      fileName: file.name,
      fileSize: file.size,
      petId: selectedPetId || undefined,
    }

    try {
      if (isSupabaseConfigured()) {
        const { path, error: uploadError } = await uploadDocumentFile(currentUser.id, selectedPetId, file)
        if (uploadError || !path) {
          setError(uploadError || 'Échec de l\'upload vers le stockage')
          return
        }
        const dbError = await addDocument(docMeta, path)
        if (dbError) {
          setError(dbError)
          return
        }
      } else {
        const dbError = await addDocument(docMeta)
        if (dbError) {
          setError(dbError)
          return
        }
      }
      setSuccess(`« ${docMeta.name} » ajouté avec succès.`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDownload = async (storagePath?: string) => {
    if (!storagePath || !isSupabaseConfigured()) return
    const { url, error: urlError } = await getDocumentSignedUrl(storagePath)
    if (urlError || !url) {
      setError(urlError || 'Impossible de télécharger le fichier')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const categoryBadge = (cat: DocumentCategory) => {
    const colors: Record<DocumentCategory, 'default' | 'success' | 'warning' | 'info'> = {
      carnet_sante: 'success',
      ordonnance: 'info',
      facture: 'warning',
      assurance: 'default',
      directives_anticipees: 'info',
      divers: 'default',
    }
    return <Badge variant={colors[cat]}>{DOCUMENT_LABELS[cat]}</Badge>
  }

  return (
    <DashboardLayout variant="owner" title="Documents">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <Select
            label=""
            value={filter}
            onChange={e => setFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tous les documents' }, ...Object.entries(DOCUMENT_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
            className="max-w-xs"
          />
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {pets.length > 0 && (
              <Select
                label="Animal"
                value={selectedPetId}
                onChange={e => setSelectedPetId(e.target.value)}
                options={pets.map(p => ({ value: p.id, label: p.name }))}
                className="min-w-[160px]"
              />
            )}
            <Select
              label="Catégorie"
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value as DocumentCategory)}
              options={Object.entries(DOCUMENT_LABELS).map(([k, v]) => ({ value: k, label: v }))}
              className="min-w-[160px]"
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Button
              icon={Upload}
              loading={uploading}
              type="button"
              disabled={pets.length === 0 && isSupabaseConfigured()}
              onClick={() => fileInputRef.current?.click()}
            >
              Uploader un document
            </Button>
          </div>
        </div>

        {pets.length === 0 && isSupabaseConfigured() && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Ajoutez d&apos;abord un animal pour pouvoir uploader des documents.
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-brand-600">{success}</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(DOCUMENT_LABELS).map(([key, label]) => {
            const cat = key as DocumentCategory
            const count = documents.filter(d => d.category === cat).length
            const hint = DOCUMENT_HINTS[cat]
            return (
              <Card key={key} hover className="text-center cursor-pointer" onClick={() => setFilter(key)}>
                <FolderOpen className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-900">{label}</p>
                {hint && (
                  <p className="text-[11px] text-slate-500 leading-snug mt-1 px-1">{hint}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">{count} document{count !== 1 ? 's' : ''}</p>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon={FileText} title="Aucun document" description="Uploadez vos carnets de santé, ordonnances, assurances et directives anticipées." />
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => (
              <Card key={doc.id} className="flex items-center gap-4 !p-4">
                <FileText className="w-8 h-8 text-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.fileName} — {formatFileSize(doc.fileSize)} — {formatDate(doc.uploadedAt)}</p>
                </div>
                {categoryBadge(doc.category)}
                {doc.storagePath && isSupabaseConfigured() && (
                  <Button variant="ghost" size="sm" icon={Download} onClick={() => handleDownload(doc.storagePath)} />
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)} icon={Trash2} className="text-red-500" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
