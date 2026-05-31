import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { faqItems } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Questions fréquentes</h1>
            <p className="text-lg text-slate-600">Tout ce que vous devez savoir sur SécurPats.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-semibold text-slate-900 pr-4">{item.question}</span>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200',
                    openIndex === i && 'rotate-180'
                  )} />
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-slate-600 leading-relaxed">{item.answer}</p>
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
