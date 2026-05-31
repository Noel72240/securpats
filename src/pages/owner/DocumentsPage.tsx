import { useState } from 'react'
import { Upload, FileText, Trash2, FolderOpen, Download } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, Badge } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useOwnerDocuments, useOwnerPets, useApp } from '@/contexts/AppContext'
import { DOCUMENT_LABELS, type DocumentCategory } from '@/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { uploadDocumentFile, getDocumentSignedUrl } from '@/lib/supabase/uploads'

export default function DocumentsPage() {
  const documents = useOwnerDocuments()
  const pets = useOwnerPets()
  const { currentUser, addDocument, deleteDocument } = useApp()
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState('')

  const filtered = filter === 'all' ? documents : documents.filter(d => d.category === filter)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    setUploading(true)
    setError('')

    const docMeta = {
      name: file.name.replace(/\.[^.]+$/, ''),
      category: 'divers' as DocumentCategory,
      fileName: file.name,
      fileSize: file.size,
      petId: pets[0]?.id,
    }

    if (isSupabaseConfigured()) {
      const { path, error: uploadError } = await uploadDocumentFile(currentUser.id, pets[0]?.id, file)
      if (uploadError || !path) {
        setError(uploadError || 'Échec de l\'upload')
        setUploading(false)
        e.target.value = ''
        return
      }
      addDocument(docMeta, path)
    } else {
      addDocument(docMeta)
    }

    setUploading(false)
    e.target.value = ''
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
      carnet_sante: 'success', ordonnance: 'info', facture: 'warning', assurance: 'default', divers: 'default',
    }
    return <Badge variant={colors[cat]}>{DOCUMENT_LABELS[cat]}</Badge>
  }

  return (
    <DashboardLayout variant="owner" title="Documents">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Select
            label=""
            value={filter}
            onChange={e => setFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tous les documents' }, ...Object.entries(DOCUMENT_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
            className="max-w-xs"
          />
          <label className="inline-flex cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            <Button icon={Upload} loading={uploading} type="button">
              Uploader un document
            </Button>
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(DOCUMENT_LABELS).map(([key, label]) => {
            const count = documents.filter(d => d.category === key).length
            return (
              <Card key={key} hover className="text-center cursor-pointer" onClick={() => setFilter(key)}>
                <FolderOpen className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{count} document{count !== 1 ? 's' : ''}</p>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon={FileText} title="Aucun document" description="Uploadez vos carnets de santé, ordonnances et assurances." />
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
