import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, HelpCircle } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSEO } from '@/components/seo/PageSEO'
import { getSeoPageByPath, SEO_PAGES, type SeoPage } from '@/lib/seo/content'
import { Navigate } from 'react-router-dom'

export function SeoPageView({ path }: { path: string }) {
  const page = getSeoPageByPath(path)
  if (!page) return <Navigate to="/" replace />
  return <SeoLandingPage page={page} />
}

function SeoLandingPage({ page }: { page: SeoPage }) {
  const related = page.relatedPaths
    .map(p => SEO_PAGES.find(x => x.path === p))
    .filter(Boolean) as SeoPage[]

  return (
    <PublicLayout>
      <PageSEO
        title={page.title}
        description={page.metaDescription}
        path={page.path}
        keywords={page.keywords}
        faqs={page.faqs}
        article
      />

      {/* Hero SEO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-emerald-50 border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-brand-600">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-brand-700 font-medium">{page.navLabel}</span>
          </nav>
          <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wide mb-4">
            {page.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            {page.h1}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            {page.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/inscription">
              <Button size="lg" icon={ArrowRight}>Protéger mon animal — dès 4,99 €/mois</Button>
            </Link>
            <Link to="/fonctionnement">
              <Button size="lg" variant="outline">Voir le fonctionnement</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contenu SEO */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        {page.sections.map(section => (
          <section key={section.h2}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{section.h2}</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {section.bullets && (
              <ul className="mt-6 space-y-2">
                {section.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-slate-700">
                    <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* FAQ — visible + schema.org */}
        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-brand-500" />
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {page.faqs.map(faq => (
              <Card key={faq.question} padding="lg" className="border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Maillage interne SEO */}
        {related.length > 0 && (
          <section aria-labelledby="related-title">
            <h2 id="related-title" className="text-xl font-bold text-slate-900 mb-4">À lire aussi</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map(r => (
                <Link
                  key={r.path}
                  to={r.path}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 transition-colors group"
                >
                  <span className="font-medium text-slate-800 group-hover:text-brand-700">{r.navLabel}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* CTA final */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ne laissez plus votre animal sans filet de sécurité
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Hospitalisation, accident, urgence — préparez dès aujourd&apos;hui l&apos;alerte de vos référents et la fiche secours de votre compagnon. Configuration en moins de 10 minutes.
          </p>
          <Link to="/inscription">
            <Button size="lg" icon={ArrowRight} className="bg-brand-500 hover:bg-brand-400">
              Créer mon compte SécurPats
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">À partir de 4,99 €/mois · Données hébergées en Europe · RGPD</p>
        </div>
      </section>
    </PublicLayout>
  )
}

export default SeoPageView
