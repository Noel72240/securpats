import { Link } from 'react-router-dom'
import { DEVELOPER_INFO, DEVELOPER_FULL_ADDRESS } from '@/lib/legal/developer'

type DeveloperCreditProps = {
  variant?: 'footer' | 'page'
}

export function DeveloperCredit({ variant = 'footer' }: DeveloperCreditProps) {
  const compact = variant === 'footer'

  return (
    <section
      className={
        compact
          ? 'mt-12 pt-8 border-t border-slate-800'
          : ''
      }
      aria-labelledby={compact ? 'developer-credit-title' : undefined}
    >
      <div className={compact ? 'flex flex-col lg:flex-row gap-8 lg:gap-12 items-start' : 'space-y-6'}>
        <a
          href={DEVELOPER_INFO.website}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-block"
          aria-label={`${DEVELOPER_INFO.tradeName} — site web`}
        >
          <img
            src={DEVELOPER_INFO.logoUrl}
            alt={`Logo ${DEVELOPER_INFO.tradeName}`}
            className={compact ? 'h-16 sm:h-20 w-auto' : 'h-24 sm:h-28 w-auto'}
          />
        </a>

        <div className="flex-1 min-w-0">
          {compact ? (
            <p id="developer-credit-title" className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">
              Réalisation & développement
            </p>
          ) : (
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Développeur</h1>
          )}

          <p className={`font-semibold ${compact ? 'text-white text-base' : 'text-slate-900 text-xl'}`}>
            {DEVELOPER_INFO.tradeName}
          </p>

          <dl className={`mt-3 space-y-1.5 ${compact ? 'text-xs sm:text-sm text-slate-400' : 'text-sm text-slate-600'}`}>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-500">Statut :</dt>
              <dd>{DEVELOPER_INFO.legalStatus}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-500">Dirigeant :</dt>
              <dd>{DEVELOPER_INFO.director}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-500">SIRET :</dt>
              <dd>{DEVELOPER_INFO.siret}</dd>
            </div>
            <div>
              <dt className="text-slate-500 sr-only">Adresse</dt>
              <dd>{DEVELOPER_FULL_ADDRESS}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-500">Tél. :</dt>
              <dd>
                <a
                  href={`tel:${DEVELOPER_INFO.phone.replace(/\s/g, '')}`}
                  className={compact ? 'hover:text-cyan-400 transition-colors' : 'text-brand-600 hover:underline'}
                >
                  {DEVELOPER_INFO.phone}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-500">Email :</dt>
              <dd>
                <a
                  href={`mailto:${DEVELOPER_INFO.email}`}
                  className={compact ? 'hover:text-cyan-400 transition-colors' : 'text-brand-600 hover:underline'}
                >
                  {DEVELOPER_INFO.email}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-slate-500">Site :</dt>
              <dd>
                <a
                  href={DEVELOPER_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={compact ? 'hover:text-cyan-400 transition-colors' : 'text-brand-600 hover:underline'}
                >
                  {DEVELOPER_INFO.website.replace('https://', '')}
                </a>
              </dd>
            </div>
          </dl>

          {compact && (
            <Link
              to="/developpeur"
              className="inline-block mt-3 text-xs text-slate-500 hover:text-cyan-400 transition-colors underline underline-offset-2"
            >
              Informations développeur
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
