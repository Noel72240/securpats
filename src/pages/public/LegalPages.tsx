import { Link } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useLegalInfo } from '@/lib/legal/useLegalInfo'
import { SUBPROCESSORS } from '@/lib/legal/constants'

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          <div className="space-y-6 text-slate-600 leading-relaxed text-[15px]">{children}</div>
        </div>
      </section>
    </PublicLayout>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-slate-900 mt-10 first:mt-0">{children}</h2>
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  )
}

export function MentionsLegalesPage() {
  const l = useLegalInfo()
  return (
    <LegalPage title="Mentions légales">
      <p className="text-sm text-slate-500">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN).</p>
      <p className="text-sm text-slate-500">Version {l.legalVersion}</p>

      <H2>Éditeur du site</H2>
      <p>
        <strong>{l.publisher}</strong><br />
        {l.legalForm}<br />
        {l.fullAddress}<br />
        Email : <a href={`mailto:${l.contactEmail}`} className="text-brand-600 hover:underline">{l.contactEmail}</a>
        {l.contactPhone && <><br />Téléphone : {l.contactPhone}</>}
      </p>
      <Ul items={[
        `SIRET : ${l.siret}`,
        `RCS : ${l.rcs}`,
        `N° TVA intracommunautaire : ${l.vatNumber}`,
        `Capital social : ${l.capital}`,
      ]} />

      <H2>Directeur de la publication</H2>
      <p>{l.directorName}</p>

      <H2>Hébergeur du site web</H2>
      <p>
        {l.hostName}<br />
        {l.hostAddress}
      </p>

      <H2>Hébergement des données</H2>
      <p>
        Les données personnelles sont hébergées par {l.dataHostName}, dans la région {l.dataHostRegion}.
      </p>

      <H2>Propriété intellectuelle</H2>
      <p>
        L&apos;ensemble du contenu du site {l.siteName} (textes, graphismes, logo, structure) est protégé par le droit d&apos;auteur.
        Toute reproduction non autorisée est interdite.
      </p>

      <H2>Contact</H2>
      <p>
        Pour toute question : <a href={`mailto:${l.contactEmail}`} className="text-brand-600 hover:underline">{l.contactEmail}</a>
      </p>
    </LegalPage>
  )
}

export function CGUPage() {
  const l = useLegalInfo()
  return (
    <LegalPage title="Conditions Générales d'Utilisation">
      <p className="text-sm text-slate-500">Dernière mise à jour : {l.legalVersion}</p>

      <H2>1. Objet et acceptation</H2>
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme
        {` ${l.siteName}`}, service SaaS de protection animale d&apos;urgence édité par {l.publisher}.
        L&apos;inscription vaut acceptation sans réserve des CGU et de la{' '}
        <Link to="/confidentialite" className="text-brand-600 hover:underline">politique de confidentialité</Link>.
      </p>

      <H2>2. Description du service</H2>
      <p>{l.siteName} permet aux propriétaires d&apos;animaux de :</p>
      <Ul items={[
        'Centraliser les informations essentielles de leurs animaux (santé, traitements, vétérinaire)',
        'Désigner des référents d\'urgence (avec leur accord préalable)',
        'Générer une fiche de secours accessible via QR Code en cas d\'urgence',
        'Souscrire un abonnement pour accéder aux fonctionnalités premium',
      ]} />
      <p>
        {l.siteName} est un outil d&apos;organisation et de mise en relation technique. Il ne se substitue pas aux services
        vétérinaires, aux services de secours publics ni aux obligations légales du propriétaire.
      </p>

      <H2>3. Inscription et compte</H2>
      <Ul items={[
        'L\'utilisateur doit être majeur et fournir des informations exactes',
        'Les identifiants sont personnels et confidentiels',
        'L\'utilisateur est responsable de toute activité sur son compte',
        'Toute usurpation d\'identité est interdite et pourra faire l\'objet de poursuites',
      ]} />

      <H2>4. Abonnements et paiement</H2>
      <p>Deux formules avec renouvellement automatique :</p>
      <Ul items={[
        'Mensuel : 4,99 € TTC / mois',
        'Annuel : 49,99 € TTC / an',
      ]} />
      <p>
        Le paiement est traité de manière sécurisée par Stripe (certifié PCI-DSS). Vous pouvez résilier à tout moment
        depuis votre espace ou le portail client Stripe. La résiliation prend effet à la fin de la période en cours.
      </p>

      <H2>5. Droit de rétractation (consommateurs)</H2>
      <p>
        Conformément aux articles L221-18 et suivants du Code de la consommation, vous disposez d&apos;un délai de
        14 jours à compter de la souscription pour exercer votre droit de rétractation, sauf si vous avez expressément
        demandé l&apos;exécution immédiate du service numérique et renoncé à ce droit lors de la souscription.
      </p>

      <H2>6. Données des référents tiers</H2>
      <p>
        En enregistrant les coordonnées d&apos;un référent, vous certifiez avoir obtenu son consentement préalable
        pour le traitement de ses données personnelles dans le cadre du service {l.siteName}.
      </p>

      <H2>7. Responsabilité</H2>
      <p>
        {l.publisher} s&apos;engage à mettre en œuvre les moyens raisonnables pour assurer la disponibilité du service.
        La responsabilité de {l.publisher} ne saurait être engagée en cas de force majeure, d&apos;utilisation non conforme
        du service, ou d&apos;informations inexactes fournies par l&apos;utilisateur.
      </p>

      <H2>8. Résiliation</H2>
      <p>
        {l.publisher} se réserve le droit de suspendre ou résilier un compte en cas de violation des CGU, de fraude
        ou de non-paiement. L&apos;utilisateur peut supprimer son compte à tout moment depuis son espace (voir{' '}
        <Link to="/app/donnees-personnelles" className="text-brand-600 hover:underline">Mes données personnelles</Link>).
      </p>

      <H2>9. Médiation et litiges</H2>
      <p>
        En cas de litige, vous pouvez recourir gratuitement à un médiateur de la consommation :{' '}
        <a href={l.mediatorUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
          {l.mediatorName}
        </a>.
        Les présentes CGU sont soumises au droit français. Compétence exclusive des tribunaux français,
        sous réserve des dispositions impératives applicables aux consommateurs de l&apos;Union européenne.
      </p>
    </LegalPage>
  )
}

export function PrivacyPage() {
  const l = useLegalInfo()
  return (
    <LegalPage title="Politique de confidentialité">
      <p className="text-sm text-slate-500">Conforme au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés. Version {l.legalVersion}.</p>

      <H2>1. Responsable de traitement</H2>
      <p>
        {l.publisher} — {l.fullAddress}<br />
        Email : <a href={`mailto:${l.contactEmail}`} className="text-brand-600 hover:underline">{l.contactEmail}</a><br />
        DPO / contact données : <a href={`mailto:${l.dpoEmail}`} className="text-brand-600 hover:underline">{l.dpoEmail}</a>
      </p>

      <H2>2. Données collectées</H2>
      <Ul items={[
        'Identité et contact : nom, prénom, email, téléphone, adresse',
        'Données de compte : identifiant, mot de passe hashé (via Supabase Auth)',
        'Données animales : espèce, race, santé, traitements, allergies, vétérinaire',
        'Référents d\'urgence : identité, coordonnées (avec consentement du référent)',
        'Documents uploadés : carnets de santé, ordonnances (stockage chiffré)',
        'Données de paiement : traitées exclusivement par Stripe (aucune carte stockée chez nous)',
        'Données techniques : logs, adresse IP, cookies strictement nécessaires',
      ]} />

      <H2>3. Finalités et bases légales</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-3 font-semibold text-slate-900">Finalité</th>
              <th className="text-left p-3 font-semibold text-slate-900">Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200"><td className="p-3">Fourniture du service</td><td className="p-3">Exécution du contrat (art. 6.1.b RGPD)</td></tr>
            <tr className="border-t border-slate-200"><td className="p-3">Gestion des abonnements</td><td className="p-3">Exécution du contrat + obligation légale comptable</td></tr>
            <tr className="border-t border-slate-200"><td className="p-3">Fiche de secours QR</td><td className="p-3">Intérêt vital / consentement (urgence animale)</td></tr>
            <tr className="border-t border-slate-200"><td className="p-3">Support client</td><td className="p-3">Intérêt légitime</td></tr>
            <tr className="border-t border-slate-200"><td className="p-3">Sécurité et prévention fraude</td><td className="p-3">Intérêt légitime</td></tr>
          </tbody>
        </table>
      </div>

      <H2>4. Destinataires et sous-traitants</H2>
      <p>Vos données peuvent être traitées par les sous-traitants suivants, liés par des clauses contractuelles (DPA) :</p>
      <Ul items={SUBPROCESSORS.map(s => `${s.name} — ${s.role} (${s.location})`)} />
      <p>Aucune vente de données à des tiers. Aucune publicité ciblée.</p>

      <H2>5. Transferts hors Union européenne</H2>
      <p>
        Certains sous-traitants (Vercel, Stripe) peuvent traiter des données aux États-Unis.
        Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne
        et/ou le Data Privacy Framework le cas échéant.
      </p>

      <H2>6. Durées de conservation</H2>
      <Ul items={[
        'Données de compte : durée de l\'abonnement + 3 ans (prescription civile)',
        'Données de facturation : 10 ans (obligation comptable)',
        'Messages contact : 3 ans',
        'Logs techniques : 12 mois maximum',
        'Suppression sur demande : sous 30 jours (sauf obligation légale de conservation)',
      ]} />

      <H2>7. Sécurité</H2>
      <Ul items={[
        'Chiffrement TLS en transit (HTTPS obligatoire)',
        'Chiffrement au repos (hébergeur Supabase/AWS)',
        'Authentification sécurisée, politiques RLS (Row Level Security)',
        'Accès fiche secours limité au token QR unique (pas de liste publique)',
        'Headers de sécurité HTTP (CSP, HSTS, X-Frame-Options)',
        'Clés secrètes exclusivement côté serveur (jamais exposées au navigateur)',
      ]} />

      <H2>8. Vos droits</H2>
      <p>Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants :</p>
      <Ul items={[
        'Accès à vos données',
        'Rectification des données inexactes',
        'Effacement (« droit à l\'oubli »)',
        'Limitation du traitement',
        'Portabilité (export JSON depuis votre espace)',
        'Opposition au traitement fondé sur l\'intérêt légitime',
        'Retrait du consentement à tout moment',
      ]} />
      <p>
        Exercez vos droits via <Link to="/app/donnees-personnelles" className="text-brand-600 hover:underline">Mes données personnelles</Link>{' '}
        ou par email à <a href={`mailto:${l.dpoEmail}`} className="text-brand-600 hover:underline">{l.dpoEmail}</a>.
        Réponse sous 30 jours maximum.
      </p>

      <H2>9. Réclamation CNIL</H2>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :{' '}
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
          www.cnil.fr/fr/plaintes
        </a>
      </p>
    </LegalPage>
  )
}

export function RGPDPage() {
  const l = useLegalInfo()
  return (
    <LegalPage title="Informations RGPD">
      <p className="text-sm text-slate-500">Synthèse de vos droits en matière de protection des données. Version {l.legalVersion}.</p>

      <H2>Registre des traitements (extrait)</H2>
      <p>{l.siteName} traite les données personnelles dans le cadre des activités suivantes :</p>
      <Ul items={[
        'Gestion des comptes utilisateurs (propriétaires, pet-sitters, administrateurs)',
        'Gestion des profils animaux et fiches de secours',
        'Gestion des référents d\'urgence',
        'Facturation et abonnements',
        'Support client et formulaire de contact',
        'Sécurité et journalisation technique',
      ]} />

      <H2>Données sensibles</H2>
      <p>
        Les informations de santé animale (traitements, allergies) ne constituent pas des « données de santé »
        au sens du RGPD (personnes physiques), mais sont traitées avec le même niveau de protection renforcé.
        Les pièces d&apos;identité des pet-sitters sont des données d&apos;identité traitées uniquement pour vérification.
      </p>

      <H2>Consentement</H2>
      <p>
        L&apos;inscription requiert l&apos;acceptation explicite des CGU et de la politique de confidentialité.
        La date et la version du consentement sont enregistrées. Les référents tiers doivent avoir donné
        leur accord avant d&apos;être enregistrés.
      </p>

      <H2>Minimisation et fiche secours</H2>
      <p>
        La fiche de secours publique (QR Code) n&apos;expose que les informations strictement nécessaires
        en situation d&apos;urgence : identité de l&apos;animal, alertes médicales, vétérinaire et référents prioritaires.
        Aucune liste globale d&apos;animaux ou de référents n&apos;est accessible publiquement.
      </p>

      <H2>Exercer vos droits</H2>
      <p>
        Connectez-vous à votre espace → <Link to="/app/donnees-personnelles" className="text-brand-600 hover:underline">Mes données personnelles</Link>
        {' '}pour exporter ou supprimer vos données.<br />
        Contact DPO : <a href={`mailto:${l.dpoEmail}`} className="text-brand-600 hover:underline">{l.dpoEmail}</a>
      </p>

      <H2>Analyse d&apos;impact (DPIA)</H2>
      <p>
        Une analyse d&apos;impact relative à la protection des données (DPIA) est recommandée avant mise en production
        à grande échelle, compte tenu du traitement de données d&apos;urgence et de coordonnées de tiers.
      </p>
    </LegalPage>
  )
}

export function CookiesPage() {
  const l = useLegalInfo()
  return (
    <LegalPage title="Politique cookies">
      <p className="text-sm text-slate-500">Conforme aux recommandations CNIL et à la directive ePrivacy. Version {l.legalVersion}.</p>

      <H2>1. Qu&apos;est-ce qu&apos;un cookie ?</H2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d&apos;un site.
        {` ${l.siteName}`} utilise également le stockage local (localStorage) pour certaines fonctionnalités.
      </p>

      <H2>2. Cookies strictement nécessaires</H2>
      <p>Ces traceurs sont indispensables au fonctionnement du service. Ils ne nécessitent pas votre consentement préalable.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-3 font-semibold">Nom / type</th>
              <th className="text-left p-3 font-semibold">Finalité</th>
              <th className="text-left p-3 font-semibold">Durée</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t"><td className="p-3">Session Supabase Auth</td><td className="p-3">Maintien de la connexion sécurisée</td><td className="p-3">Session / 7 jours</td></tr>
            <tr className="border-t"><td className="p-3">securpats_cookie_consent</td><td className="p-3">Mémorisation de votre choix cookies</td><td className="p-3">13 mois</td></tr>
            <tr className="border-t"><td className="p-3">localStorage (mode démo)</td><td className="p-3">Données locales sans compte Supabase</td><td className="p-3">Jusqu&apos;à suppression</td></tr>
          </tbody>
        </table>
      </div>

      <H2>3. Cookies tiers — paiement</H2>
      <p>
        Lorsque vous souscrivez un abonnement, Stripe peut déposer des cookies nécessaires au traitement sécurisé
        du paiement (PCI-DSS). Ces cookies ne sont activés que lors de la redirection vers Stripe Checkout.
      </p>

      <H2>4. Cookies analytiques</H2>
      <p>
        {l.siteName} n&apos;utilise actuellement <strong>aucun cookie publicitaire ni outil d&apos;analyse</strong> (Google Analytics, Meta Pixel, etc.).
        Si des outils analytics sont ajoutés ultérieurement, votre consentement préalable sera requis.
      </p>

      <H2>5. Gérer vos préférences</H2>
      <p>
        Vous pouvez à tout moment modifier votre choix en supprimant le cookie de consentement dans votre navigateur
        ou en cliquant ci-dessous :
      </p>
      <button
        type="button"
        onClick={() => { localStorage.removeItem('securpats_cookie_consent_v1'); window.location.reload() }}
        className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl py-2.5 px-5 transition-colors"
      >
        Réinitialiser mes préférences cookies
      </button>

      <H2>6. Paramétrage navigateur</H2>
      <p>
        Vous pouvez configurer votre navigateur pour refuser les cookies. Attention : certaines fonctionnalités
        du service pourraient ne plus fonctionner correctement.
      </p>
    </LegalPage>
  )
}
