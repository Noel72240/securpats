import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'
import { isNativeApp } from '@/lib/platform'

/** Sur l’app native : en-tête léger. Sur le web : PublicLayout complet. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  if (!isNativeApp()) {
    return <PublicLayout>{children}</PublicLayout>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <MaintenanceBanner />
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <ArrowLeft className="w-4 h-4" />
          Espaces
        </Link>
        <span className="text-sm font-bold text-slate-900 tracking-tight">SécurPats</span>
        <span className="w-16" aria-hidden />
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
