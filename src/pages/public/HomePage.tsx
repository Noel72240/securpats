import { Link } from 'react-router-dom'
import {
  Shield, Heart, QrCode, Users, FileText, Bell, ArrowRight, Check,
  PawPrint, Clock, Star,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'

const features = [
  { icon: PawPrint, title: 'Fiches animaux complètes', desc: 'Photo, traitements, allergies, alimentation et consignes en un seul endroit.' },
  { icon: Users, title: 'Référents d\'urgence', desc: 'Jusqu\'à 5 contacts prioritaires notifiés automatiquement.' },
  { icon: QrCode, title: 'QR Code unique', desc: 'Accès instantané aux informations essentielles en cas d\'urgence.' },
  { icon: FileText, title: 'Documents sécurisés', desc: 'Carnet de santé, ordonnances et assurances centralisés.' },
  { icon: Bell, title: 'Alertes automatiques', desc: 'Notification des référents et pet-sitters en cas d\'urgence.' },
  { icon: Shield, title: 'Données protégées', desc: 'Conformité RGPD, chiffrement et hébergement en Europe.' },
]

const steps = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscription rapide en moins de 2 minutes.' },
  { num: '02', title: 'Ajoutez vos animaux', desc: 'Renseignez toutes les informations essentielles.' },
  { num: '03', title: 'Configurez vos référents', desc: 'Définissez jusqu\'à 5 contacts de confiance.' },
  { num: '04', title: 'Générez votre QR Code', desc: 'Imprimez la carte d\'urgence et gardez l\'esprit tranquille.' },
]

export default function HomePage() {
  const { siteSettings } = useApp()
  const { home, testimonials } = siteSettings

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-6">
                <Heart className="w-4 h-4" />
                {home.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                {home.title}{' '}
                <span className="text-brand-600">{home.titleHighlight}</span>, même en votre absence
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                {home.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/inscription">
                  <Button size="lg" icon={ArrowRight}>Commencer gratuitement</Button>
                </Link>
                <Link to="/fonctionnement">
                  <Button size="lg" variant="outline">Comment ça marche</Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-500" /> Sans engagement</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-500" /> Données sécurisées</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-500" /> RGPD</span>
              </div>
            </div>
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/10">
                {home.heroImage ? (
                  <img
                    src={home.heroImage}
                    alt={home.heroImageAlt}
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[400px] lg:h-[500px] bg-gradient-to-br from-brand-100 to-brand-200 flex flex-col items-center justify-center">
                    <PawPrint className="w-24 h-24 text-brand-400 mb-4" />
                    <p className="text-brand-600 font-medium text-sm">Ajoutez votre image depuis l'admin</p>
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">QR Code d'urgence</p>
                      <p className="text-sm text-slate-500">Accès instantané aux infos vitales</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi utiliser SécurPats ?
            </h2>
            <p className="text-lg text-slate-600">
              Chaque année, des milliers d'animaux restent seuls lorsque leur propriétaire fait face à une urgence. SécurPats existe pour que cela n'arrive jamais.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Réactivité', desc: 'Vos référents sont alertés en quelques secondes, 24h/24.' },
              { icon: Shield, title: 'Sérénité', desc: 'Préparez l\'avenir de vos animaux en toute tranquillité.' },
              { icon: Heart, title: 'Bien-être animal', desc: 'Continuité des soins, alimentation et traitements garantis.' },
            ].map((item, i) => (
              <Card key={i} hover className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Comment ça fonctionne</h2>
            <p className="text-lg text-slate-600">Quatre étapes simples pour protéger vos compagnons.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-black text-brand-100 mb-3">{step.num}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Fonctionnalités</h2>
            <p className="text-lg text-slate-600">Tout ce dont vous avez besoin pour une protection complète.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} hover>
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Ils nous font confiance</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.id} hover>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {home.ctaTitle}
              </h2>
              <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
                {home.ctaSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inscription">
                  <Button size="lg" variant="accent" icon={ArrowRight}>Créer mon compte</Button>
                </Link>
                <Link to="/tarifs">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Voir les tarifs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
