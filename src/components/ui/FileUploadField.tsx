/** Sélecteur de fichier mobile-friendly (évite l’input natif cassé sur iOS/Android). */
export function FileUploadField({
  label,
  hint,
  required,
  file,
  onChange,
  accept = '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf',
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
      <p className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required ? ' *' : ''}
      </p>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      <label className="inline-flex items-center gap-2 cursor-pointer max-w-full">
        <span className="shrink-0 py-2.5 px-4 rounded-xl bg-brand-50 text-brand-800 text-sm font-semibold hover:bg-brand-100 border border-brand-200/80">
          Choisir un fichier
        </span>
        <span className="text-sm text-slate-500 truncate min-w-0">
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
      {file && (
        <p className="text-xs text-brand-700 mt-1.5 font-medium">
          ✓ {file.name} ({Math.max(1, Math.round(file.size / 1024))} Ko)
        </p>
      )}
    </div>
  )
}
