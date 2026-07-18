import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/LanguageContext'

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useI18n()

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{t('faq.title')}</h1>
            <p className="text-lg text-slate-600">{t('faq.subtitle')}</p>
          </div>

          <div className="space-y-3">
            {faqKeys.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-semibold text-slate-900 pr-4">{t(item.q)}</span>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200',
                    openIndex === i && 'rotate-180'
                  )} />
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-slate-600 leading-relaxed">{t(item.a)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
