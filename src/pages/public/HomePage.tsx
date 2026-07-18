import { Link } from 'react-router-dom'
import {
  Shield, Heart, QrCode, Users, FileText, Bell, ArrowRight, Check,
  PawPrint, Clock, Star,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/contexts/AppContext'
import { PageSEO } from '@/components/seo/PageSEO'
import { HeroVisual } from '@/components/home/HeroVisual'
import { FounderPresentation } from '@/components/home/FounderPresentation'
import { HomeVideoSection } from '@/components/home/HomeVideoSection'
import { EmergencyScenariosSection } from '@/components/home/EmergencyScenariosSection'
import { AnimalParadeFrieze } from '@/components/home/AnimalParadeFrieze'
import { useI18n } from '@/i18n/LanguageContext'

export default function HomePage() {
  const { siteSettings } = useApp()
  const { t, locale } = useI18n()
  const { home, testimonials } = siteSettings

  const heroBadge = locale === 'en' ? t('home.heroBadge') : home.badge
  const heroTitle = locale === 'en' ? t('home.heroTitle') : home.title
  const heroHighlight = locale === 'en' ? t('home.heroTitleHighlight') : home.titleHighlight
  const heroSubtitle = locale === 'en' ? t('home.heroSubtitle') : home.subtitle
  const videoTitle = locale === 'en' ? t('home.videoTitle') : (home.videoTitle || t('home.videoTitle'))
  const ctaTitle = locale === 'en' ? t('home.ctaTitle') : home.ctaTitle
  const ctaSubtitle = locale === 'en' ? t('home.ctaSubtitle') : home.ctaSubtitle

  const features = [
    { icon: PawPrint, title: t('home.featPets'), desc: t('home.featPetsDesc') },
    { icon: Users, title: t('home.featReferents'), desc: t('home.featReferentsDesc') },
    { icon: QrCode, title: t('home.featQr'), desc: t('home.featQrDesc') },
    { icon: FileText, title: t('home.featDocs'), desc: t('home.featDocsDesc') },
    { icon: Bell, title: t('home.featAlerts'), desc: t('home.featAlertsDesc') },
    { icon: Shield, title: t('home.featData'), desc: t('home.featDataDesc') },
  ]

  const steps = [
    { num: '01', title: t('home.step1Title'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2Title'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3Title'), desc: t('home.step3Desc') },
    { num: '04', title: t('home.step4Title'), desc: t('home.step4Desc') },
  ]

  const whyItems = [
    { icon: Clock, title: t('home.reactivity'), desc: t('home.reactivityDesc') },
    { icon: Shield, title: t('home.serenity'), desc: t('home.serenityDesc') },
    { icon: Heart, title: t('home.animalWelfare'), desc: t('home.animalWelfareDesc') },
  ]

  return (
    <PublicLayout>
      <PageSEO
        title="Protection animale d'urgence — hospitalisation & alerte référents"
        description="SécurPats protège vos animaux en cas d'hospitalisation ou d'urgence. Alertes automatiques, QR code secours, référents et fiches complètes. Dès 4,99 €/mois."
        path="/"
        keywords={['protection animale urgence', 'hospitalisation animal', 'alerte référents chien chat', 'SécurPats']}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200 rounded-full blur-3xl hero-aurora" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl hero-aurora" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {heroBadge}
              </div>
              <h1 className="text-[1.65rem] leading-tight min-[400px]:text-3xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 mb-4 sm:mb-6">
                {heroTitle}{' '}
                <span className="text-brand-600">{heroHighlight}</span>
                {t('home.evenInAbsence')}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                {heroSubtitle}
              </p>
              <div className="flex flex-col min-[400px]:flex-row gap-3 sm:gap-4">
                <Link to="/inscription" className="w-full min-[400px]:w-auto">
                  <Button size="lg" icon={ArrowRight} className="w-full min-[400px]:w-auto">{t('home.startNow')}</Button>
                </Link>
                <Link to="/fonctionnement" className="w-full min-[400px]:w-auto">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">{t('home.howItWorks')}</Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 mt-6 sm:mt-10 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" /> {t('home.noCommitment')}</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" /> {t('home.secureData')}</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" /> {t('home.rgpd')}</span>
              </div>
            </div>
            <div className="relative animate-fade-in-up animation-delay-200">
              <HeroVisual heroImage={home.heroImage} heroImageAlt={home.heroImageAlt} />
            </div>
          </div>
        </div>
      </section>

      <AnimalParadeFrieze />

      <FounderPresentation />

      <HomeVideoSection
        enabled={home.videoEnabled !== false}
        title={videoTitle}
        videoUrl={home.videoUrl || ''}
      />

      {/* Why */}
      <section className="py-12 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t('home.whyTitle')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('home.whySubtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyItems.map((item, i) => (
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
      <section className="py-12 sm:py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t('home.howTitle')}</h2>
            <p className="text-lg text-slate-600">{t('home.howSubtitle')}</p>
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
      <section className="py-12 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t('home.featuresTitle')}</h2>
            <p className="text-lg text-slate-600">{t('home.featuresSubtitle')}</p>
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
      <section className="py-12 sm:py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t('home.trustTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tItem) => (
              <Card key={tItem.id} hover>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{tItem.text}"</p>
                <div className="flex items-center gap-3">
                  {tItem.avatar && <img src={tItem.avatar} alt={tItem.name} className="w-10 h-10 rounded-full object-cover" />}
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{tItem.name}</p>
                    <p className="text-xs text-slate-500">{tItem.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      <EmergencyScenariosSection />

      {/* CTA */}
      <section className="py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative px-5 py-10 sm:px-8 sm:py-16 lg:px-16 lg:py-20 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {ctaTitle}
              </h2>
              <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
                {ctaSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/inscription">
                  <Button size="lg" variant="accent" icon={ArrowRight}>{t('home.createAccount')}</Button>
                </Link>
                <Link to="/tarifs">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    {t('home.seePricing')}
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
