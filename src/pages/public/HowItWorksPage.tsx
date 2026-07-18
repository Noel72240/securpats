import {
  UserPlus, PawPrint, Users, QrCode, CreditCard, AlertTriangle, CheckCircle,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'
import { useI18n } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/LanguageContext'

const stepMeta = [
  { icon: UserPlus, title: 'howItWorks.s1Title' as TranslationKey, desc: 'howItWorks.s1Desc' as TranslationKey },
  { icon: PawPrint, title: 'howItWorks.s2Title' as TranslationKey, desc: 'howItWorks.s2Desc' as TranslationKey },
  { icon: Users, title: 'howItWorks.s3Title' as TranslationKey, desc: 'howItWorks.s3Desc' as TranslationKey },
  { icon: QrCode, title: 'howItWorks.s4Title' as TranslationKey, desc: 'howItWorks.s4Desc' as TranslationKey },
  { icon: CreditCard, title: 'howItWorks.s5Title' as TranslationKey, desc: 'howItWorks.s5Desc' as TranslationKey },
  { icon: AlertTriangle, title: 'howItWorks.s6Title' as TranslationKey, desc: 'howItWorks.s6Desc' as TranslationKey },
]

export default function HowItWorksPage() {
  const { t } = useI18n()

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('howItWorks.title')}</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {stepMeta.map((step, i) => (
              <Card key={i} hover className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {t('howItWorks.step', { n: i + 1 })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t(step.title)}</h3>
                  <p className="text-slate-600 leading-relaxed">{t(step.desc)}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-brand-50 border-brand-100">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{t('howItWorks.resultTitle')}</h3>
                <p className="text-slate-600">{t('howItWorks.resultDesc')}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
