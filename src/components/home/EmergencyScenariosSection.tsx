import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { EMERGENCY_SCENARIOS } from '@/lib/seo/scenarios'

export function EmergencyScenariosSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
            Les scénarios
          </h2>
          <p className="text-slate-600">
            Hospitalisé(e) ? Qui s&apos;occupe de votre animal ? SécurPats répond à la question que se posent des milliers de propriétaires : que devient mon chien ou mon chat si un imprévu survient ?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {EMERGENCY_SCENARIOS.map(scenario => (
            <Link
              key={scenario.path}
              to={scenario.path}
              className="group block px-4 py-4 rounded-xl border border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50 transition-colors text-left"
            >
              <span className="flex items-center justify-between gap-2 font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 group-hover:text-brand-800">
                {scenario.title}
                <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </span>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {scenario.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
