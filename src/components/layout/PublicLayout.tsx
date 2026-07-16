import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { DeveloperCredit } from '@/components/legal/DeveloperCredit'
import { SEO_NAV_LINKS } from '@/lib/seo/content'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'
import { useShopCart } from '@/lib/shop/cart'

const baseNavLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/fonctionnement', label: 'Fonctionnement' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/actu', label: 'Actu' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { currentUser, siteSettings } = useApp()
  const { itemCount } = useShopCart()
  const boutiqueActive = location.pathname.startsWith('/boutique')
  const actuActive = location.pathname.startsWith('/actu')
  const partnersActive = location.pathname.startsWith('/partenaires')

  const navLinks = useMemo(
    () => baseNavLinks.filter(link => link.to !== '/partenaires' || siteSettings.partners?.enabled),
    [siteSettings.partners?.enabled],
  )

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 py-1 sm:py-2">
          <BrandLogo variant="icon" className="group" />

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  link.to === '/boutique'
                    ? boutiqueActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'
                    : link.to === '/actu'
                      ? actuActive
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'
                      : link.to === '/partenaires'
                        ? partnersActive
                          ? 'text-brand-700 bg-brand-50'
                          : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'
                    : location.pathname === link.to
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/boutique/panier"
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                boutiqueActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:bg-slate-50',
              )}
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand-700 text-white text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            {currentUser ? (
              <Link to={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'petsitter' ? '/pet-sitter' : '/app'}>
                <Button variant="primary" size="sm">Mon espace</Button>
              </Link>
            ) : (
              <>
                <Link to="/connexion">
                  <Button variant="ghost" size="sm">Propriétaire</Button>
                </Link>
                <Link to="/pet-sitter/connexion">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    Pet-Sitter
                  </Button>
                </Link>
                <Link to="/inscription">
                  <Button variant="primary" size="sm">S&apos;inscrire</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <Link to="/boutique/panier" className="relative p-2 rounded-lg hover:bg-slate-100" aria-label="Panier">
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-brand-700 text-white text-[9px] font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
                  (link.to === '/boutique' ? boutiqueActive : link.to === '/actu' ? actuActive : link.to === '/partenaires' ? partnersActive : location.pathname === link.to)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              {currentUser ? (
                <Link
                  to={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'petsitter' ? '/pet-sitter' : '/app'}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="primary" className="w-full">Mon espace</Button>
                </Link>
              ) : (
                <>
                  <Link to="/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Connexion propriétaire</Button>
                  </Link>
                  <Link to="/pet-sitter/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-blue-300 text-blue-700">
                      Connexion Pet-Sitter
                    </Button>
                  </Link>
                  <Link to="/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">Inscription propriétaire</Button>
                  </Link>
                  <Link to="/pet-sitter/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700">
                      Devenir Pet-Sitter VIP
                    </Button>
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
  const { contact, footer, legal, partners } = siteSettings
  const navLinks = useMemo(
    () => baseNavLinks.filter(link => link.to !== '/partenaires' || partners?.enabled),
    [partners?.enabled],
  )
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
              <li><Link to="/connexion" className="hover:text-brand-400 transition-colors">Connexion propriétaire</Link></li>
              <li><Link to="/inscription" className="hover:text-brand-400 transition-colors">Inscription propriétaire</Link></li>
              <li><Link to="/pet-sitter/connexion" className="hover:text-blue-300 transition-colors">Connexion Pet-Sitter</Link></li>
              <li><Link to="/pet-sitter/inscription" className="hover:text-blue-300 transition-colors">Devenir Pet-Sitter VIP</Link></li>
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
