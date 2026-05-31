import { PublicLayout } from '@/components/layout/PublicLayout'
import { DeveloperCredit } from '@/components/legal/DeveloperCredit'

export default function DeveloppeurPage() {
  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <DeveloperCredit variant="page" />
          <p className="mt-8 text-sm text-slate-500 leading-relaxed">
            Plateforme SécurPats conçue et développée par {''}
            <strong className="text-slate-700">ALLOTECH72</strong>, micro-entreprise de services
            informatiques basée en Sarthe (72).
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
