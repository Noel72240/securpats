/** Version des documents légaux — incrémenter à chaque mise à jour substantielle */
export const LEGAL_VERSION = '2026-05-31'

export const COOKIE_CONSENT_KEY = 'securpats_cookie_consent_v1'

export const SUBPROCESSORS = [
  { name: 'Supabase', role: 'Authentification, base de données, stockage fichiers', location: 'Union européenne (région configurable)', dpa: true },
  { name: 'Vercel', role: 'Hébergement application web et API', location: 'Union européenne / États-Unis (clauses contractuelles types)', dpa: true },
  { name: 'Stripe', role: 'Paiement sécurisé et facturation', location: 'Union européenne / États-Unis (certifié PCI-DSS)', dpa: true },
] as const
