import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { DeveloperCredit } from '@/components/legal/DeveloperCredit'
import { SEO_NAV_LINKS } from '@/lib/seo/content'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/fonctionnement', label: 'Fonctionnement' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { currentUser } = useApp()

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24 py-2">
          <BrandLogo variant="icon" className="group" />

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.to
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <Link to={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'petsitter' ? '/pet-sitter' : '/app'}>
                <Button variant="primary" size="sm">Mon espace</Button>
              </Link>
            ) : (
              <>
                <Link to="/connexion"><Button variant="ghost" size="sm">Connexion</Button></Link>
                <Link to="/inscription"><Button variant="primary" size="sm">Inscription</Button></Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white animate-fade-in">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium',
                  location.pathname === link.to ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              {currentUser ? (
                <Link to="/app" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" className="w-full">Mon espace</Button>
                </Link>
              ) : (
                <>
                  <Link to="/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Connexion</Button>
                  </Link>
                  <Link to="/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">Inscription</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export function PublicFooter() {
  const { siteSettings } = useApp()
  const { contact, footer, legal } = siteSettings

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div>
            <BrandLogo variant="full" imageClassName="h-16 sm:h-20 lg:h-24" />
            <p className="text-sm leading-relaxed mt-4">{footer.description}</p>
            <div className="mt-4 space-y-1 text-xs text-slate-400">
              <p>{contact.email}</p>
              <p>{contact.phone}</p>
              <p>{contact.addressLine1}, {contact.postalCode} {contact.city}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-brand-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Espaces</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/app" className="hover:text-brand-400 transition-colors">Espace propriétaire</Link></li>
              <li><Link to="/pet-sitter" className="hover:text-brand-400 transition-colors">Espace Pet-Sitter</Link></li>
              <li><Link to="/pet-sitter/inscription" className="hover:text-brand-400 transition-colors">Devenir Pet-Sitter</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Guides urgence</h4>
            <ul className="space-y-2 text-sm">
              {SEO_NAV_LINKS.map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-brand-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mentions-legales" className="hover:text-brand-400 transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgu" className="hover:text-brand-400 transition-colors">CGU</Link></li>
              <li><Link to="/confidentialite" className="hover:text-brand-400 transition-colors">Confidentialité</Link></li>
              <li><Link to="/rgpd" className="hover:text-brand-400 transition-colors">RGPD</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-400 transition-colors">Cookies</Link></li>
              <li><a href="https://allotech72.fr" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">Informations développeur</a></li>
            </ul>
          </div>
        </div>

        <DeveloperCredit variant="footer" />

        <div className="mt-8 pt-6 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} {legal.companyName || 'SécurPats'}. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="sticky top-0 z-50">
        <MaintenanceBanner />
        <PublicHeader />
      </div>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
