import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { EMERGENCY_SCENARIOS } from '@/lib/seo/scenarios'
import { useI18n } from '@/i18n/LanguageContext'
import type { TranslationKey } from '@/i18n/LanguageContext'

const scenarioKeys: { path: string; title: TranslationKey; desc: TranslationKey }[] = [
  { path: '/hospitalisation-animal', title: 'scenarios.hospitalization', desc: 'scenarios.hospitalizationDesc' },
  { path: '/accident-animal-urgence', title: 'scenarios.accident', desc: 'scenarios.accidentDesc' },
  { path: '/deces-proprietaire-animal', title: 'scenarios.death', desc: 'scenarios.deathDesc' },
  { path: '/personne-agee-animal', title: 'scenarios.elderly', desc: 'scenarios.elderlyDesc' },
  { path: '/violence-conjugale-animal', title: 'scenarios.domesticViolence', desc: 'scenarios.domesticViolenceDesc' },
  { path: '/hospitalisation-psychiatrique-animal', title: 'scenarios.psychiatric', desc: 'scenarios.psychiatricDesc' },
  { path: '/incarceration-garde-animal', title: 'scenarios.incarceration', desc: 'scenarios.incarcerationDesc' },
  { path: '/voyage-interrompu-animal', title: 'scenarios.travel', desc: 'scenarios.travelDesc' },
  { path: '/catastrophe-naturelle-animal', title: 'scenarios.disaster', desc: 'scenarios.disasterDesc' },
]

export function EmergencyScenariosSection() {
  const { t } = useI18n()

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
            {t('home.scenariosTitle')}
          </h2>
          <p className="text-slate-600">
            {t('home.scenariosSubtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {scenarioKeys.map(scenario => {
            const fallback = EMERGENCY_SCENARIOS.find(s => s.path === scenario.path)
            return (
              <Link
                key={scenario.path}
                to={scenario.path}
                className="group block px-4 py-4 rounded-xl border border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50 transition-colors text-left"
              >
                <span className="flex items-center justify-between gap-2 font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 group-hover:text-brand-800">
                  {t(scenario.title)}
                  <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </span>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {t(scenario.desc) || fallback?.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
