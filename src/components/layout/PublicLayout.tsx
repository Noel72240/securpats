import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { DeveloperCredit } from '@/components/legal/DeveloperCredit'
import { SEO_NAV_LINKS } from '@/lib/seo/content'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'
import { useShopCart } from '@/lib/shop/cart'
import { useI18n } from '@/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { homePathForRole } from '@/lib/caregiver/spaces'

function AuthSpaceMenu({
  mode,
}: {
  mode: 'login' | 'signup'
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  const items = mode === 'login'
    ? [
        { to: '/connexion', label: t('nav.ownerLogin'), className: 'text-brand-700' },
        { to: '/pet-sitter/connexion', label: t('nav.petSitterLogin'), className: 'text-blue-700' },
        { to: '/famille-accueil/connexion', label: t('nav.fosterLogin'), className: 'text-teal-700' },
        { to: '/benevole/connexion', label: t('nav.volunteerLogin'), className: 'text-amber-800' },
      ]
    : [
        { to: '/inscription', label: t('nav.ownerRegister'), className: 'text-brand-700' },
        { to: '/pet-sitter/inscription', label: t('nav.becomeVip'), className: 'text-blue-700' },
        { to: '/famille-accueil/inscription', label: t('nav.fosterRegister'), className: 'text-teal-700' },
        { to: '/benevole/inscription', label: t('nav.volunteerRegister'), className: 'text-amber-800' },
      ]

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1"
      >
        {mode === 'login' ? t('nav.login') : t('nav.signUp')}
        <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50"
        >
          {items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'block px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors',
                item.className,
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { currentUser, siteSettings } = useApp()
  const { t } = useI18n()
  const { itemCount } = useShopCart()
  const boutiqueActive = location.pathname.startsWith('/boutique')
  const actuActive = location.pathname.startsWith('/actu')
  const partnersActive = location.pathname.startsWith('/partenaires')

  const navLinks = useMemo(
    () =>
      [
        { to: '/', label: t('nav.home') },
        { to: '/fonctionnement', label: t('nav.howItWorks') },
        { to: '/boutique', label: t('nav.shop') },
        { to: '/actu', label: t('nav.news') },
        { to: '/partenaires', label: t('nav.partners') },
        { to: '/tarifs', label: t('nav.pricing') },
        { to: '/faq', label: t('nav.faq') },
        { to: '/contact', label: t('nav.contact') },
      ].filter(link => link.to !== '/partenaires' || siteSettings.partners?.enabled),
    [siteSettings.partners?.enabled, t],
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
            <LanguageSwitcher />
            <Link
              to="/boutique/panier"
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                boutiqueActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:bg-slate-50',
              )}
              aria-label={t('nav.cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand-700 text-white text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            {currentUser ? (
              <Link to={homePathForRole(currentUser.role)}>
                <Button variant="primary" size="sm">{t('nav.mySpace')}</Button>
              </Link>
            ) : (
              <>
                <AuthSpaceMenu mode="login" />
                <AuthSpaceMenu mode="signup" />
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <LanguageSwitcher />
            <Link to="/boutique/panier" className="relative p-2 rounded-lg hover:bg-slate-100" aria-label={t('nav.cart')}>
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
                  to={homePathForRole(currentUser.role)}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="primary" className="w-full">{t('nav.mySpace')}</Button>
                </Link>
              ) : (
                <>
                  <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('nav.login')}</p>
                  <Link to="/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">{t('nav.ownerLogin')}</Button>
                  </Link>
                  <Link to="/pet-sitter/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="blueOutline" className="w-full">
                      {t('nav.petSitterLogin')}
                    </Button>
                  </Link>
                  <Link to="/famille-accueil/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.fosterLogin')}
                    </Button>
                  </Link>
                  <Link to="/benevole/connexion" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.volunteerLogin')}
                    </Button>
                  </Link>
                  <p className="px-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('nav.signUp')}</p>
                  <Link to="/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full">{t('nav.ownerRegister')}</Button>
                  </Link>
                  <Link to="/pet-sitter/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="blue" className="w-full">
                      {t('nav.becomeVip')}
                    </Button>
                  </Link>
                  <Link to="/famille-accueil/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.fosterRegister')}
                    </Button>
                  </Link>
                  <Link to="/benevole/inscription" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.volunteerRegister')}
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
  const { t, locale } = useI18n()
  const { contact, footer, legal, partners } = siteSettings
  const navLinks = useMemo(
    () =>
      [
        { to: '/', label: t('nav.home') },
        { to: '/fonctionnement', label: t('nav.howItWorks') },
        { to: '/boutique', label: t('nav.shop') },
        { to: '/actu', label: t('nav.news') },
        { to: '/partenaires', label: t('nav.partners') },
        { to: '/tarifs', label: t('nav.pricing') },
        { to: '/faq', label: t('nav.faq') },
        { to: '/contact', label: t('nav.contact') },
      ].filter(link => link.to !== '/partenaires' || partners?.enabled),
    [partners?.enabled, t],
  )
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div>
            <BrandLogo variant="full" imageClassName="h-16 sm:h-20 lg:h-24" />
            <p className="text-sm leading-relaxed mt-4">{locale === 'en' ? t('home.footerDesc') : footer.description}</p>
            <div className="mt-4 space-y-1 text-xs text-slate-400">
              <p>{contact.email}</p>
              <p>{contact.phone}</p>
              <p>{contact.addressLine1}, {contact.postalCode} {contact.city}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-brand-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.spaces')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/connexion" className="hover:text-brand-400 transition-colors">{t('nav.ownerLogin')}</Link></li>
              <li><Link to="/inscription" className="hover:text-brand-400 transition-colors">{t('nav.ownerRegister')}</Link></li>
              <li><Link to="/pet-sitter/connexion" className="hover:text-blue-300 transition-colors">{t('nav.petSitterLogin')}</Link></li>
              <li><Link to="/pet-sitter/inscription" className="hover:text-blue-300 transition-colors">{t('nav.becomeVip')}</Link></li>
              <li><Link to="/famille-accueil/inscription" className="hover:text-teal-300 transition-colors">{t('nav.fosterRegister')}</Link></li>
              <li><Link to="/benevole/inscription" className="hover:text-amber-300 transition-colors">{t('nav.volunteerRegister')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.emergencyGuides')}</h4>
            <ul className="space-y-2 text-sm">
              {SEO_NAV_LINKS.map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-brand-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mentions-legales" className="hover:text-brand-400 transition-colors">{t('footer.legalNotice')}</Link></li>
              <li><Link to="/cgu" className="hover:text-brand-400 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/confidentialite" className="hover:text-brand-400 transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/rgpd" className="hover:text-brand-400 transition-colors">{t('footer.rgpd')}</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-400 transition-colors">{t('footer.cookies')}</Link></li>
              <li><a href="https://allotech72.fr" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">{t('footer.developer')}</a></li>
            </ul>
          </div>
        </div>

        <DeveloperCredit variant="footer" />

        <div className="mt-8 pt-6 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} {legal.companyName || 'SécurPats'}. {t('footer.rights')}
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
