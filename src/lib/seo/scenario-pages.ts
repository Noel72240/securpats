import type { SeoPage } from './content'

export const SCENARIO_SEO_PAGES: SeoPage[] = [
  {
    path: '/accident-animal-urgence',
    title: 'Accident du propriétaire : protéger son animal quand les secours interviennent',
    metaDescription: 'En cas d\'accident, les secours peuvent identifier votre animal via la carte ou le QR Code SécurPats et alerter vos référents pour la prise en charge de votre chien ou chat.',
    keywords: [
      'accident propriétaire animal', 'secours chien accident', 'QR code urgence animal',
      'carte urgence animal accident', 'victime accident animal de compagnie',
    ],
    navLabel: 'Accident',
    badge: 'Scénario d\'urgence',
    h1: 'Accident : que devient votre animal quand vous ne pouvez plus répondre ?',
    heroSubtitle: 'Un accident de la route, une chute, un malaise — les secours se concentrent sur vous. Grâce à la carte d\'urgence et au QR Code SécurPats, ils peuvent identifier que vous avez un animal et contacter immédiatement vos référents.',
    sections: [
      {
        h2: 'L\'angle mort des secours face aux animaux',
        paragraphs: [
          'Lors d\'un accident, les équipes de secours n\'ont pas toujours le réflexe de demander si la victime possède un animal. Pourtant, des heures peuvent s\'écouler avant qu\'un chien ou un chat seul à domicile ne soit pris en charge.',
          'La carte d\'urgence SécurPats et le QR code portés sur vous ou à domicile permettent d\'indiquer clairement la présence d\'un animal et de donner accès aux contacts prioritaires.',
        ],
      },
      {
        h2: 'Comment SécurPats intervient',
        paragraphs: [
          'Vos référents sont désignés à l\'avance avec un ordre de priorité. En cas d\'accident, un tiers peut scanner le QR code ou utiliser les informations de la carte pour déclencher l\'alerte et transmettre les consignes de soins.',
        ],
        bullets: [
          'Carte d\'urgence imprimable avec QR code',
          'Fiche secours accessible sans compte',
          'Alerte email aux référents prioritaires',
          'Informations vétérinaires et traitements en cours',
        ],
      },
    ],
    faqs: [
      {
        question: 'La carte d\'urgence est-elle utile en cas d\'accident dehors ?',
        answer: 'Oui. Portée dans le portefeuille ou sur une clé USB, elle informe les secours de la présence de votre animal et donne les contacts de vos référents.',
      },
      {
        question: 'Mes référents reçoivent-ils toutes les infos nécessaires ?',
        answer: 'Oui. L\'alerte inclut le nom de l\'animal, l\'adresse, les traitements, le vétérinaire et un lien vers la fiche secours complète.',
      },
    ],
    relatedPaths: ['/urgence-hospitalisation', '/hospitalisation-animal', '/referents-urgence-animal'],
  },
  {
    path: '/deces-proprietaire-animal',
    title: 'Décès du propriétaire : testament animalier et prise en charge',
    metaDescription: 'En cas de décès, SécurPats applique votre testament animalier : ordre de priorité des référents, fiches complètes et documents pour assurer la continuité des soins.',
    keywords: [
      'décès propriétaire animal', 'testament animalier', 'qui prend l\'animal après décès',
      'garde animal décès maître', 'protection animal décès',
    ],
    navLabel: 'Décès',
    badge: 'Scénario d\'urgence',
    h1: 'Décès : organiser la prise en charge de votre animal à l\'avance',
    heroSubtitle: 'Personne ne souhaite y penser, mais prévoir le devenir de votre compagnon en cas de décès est un acte de responsabilité. SécurPats formalise vos volontés via vos référents et vos consignes.',
    sections: [
      {
        h2: 'Un vide juridique et émotionnel',
        paragraphs: [
          'Après un décès, la famille est souvent démunie face à l\'animal du défunt. Qui doit s\'en occuper ? Où sont les documents vétérinaires ? Quels traitements suivre ? Sans préparation, l\'animal peut être confié à la hâte ou négligé.',
        ],
      },
      {
        h2: 'Le rôle du testament animalier numérique',
        paragraphs: [
          'SécurPats fonctionne comme un testament animalier opérationnel : vous désignez jusqu\'à 5 référents par ordre de priorité, centralisez les informations de santé et les consignes, et vos proches disposent de tout le nécessaire pour agir rapidement.',
        ],
        bullets: [
          'Ordre de priorité des personnes de confiance',
          'Fiches animaux complètes et documents centralisés',
          'Consignes alimentaires et médicales détaillées',
          'Accès sécurisé pour les référents autorisés',
        ],
      },
    ],
    faqs: [
      {
        question: 'SécurPats remplace-t-il un testament juridique ?',
        answer: 'SécurPats organise la prise en charge pratique et l\'alerte de vos référents. Pour les aspects juridiques (succession, donation), consultez un notaire en complément.',
      },
      {
        question: 'Comment mes proches savent-ils qu\'ils sont désignés ?',
        answer: 'Vous configurez vos référents dans votre espace. En cas d\'urgence ou de décès signalé, ils reçoivent une alerte avec toutes les informations utiles.',
      },
    ],
    relatedPaths: ['/referents-urgence-animal', '/hospitalisation-animal', '/protection-animal-urgence'],
  },
  {
    path: '/personne-agee-animal',
    title: 'Personne âgée et animal : alerte en cas de chute ou d\'hospitalisation',
    metaDescription: 'Une personne âgée hospitalisée après une chute ? SécurPats alerte immédiatement un proche pour prendre soin du chien, du chat ou du NAC resté seul.',
    keywords: [
      'personne âgée animal seul', 'chute personne âgée chien', 'hospitalisation senior animal',
      'alerte famille animal personne âgée', 'garde animal senior urgence',
    ],
    navLabel: 'Personne âgée',
    badge: 'Scénario d\'urgence',
    h1: 'Personne âgée : ne laissez pas son animal sans réponse en cas de chute',
    heroSubtitle: 'Pour de nombreux seniors, l\'animal est un compagnon essentiel. En cas de chute, d\'AVC ou d\'hospitalisation imprévue, SécurPats alerte un proche pour assurer la continuité des soins.',
    sections: [
      {
        h2: 'Un enjeu fréquent et sous-estimé',
        paragraphs: [
          'Les personnes âgées vivant seules avec un animal sont particulièrement vulnérables. Une chute peut entraîner une hospitalisation de plusieurs jours, laissant le compagnon sans nourriture, sans sortie ni traitement.',
        ],
      },
      {
        h2: 'Un filet de sécurité pour les familles',
        paragraphs: [
          'Les enfants, petits-enfants ou voisins de confiance peuvent être désignés comme référents. Dès qu\'une urgence est déclenchée — par le senior lui-même ou un tiers via le QR code — ils sont prévenus avec les consignes précises.',
        ],
        bullets: [
          'Alerte immédiate aux proches désignés',
          'Fiche secours accessible via QR code',
          'Consignes adaptées (médicaments, alimentation, sorties)',
          'Interface simple pour les seniors',
        ],
      },
    ],
    faqs: [
      {
        question: 'Un proche peut-il configurer le compte pour un senior ?',
        answer: 'Oui. Un membre de la famille peut créer le compte, renseigner les animaux et désigner les référents, avec l\'accord du propriétaire.',
      },
      {
        question: 'Le QR code fonctionne-t-il si la personne est inconsciente ?',
        answer: 'Oui. Les secours ou un voisin peuvent scanner le QR code sur la carte d\'urgence pour joindre les référents sans mot de passe.',
      },
    ],
    relatedPaths: ['/hospitalisation-animal', '/urgence-hospitalisation', '/referents-urgence-animal'],
  },
  {
    path: '/violence-conjugale-animal',
    title: 'Violence conjugale : protéger son animal lors d\'une mise en sécurité',
    metaDescription: 'En situation de violence conjugale, SécurPats permet une prise en charge rapide de l\'animal via un référent de confiance ou une association partenaire.',
    keywords: [
      'violence conjugale animal', 'fuir avec son chien', 'protection animal violence',
      'garde urgence animal femme', 'animal compagnon violence domestique',
    ],
    navLabel: 'Violence conjugale',
    badge: 'Scénario d\'urgence',
    h1: 'Violence conjugale : votre animal ne doit pas être un obstacle à votre sécurité',
    heroSubtitle: 'Beaucoup de victimes hésitent à quitter un foyer violent par peur pour leur animal. SécurPats permet d\'organiser à l\'avance une prise en charge rapide par un référent ou une association.',
    sections: [
      {
        h2: 'L\'animal, otage émotionnel dans les violences conjugales',
        paragraphs: [
          'Les animaux sont parfois utilisés comme moyen de contrôle ou de menace. Partir en urgence tout en sachant que son compagnon sera pris en charge réduit un frein majeur à la mise en sécurité.',
        ],
      },
      {
        h2: 'Une organisation discrète et rapide',
        paragraphs: [
          'Désignez un référent hors du foyer (ami, famille, association) qui recevra l\'alerte en cas de déclenchement. Les informations de l\'animal sont centralisées pour une prise en charge immédiate, sans avoir à tout expliquer dans l\'urgence.',
        ],
        bullets: [
          'Référent extérieur au foyer désigné à l\'avance',
          'Alerte déclenchable discrètement depuis le téléphone',
          'Fiche complète transmise au référent',
          'Données hébergées en Europe, conformes RGPD',
        ],
      },
    ],
    faqs: [
      {
        question: 'Puis-je déclencher une alerte sans que mon conjoint le sache ?',
        answer: 'Oui. L\'alerte part directement à vos référents par email. Préparez votre plan de sécurité avec une association spécialisée en complément.',
      },
      {
        question: 'Une association peut-elle être référente ?',
        answer: 'Oui, si elle dispose d\'un contact email joignable. Vous pouvez désigner un référent associatif dans votre liste de contacts.',
      },
    ],
    relatedPaths: ['/referents-urgence-animal', '/garde-animal-urgence', '/protection-animal-urgence'],
  },
  {
    path: '/hospitalisation-psychiatrique-animal',
    title: 'Hospitalisation psychiatrique : protection temporaire de l\'animal',
    metaDescription: 'Hospitalisation psychiatrique imprévue ? SécurPats assure une protection temporaire de votre animal en alertant vos référents avec toutes les consignes de soins.',
    keywords: [
      'hospitalisation psychiatrique animal', 'animal seul hospitalisation psychiatrique',
      'garde chien urgence santé mentale', 'protection animal hospitalisation psychiatrique',
    ],
    navLabel: 'Hospitalisation psychiatrique',
    badge: 'Scénario d\'urgence',
    h1: 'Hospitalisation psychiatrique : protéger temporairement votre animal',
    heroSubtitle: 'Une admission en psychiatrie peut être soudaine et durable. Pendant ce temps, votre animal a besoin de continuité de soins. SécurPats alerte vos référents pour une prise en charge organisée.',
    sections: [
      {
        h2: 'Une urgence humaine qui impacte l\'animal',
        paragraphs: [
          'Lors d\'une crise ou d\'une hospitalisation sous contrainte, le propriétaire n\'a souvent pas le temps d\'organiser la garde. L\'animal reste seul, parfois des jours, sans que l\'entourage soit informé.',
        ],
      },
      {
        h2: 'Protection temporaire structurée',
        paragraphs: [
          'Vos référents reçoivent une alerte avec les informations essentielles : alimentation, traitements, comportement, vétérinaire. Ils peuvent intervenir rapidement ou coordonner une garde temporaire.',
        ],
        bullets: [
          'Alerte automatique aux référents prioritaires',
          'Consignes détaillées pour une prise en charge sereine',
          'Documents vétérinaires accessibles',
          'Possibilité de déclencher l\'alerte depuis l\'hôpital',
        ],
      },
    ],
    faqs: [
      {
        question: 'Puis-je préparer mon plan à l\'avance ?',
        answer: 'Oui. C\'est même recommandé : configurez vos animaux, référents et consignes avant toute situation de crise.',
      },
      {
        question: 'Combien de temps la garde peut-elle durer ?',
        answer: 'SécurPats organise l\'alerte et la transmission d\'informations. La durée de la garde dépend de l\'accord entre vos référents ; la plateforme reste accessible tant que votre abonnement est actif.',
      },
    ],
    relatedPaths: ['/hospitalisation-animal', '/qui-garde-mon-animal', '/referents-urgence-animal'],
  },
  {
    path: '/incarceration-garde-animal',
    title: 'Incarcération : organiser la garde de son animal',
    metaDescription: 'En cas d\'incarcération, SécurPats organise la garde de votre chien ou chat en alertant vos référents avec toutes les informations et consignes nécessaires.',
    keywords: [
      'incarcération garde animal', 'prison animal de compagnie', 'qui garde mon chien si je vais en prison',
      'organisation garde animal incarcération',
    ],
    navLabel: 'Incarcération',
    badge: 'Scénario d\'urgence',
    h1: 'Incarcération : prévoir la garde de votre animal à l\'avance',
    heroSubtitle: 'Une incarcération peut survenir de façon imprévue. Sans plan préétabli, l\'animal risque d\'être confié à la hâte ou abandonné. SécurPats structure la garde via vos référents désignés.',
    sections: [
      {
        h2: 'Un animal sans solution en l\'absence du propriétaire',
        paragraphs: [
          'Lors d\'une privation de liberté, le délai pour organiser la garde est très court. La famille n\'a pas toujours les informations pratiques : nourriture, allergies, vétérinaire, comportement.',
        ],
      },
      {
        h2: 'Organiser la garde avant l\'urgence',
        paragraphs: [
          'En configurant SécurPats à l\'avance, vous désignez qui prendra le relais et vous centralisez toutes les informations. En cas d\'incarcération, une alerte peut être déclenchée pour activer ce réseau.',
        ],
        bullets: [
          'Référents prioritaires avec coordonnées à jour',
          'Fiches animaux complètes transmises automatiquement',
          'Documents et ordonnances accessibles',
          'Alerte déclenchable par un proche autorisé',
        ],
      },
    ],
    faqs: [
      {
        question: 'Un proche peut-il déclencher l\'alerte à ma place ?',
        answer: 'Un tiers peut utiliser le QR code d\'urgence pour accéder à la fiche secours et contacter vos référents. Pour déclencher une alerte complète, l\'accès à votre compte ou l\'intervention d\'un référent est nécessaire.',
      },
      {
        question: 'Puis-je mettre à jour mes référents depuis le centre de détention ?',
        answer: 'Si vous avez accès à votre espace SécurPats, vous pouvez modifier vos référents et consignes à tout moment.',
      },
    ],
    relatedPaths: ['/qui-garde-mon-animal', '/garde-animal-urgence', '/referents-urgence-animal'],
  },
  {
    path: '/voyage-interrompu-animal',
    title: 'Voyage interrompu : alerter pour nourrir et sortir son animal',
    metaDescription: 'Voyage interrompu, retard ou accident loin de chez vous ? Déclenchez une alerte SécurPats pour que vos référents nourrissent et sortent votre animal.',
    keywords: [
      'voyage interrompu animal', 'animal seul en voyage', 'alerte nourrir chien urgence',
      'retard voyage garde animal', 'propriétaire loin animal urgence',
    ],
    navLabel: 'Voyage interrompu',
    badge: 'Scénario d\'urgence',
    h1: 'Voyage interrompu : votre animal pris en charge même à distance',
    heroSubtitle: 'Retard de vol, accident sur la route, hospitalisation loin de chez vous — vous ne rentrerez pas ce soir. SécurPats permet de déclencher une alerte pour que votre animal soit nourri et sorti.',
    sections: [
      {
        h2: 'Loin de chez soi, l\'animal reste seul',
        paragraphs: [
          'Un voyage professionnel ou personnel peut être interrompu sans préavis. Pendant ce temps, le chien attend sa promenade, le chat sa pâtée, et les traitements quotidiens ne peuvent pas attendre.',
        ],
      },
      {
        h2: 'Une alerte depuis n\'importe où',
        paragraphs: [
          'Depuis votre téléphone, déclenchez l\'alerte urgence : vos référents reçoivent immédiatement les consignes (clés, alimentation, sorties, médicaments) et peuvent intervenir sans que vous ayez à tout expliquer au téléphone.',
        ],
        bullets: [
          'Alerte déclenchable depuis l\'étranger ou en déplacement',
          'Consignes d\'accès au logement (boîte à clés, codes)',
          'Horaires de sortie et alimentation détaillés',
          'Coordonnées du vétérinaire en cas de besoin',
        ],
      },
    ],
    faqs: [
      {
        question: 'Puis-je déclencher une alerte depuis l\'étranger ?',
        answer: 'Oui. Connectez-vous à votre espace SécurPats depuis n\'importe où avec une connexion internet.',
      },
      {
        question: 'Mes référents savent-ils comment accéder à mon logement ?',
        answer: 'Vous pouvez indiquer les consignes d\'accès dans la fiche animal et les documents associés.',
      },
    ],
    relatedPaths: ['/alerte-animal-urgence', '/qui-garde-mon-animal', '/garde-animal-urgence'],
  },
  {
    path: '/catastrophe-naturelle-animal',
    title: 'Catastrophe naturelle : coordonner la protection de votre animal',
    metaDescription: 'Inondation, incendie, séisme — en cas de catastrophe naturelle, SécurPats coordonne rapidement référents et associations pour la protection de votre animal.',
    keywords: [
      'catastrophe naturelle animal', 'évacuation chien inondation', 'animal urgence catastrophe',
      'protection animal sinistre', 'coordination référents catastrophe',
    ],
    navLabel: 'Catastrophe naturelle',
    badge: 'Scénario d\'urgence',
    h1: 'Catastrophe naturelle : protéger votre animal quand tout s\'accélère',
    heroSubtitle: 'Inondations, incendies, tempêtes — les catastrophes naturelles bouleversent les vies en quelques heures. SécurPats permet une coordination rapide entre vos référents et les associations pour la protection de votre compagnon.',
    sections: [
      {
        h2: 'Le chaos laisse souvent les animaux de côté',
        paragraphs: [
          'Lors d\'une évacuation ou d\'un sinistre, les propriétaires et les secours humains sont prioritaires. Les animaux peuvent être oubliés, enfermés ou dispersés. Une organisation préalable fait la différence.',
        ],
      },
      {
        h2: 'Coordination entre référents et associations',
        paragraphs: [
          'Vos référents disposent des informations vitales et peuvent coordonner la prise en charge, y compris avec des associations ou refuges partenaires. Le QR code et la fiche secours restent accessibles même si votre logement est endommagé.',
        ],
        bullets: [
          'Réseau de référents alertés simultanément',
          'Fiche secours accessible hors ligne via QR code',
          'Coordination possible avec associations',
          'Consignes d\'évacuation et contacts vétérinaires',
        ],
      },
    ],
    faqs: [
      {
        question: 'Le service fonctionne-t-il si les réseaux sont coupés ?',
        answer: 'La fiche secours via QR code reste accessible en ligne. Nous recommandez de confier une copie papier de la carte d\'urgence à un référent proche géographiquement.',
      },
      {
        question: 'Puis-je désigner une association comme référent ?',
        answer: 'Oui, si elle dispose d\'un contact email joignable et accepte ce rôle.',
      },
    ],
    relatedPaths: ['/protection-animal-urgence', '/referents-urgence-animal', '/alerte-animal-urgence'],
  },
]
