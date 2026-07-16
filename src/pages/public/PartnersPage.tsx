import { Link, Navigate } from 'react-router-dom'
import { ExternalLink, Handshake } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PageSEO } from '@/components/seo/PageSEO'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'

export default function PartnersPage() {
  const { siteSettings } = useApp()
  const { partners } = siteSettings

  if (!partners.enabled) {
    return <Navigate to="/" replace />
  }

  const visible = partners.items.filter(p => p.name.trim())

  return (
    <PublicLayout>
      <PageSEO
        title={partners.title || 'Partenaires'}
        description={partners.subtitle || 'Les partenaires SécurPats.'}
        path="/partenaires"
        keywords={['partenaires SécurPats', 'protection animale', 'réseau animal']}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-emerald-50/50 border-b border-brand-100/60">
        <div className="absolute -top-20 right-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 mb-4">
            <Handshake className="w-3.5 h-3.5" />
            Réseau SécurPats
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {partners.title}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">{partners.subtitle}</p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {visible.length === 0 ? (
            <Card className="text-center py-14">
              <Handshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-medium mb-1">Partenariats à venir</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Nous préparons notre réseau de partenaires. Revenez bientôt, ou
                {' '}
                <Link to="/contact" className="text-brand-700 font-medium hover:underline">contactez-nous</Link>
                {' '}
                pour échanger.
              </p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {visible.map(partner => {
                const card = (
                  <Card hover className="h-full !p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {partner.logoUrl ? (
                          <img src={partner.logoUrl} alt="" className="w-full h-full object-contain p-2" />
                        ) : (
                          <Handshake className="w-7 h-7 text-brand-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 truncate">{partner.name}</h2>
                        {partner.websiteUrl && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                            Site web <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                    {partner.description && (
                      <p className="text-sm text-slate-600 leading-relaxed flex-1">{partner.description}</p>
                    )}
                  </Card>
                )

                if (partner.websiteUrl) {
                  return (
                    <a
                      key={partner.id}
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {card}
                    </a>
                  )
                }
                return <div key={partner.id}>{card}</div>
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
