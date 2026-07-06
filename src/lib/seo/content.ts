import { SCENARIO_SEO_PAGES } from './scenario-pages'

export type SeoSection = {
  h2: string
  paragraphs: string[]
  bullets?: string[]
}

export type SeoFaq = { question: string; answer: string }

export type SeoPage = {
  path: string
  title: string
  metaDescription: string
  keywords: string[]
  navLabel: string
  h1: string
  heroSubtitle: string
  badge: string
  sections: SeoSection[]
  faqs: SeoFaq[]
  relatedPaths: string[]
}

export const SEO_PAGES: SeoPage[] = [
  {
    path: '/hospitalisation-animal',
    title: 'Animal hospitalisation : qui s\'occupe de votre chien ou chat ?',
    metaDescription: 'Hospitalisé(e) et personne pour garder votre animal ? SécurPats alerte vos proches, centralise les infos vitales et organise la prise en charge de votre chien ou chat en urgence.',
    keywords: [
      'hospitalisation animal', 'garder animal hospitalisation', 'chien hospitalisation propriétaire',
      'chat seul hospitalisation', 'qui garde mon animal si je suis hospitalisé', 'urgence animal hospitalisation',
    ],
    navLabel: 'Hospitalisation',
    badge: 'Urgence & hospitalisation',
    h1: 'Hospitalisé(e) ? Votre animal ne doit jamais rester seul sans solution',
    heroSubtitle: 'Quand une hospitalisation survient — accident, maladie, intervention chirurgicale — la question est immédiate : qui va s\'occuper de mon chien, de mon chat, de mes animaux ? SécurPats existe pour répondre à cette urgence humaine et animale, avant même qu\'elle ne se produise.',
    sections: [
      {
        h2: 'Le problème que vivent des milliers de propriétaires en France',
        paragraphs: [
          'Chaque jour en France, des propriétaires d\'animaux sont hospitalisés de façon imprévue. Dans la précipitation, personne n\'a pensé à organiser la garde du chien, du chat ou du NAC. Les voisins sont absents, la famille est loin, et les services sociaux ou hospitaliers ne sont pas structurés pour gérer la présence d\'un animal à domicile.',
          'Résultat : stress supplémentaire au pire moment, animaux laissés seuls trop longtemps, promenades oubliées, traitements non administrés, voire abandon temporaire dans des conditions difficiles. Ce n\'est pas un détail : c\'est un enjeu de bien-être animal et de santé publique.',
        ],
        bullets: [
          'Hospitalisation d\'urgence sans préparation préalable',
          'Famille et amis injoignables ou non disponibles',
          'Informations médicales de l\'animal introuvables (allergies, médicaments)',
          'Aucun contact désigné pour intervenir rapidement',
        ],
      },
      {
        h2: 'Notre engagement : veiller sur votre animal et alerter les bonnes personnes',
        paragraphs: [
          'SécurPats est un service de protection animale d\'urgence conçu spécifiquement pour les situations où vous ne pouvez plus assurer vous-même la charge de vos compagnons — hospitalisation, accident, incapacité temporaire ou absence imprévue.',
          'Nous ne remplaçons pas un vétérinaire ni un refuge, mais nous garantissons qu\'en cas de crise, vos référents de confiance sont alertés immédiatement, avec toutes les informations nécessaires pour prendre soin de votre animal dans les meilleures conditions.',
        ],
        bullets: [
          'Jusqu\'à 5 référents d\'urgence alertés par email en quelques secondes',
          'Fiche animal complète : soins, alimentation, allergies, documents',
          'QR code secours accessible sans connexion pour les secours',
          'Carte d\'urgence imprimable à glisser dans votre portefeuille',
        ],
      },
      {
        h2: 'Préparer aujourd\'hui ce qui peut arriver demain',
        paragraphs: [
          'Comme un testament pour vos animaux ou une assurance de dernière minute, SécurPats se configure en moins de 10 minutes. Vous ajoutez vos animaux, vos contacts de confiance, vos documents vétérinaires, et vous obtenez un système d\'alerte prêt à fonctionner 24 h/24, 7 j/7.',
          'L\'abonnement à partir de 4,99 €/mois vous apporte une tranquillité d\'esprit considérable : en cas d\'hospitalisation, vous savez que votre animal ne restera pas invisible.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Que faire de mon chien si je suis hospitalisé(e) en urgence ?',
        answer: 'Avec SécurPats, déclenchez une alerte depuis votre espace ou demandez à un proche de le faire. Vos référents reçoivent immédiatement les coordonnées, les consignes de soins et l\'accès à la fiche secours de l\'animal.',
      },
      {
        question: 'SécurPats peut-il trouver quelqu\'un pour garder mon animal ?',
        answer: 'SécurPats alerte en priorité vos référents désignés (famille, amis, voisins, pet-sitter). Notre réseau de pet-sitters peut également être mobilisé selon les disponibilités. L\'objectif est qu\'une personne de confiance intervienne le plus vite possible.',
      },
      {
        question: 'Mon animal est-il protégé si je suis inconscient ou incapable d\'agir ?',
        answer: 'Oui, grâce au QR code sur votre carte d\'urgence. Toute personne (secouriste, personnel hospitalier, voisin) peut scanner le code et accéder aux informations vitales ainsi qu\'aux contacts référents.',
      },
    ],
    relatedPaths: ['/urgence-hospitalisation', '/qui-garde-mon-animal', '/alerte-animal-urgence'],
  },
  {
    path: '/urgence-hospitalisation',
    title: 'Urgence hospitalisation : protéger son animal quand tout bascule',
    metaDescription: 'Accident, AVC, crise cardiaque, chute… En cas d\'hospitalisation d\'urgence, SécurPats alerte vos proches et transmet les consignes pour votre chien, chat ou NAC.',
    keywords: [
      'urgence hospitalisation animal', 'accident propriétaire chien', 'hospitalisation imprévue animal',
      'alerte famille animal urgence', 'secours animal maître hospitalisé',
    ],
    navLabel: 'Urgence hospitalisation',
    badge: 'Situation d\'urgence',
    h1: 'Hospitalisation d\'urgence : ne laissez pas votre animal dans l\'angle mort',
    heroSubtitle: 'Un accident de la route, une malaise, une chute dans les escaliers — et soudain, vous êtes transporté à l\'hôpital. Votre animal est seul à la maison. SécurPats a été pensé pour ce moment précis.',
    sections: [
      {
        h2: 'Quand l\'urgence médicale oublie l\'animal',
        paragraphs: [
          'Les services d\'urgence se concentrent à juste titre sur votre survie. Rarement, on vous demande : « Qui s\'occupe de votre chien ? ». Pourtant, pour de nombreux propriétaires, cette question est aussi anxiogène que leur propre état de santé.',
          'Sans organisation préalable, des heures peuvent passer avant qu\'un voisin ne remarque les aboiements, qu\'un chat ne manque de nourriture, ou qu\'un traitement quotidien ne soit oublié.',
        ],
      },
      {
        h2: 'Comment SécurPats réagit en cas d\'urgence',
        paragraphs: [
          'Dès qu\'une urgence est déclarée sur la plateforme, SécurPats envoie des emails automatiques à vos référents prioritaires avec le nom de l\'animal, la situation, les consignes médicales et un lien vers la fiche secours complète.',
          'Si vous portez la carte d\'urgence SécurPats, les secouristes ou le personnel soignant peuvent scanner le QR code et contacter directement vos référents — même si vous êtes inconscient.',
        ],
        bullets: [
          'Alerte email instantanée aux référents',
          'Fiche secours publique via QR code (/secours)',
          'Documents vétérinaires accessibles aux personnes autorisées',
          'Historique des alertes dans votre espace propriétaire',
        ],
      },
      {
        h2: 'Un filet de sécurité pour les personnes seules avec un animal',
        paragraphs: [
          'Les personnes vivant seules avec un compagnon sont les plus exposées. SécurPats compense l\'absence de famille proche en formalisant un réseau de confiance et en automatisant l\'alerte. Vous choisissez qui intervient, dans quel ordre, et avec quelles informations.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Puis-je déclencher une alerte depuis mon téléphone à l\'hôpital ?',
        answer: 'Oui. Connectez-vous à votre espace SécurPats et utilisez la fonction « Déclarer une urgence ». L\'alerte part en quelques secondes à tous vos référents.',
      },
      {
        question: 'Que se passe-t-il si je n\'ai pas accès à mon téléphone ?',
        answer: 'Le QR code sur votre carte d\'urgence permet à un tiers d\'accéder à la fiche secours et de joindre vos référents sans votre intervention.',
      },
    ],
    relatedPaths: ['/hospitalisation-animal', '/protection-animal-urgence', '/referents-urgence-animal'],
  },
  {
    path: '/qui-garde-mon-animal',
    title: 'Qui va garder mon animal si je suis hospitalisé(e) ?',
    metaDescription: 'Personne pour garder votre chien ou chat pendant votre hospitalisation ? SécurPats organise l\'alerte de vos proches et centralise toutes les infos pour une prise en charge rapide.',
    keywords: [
      'qui garde mon animal', 'garde chien hospitalisation', 'garde chat urgence',
      'personne pour s occuper de mon chien', 'faire garder animal urgence', 'garde animale urgence',
    ],
    navLabel: 'Qui garde mon animal ?',
    badge: 'Garde & référents',
    h1: 'Qui va s\'occuper de mon animal si je ne peux plus le faire ?',
    heroSubtitle: 'La question revient dans chaque forum, chaque groupe Facebook, chaque conversation entre propriétaires : « Si je suis hospitalisé, qui garde mon chien ? » SécurPats apporte une réponse concrète et anticipée.',
    sections: [
      {
        h2: 'Pourquoi il est difficile de trouver quelqu\'un en urgence',
        paragraphs: [
          'La garde d\'urgence diffère d\'une garde planifiée pour les vacances. Personne n\'anticipe une hospitalisation de 48 h ou de 3 semaines. Les proches ont eux-mêmes des contraintes : travail, enfants, allergies, logement non adapté aux animaux.',
          'Sans plan préétabli, on improvise : messages paniqués sur les réseaux sociaux, appels successifs, parfois recours coûteux à une pension de dernière minute.',
        ],
      },
      {
        h2: 'La solution SécurPats : un réseau prêt avant la crise',
        paragraphs: [
          'Avant toute urgence, vous désignez jusqu\'à 5 référents : un membre de la famille, un ami de confiance, un voisin, un pet-sitter, un collègue. Chacun reçoit les informations nécessaires à l\'avance via la plateforme.',
          'En cas d\'hospitalisation, ils sont alertés automatiquement avec un résumé clair : espèce, race, nom, adresse, traitements en cours, vétérinaire habituel, documents utiles.',
        ],
        bullets: [
          'Référent 1 : alerté en premier',
          'Référents 2 à 5 : contacts de secours',
          'Ordre de priorité configurable',
          'Emails de notification automatiques',
        ],
      },
      {
        h2: 'Nous nous engageons à ce qu\'une personne soit prévenue',
        paragraphs: [
          'SécurPats ne garantit pas qu\'un référent acceptera la garde — c\'est une relation humaine. En revanche, nous garantissons que les bonnes personnes seront informées immédiatement, avec toutes les données pour agir vite et bien. C\'est déjà ce qui manque le plus aujourd\'hui.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Combien de référents puis-je désigner ?',
        answer: 'Jusqu\'à 5 référents d\'urgence par compte, avec leurs emails et numéros de téléphone.',
      },
      {
        question: 'Mes référents doivent-ils créer un compte ?',
        answer: 'Non. Ils reçoivent un email d\'alerte avec les informations essentielles. Ils peuvent aussi accéder à la fiche secours via le QR code.',
      },
    ],
    relatedPaths: ['/hospitalisation-animal', '/garde-animal-urgence', '/referents-urgence-animal'],
  },
  {
    path: '/alerte-animal-urgence',
    title: 'Alerte urgence animal : prévenir vos proches en quelques secondes',
    metaDescription: 'Système d\'alerte email pour vos référents en cas d\'urgence ou d\'hospitalisation. SécurPats notifie automatiquement les personnes de confiance pour la prise en charge de votre animal.',
    keywords: [
      'alerte urgence animal', 'notification urgence chien', 'prévenir famille animal hospitalisation',
      'alerte référents animal', 'système alerte animal de compagnie',
    ],
    navLabel: 'Alerte urgence',
    badge: 'Alertes automatiques',
    h1: 'Alertez vos proches en urgence — votre animal compte sur eux',
    heroSubtitle: 'En cas d\'hospitalisation ou d\'impossibilité soudaine de rentrer chez vous, chaque minute compte pour votre animal. SécurPats envoie une alerte email immédiate à vos référents désignés.',
    sections: [
      {
        h2: 'Une alerte claire, pas un message perdu dans la panique',
        paragraphs: [
          'Plutôt qu\'un SMS vague « appelle-moi urgent », SécurPats envoie un email structuré : nom de l\'animal, nature de l\'urgence, consignes de soins, lien vers la fiche secours complète et coordonnées du vétérinaire.',
          'Vos référents comprennent immédiatement la gravité et disposent de tout le contexte pour intervenir.',
        ],
      },
      {
        h2: 'Technologie au service du lien humain',
        paragraphs: [
          'L\'alerte est envoyée via notre infrastructure sécurisée (Resend, hébergement européen). Vos données restent conformes au RGPD. L\'objectif n\'est pas de remplacer un appel humain, mais de s\'assurer que l\'information arrive, même la nuit, même si vous êtes en salle d\'opération.',
        ],
        bullets: [
          'Envoi email en quelques secondes',
          'Contenu personnalisé par animal',
          'Fiche secours accessible en ligne',
          'Conformité RGPD et données hébergées en Europe',
        ],
      },
    ],
    faqs: [
      {
        question: 'Les alertes fonctionnent-elles la nuit et le week-end ?',
        answer: 'Oui. Le système d\'alerte est automatique et disponible 24 h/24, 7 j/7.',
      },
      {
        question: 'Puis-je tester le système avant une vraie urgence ?',
        answer: 'Vous pouvez vérifier que vos référents ont bien des emails valides dans votre espace. N\'utilisez la déclaration d\'urgence que pour une situation réelle afin de préserver la crédibilité des alertes.',
      },
    ],
    relatedPaths: ['/urgence-hospitalisation', '/referents-urgence-animal', '/protection-animal-urgence'],
  },
  {
    path: '/referents-urgence-animal',
    title: 'Référents d\'urgence animal : désignez vos contacts de confiance',
    metaDescription: 'Désignez jusqu\'à 5 référents d\'urgence pour votre chien, chat ou NAC. En cas d\'hospitalisation, SécurPats les alerte avec toutes les informations pour prendre soin de votre animal.',
    keywords: [
      'référent urgence animal', 'contact urgence chien', 'personne de confiance animal',
      'designer gardien animal urgence', 'réseau urgence animal de compagnie',
    ],
    navLabel: 'Référents d\'urgence',
    badge: 'Réseau de confiance',
    h1: 'Vos référents d\'urgence : le maillon essentiel quand vous êtes hospitalisé(e)',
    heroSubtitle: 'Famille, amis, voisins, pet-sitter — choisissez les personnes qui interviendront pour votre animal si vous ne le pouvez plus. SécurPats les alerte et leur transmet toutes les consignes.',
    sections: [
      {
        h2: 'Pourquoi désigner des référents change tout',
        paragraphs: [
          'Sans référent identifié, les secours ou l\'hôpital ne savent pas qui appeler pour votre animal. Avec SécurPats, vos contacts sont enregistrés, priorisés et joignables en un clic via l\'alerte automatique.',
        ],
        bullets: [
          'Jusqu\'à 5 référents par compte',
          'Email et téléphone enregistrés',
          'Ordre de priorité modifiable',
          'Notification automatique en cas d\'urgence',
        ],
      },
      {
        h2: 'Informations transmises à vos référents',
        paragraphs: [
          'Chaque référent alerté reçoit : le nom et la photo de l\'animal, l\'adresse du domicile, les traitements en cours, les allergies, le régime alimentaire, le vétérinaire traitant, et un accès à la fiche secours complète via QR code.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Mes référents voient-ils toutes mes données personnelles ?',
        answer: 'Ils reçoivent uniquement les informations nécessaires à la prise en charge de l\'animal. Vos documents restent accessibles via la fiche secours sécurisée.',
      },
    ],
    relatedPaths: ['/qui-garde-mon-animal', '/alerte-animal-urgence', '/hospitalisation-animal'],
  },
  {
    path: '/garde-animal-urgence',
    title: 'Garde animal d\'urgence : solution quand vous êtes hospitalisé(e)',
    metaDescription: 'Besoin d\'une garde animal en urgence pendant une hospitalisation ? SécurPats alerte vos référents et pet-sitters et transmet fiches santé, documents et consignes de soins.',
    keywords: [
      'garde animal urgence', 'garde chien urgence', 'garde chat urgence',
      'pension animal urgence', 'pet sitter urgence hospitalisation', 'garde animale d urgence',
    ],
    navLabel: 'Garde d\'urgence',
    badge: 'Garde & pet-sitting',
    h1: 'Garde animal d\'urgence : organisez la prise en charge avant la crise',
    heroSubtitle: 'Une hospitalisation ne prévient pas. La garde de votre chien, chat ou NAC, si. SécurPats structure votre plan d\'urgence pour que personne ne soit pris de court.',
    sections: [
      {
        h2: 'Garde planifiée vs garde d\'urgence : deux mondes différents',
        paragraphs: [
          'Réserver un pet-sitter pour les vacances est simple. Trouver quelqu\'un à 3 h du matin parce que vous venez d\'être admis aux urgences, c\'est une autre histoire. SécurPats comble ce vide en pré-enregistrant vos contacts et en automatisant l\'alerte.',
        ],
      },
      {
        h2: 'Réseau pet-sitters SécurPats',
        paragraphs: [
          'Au-delà de vos référents personnels, la plateforme SécurPats intègre un réseau de pet-sitters disponibles pour des missions d\'urgence. Selon les disponibilités, une mission peut être proposée à un professionnel ou bénévole inscrit sur la plateforme.',
        ],
        bullets: [
          'Référents personnels alertés en priorité',
          'Réseau pet-sitters mobilisable',
          'Fiche animal complète transmise au gardien',
          'Documents vétérinaires centralisés',
        ],
      },
      {
        h2: 'Préparez la garde d\'urgence en 10 minutes',
        paragraphs: [
          'Créez votre compte, ajoutez vos animaux avec photo et consignes, désignez vos référents, uploadez le carnet de santé, générez votre QR code. Vous avez un plan de garde d\'urgence opérationnel pour toute la durée de votre abonnement.',
        ],
      },
    ],
    faqs: [
      {
        question: 'SécurPats envoie-t-il un pet-sitter automatiquement chez moi ?',
        answer: 'SécurPats alerte d\'abord vos référents et peut proposer une mission au réseau pet-sitters. L\'intervention dépend des disponibilités et de l\'acceptation de la mission.',
      },
      {
        question: 'Quel est le prix du service ?',
        answer: 'L\'abonnement SécurPats démarre à 4,99 €/mois ou 49,99 €/an, avec renouvellement automatique. Consultez la page Tarifs pour le détail.',
      },
    ],
    relatedPaths: ['/qui-garde-mon-animal', '/hospitalisation-animal', '/protection-animal-urgence'],
  },
  {
    path: '/protection-animal-urgence',
    title: 'Protection animale d\'urgence : service complet SécurPats',
    metaDescription: 'SécurPats protège vos animaux en cas d\'hospitalisation, d\'accident ou d\'absence imprévue. Alertes, QR code secours, fiches complètes et référents — dès 4,99 €/mois.',
    keywords: [
      'protection animale urgence', 'service urgence animal de compagnie', 'sécurité animal hospitalisation',
      'plateforme protection chien chat', 'SécurPats', 'urgence compagnon hospitalisé',
    ],
    navLabel: 'Protection urgence',
    badge: 'Service complet',
    h1: 'Protection animale d\'urgence : le service qui veille quand vous ne pouvez pas',
    heroSubtitle: 'SécurPats réunit en une seule plateforme tout ce dont votre animal a besoin en cas d\'hospitalisation ou d\'urgence : alertes, référents, QR code, documents et carte d\'urgence.',
    sections: [
      {
        h2: 'Tout-en-un pour la tranquillité d\'esprit',
        paragraphs: [
          'Fini les carnets de santé égarés, les numéros de téléphone introuvables et les proches non prévenus. SécurPats centralise l\'essentiel et automatise l\'alerte — parce qu\'en urgence, chaque seconde compte pour votre compagnon.',
        ],
        bullets: [
          'Fiches animaux détaillées (soins, allergies, alimentation)',
          'Jusqu\'à 5 référents d\'urgence',
          'Alertes email automatiques',
          'QR code & fiche secours publique',
          'Carte d\'urgence imprimable',
          'Documents vétérinaires sécurisés',
          'Espace propriétaire 24 h/24',
        ],
      },
      {
        h2: 'Pour qui est fait SécurPats ?',
        paragraphs: [
          'Personnes seules avec un ou plusieurs animaux, seniors, personnes à mobilité réduite, parents de famille, travailleurs isolés, ou tout propriétaire responsable qui refuse l\'idée de laisser son compagnon sans recours en cas d\'imprévu.',
          'Si vous vous êtes déjà demandé « et si j\'étais hospitalisé demain ? », SécurPats est fait pour vous.',
        ],
      },
      {
        h2: 'Hébergement sécurisé, conformité RGPD',
        paragraphs: [
          'Vos données et celles de vos animaux sont hébergées en Europe (Supabase), chiffrées et conformes au RGPD. Vous gardez le contrôle : export, modification et suppression de vos données à tout moment.',
        ],
      },
    ],
    faqs: [
      {
        question: 'SécurPats est-il un service vétérinaire ?',
        answer: 'Non. SécurPats est un service de protection et d\'alerte. En cas de problème de santé animale, vos référents disposent des coordonnées de votre vétérinaire et des documents utiles.',
      },
      {
        question: 'Comment souscrire ?',
        answer: 'Créez un compte sur securpats.fr, configurez vos animaux et référents, puis activez votre abonnement à partir de 4,99 €/mois.',
      },
    ],
    relatedPaths: ['/hospitalisation-animal', '/tarifs', '/fonctionnement'],
  },
  ...SCENARIO_SEO_PAGES,
]

export function getSeoPageByPath(path: string): SeoPage | undefined {
  return SEO_PAGES.find(p => p.path === path)
}

export const SEO_NAV_LINKS = SEO_PAGES.map(p => ({ to: p.path, label: p.navLabel }))
