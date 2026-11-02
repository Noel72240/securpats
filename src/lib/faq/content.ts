export type FaqItem = { question: string; answer: string }

export type FaqTheme = {
  id: string
  sticker: string
  title: string
  intro: string
  items: FaqItem[]
}

export type FaqPageCopy = {
  title: string
  subtitle: string
  themesNav: string
  ctaTitle: string
  ctaBody: string
  ctaButton: string
  themes: FaqTheme[]
}

const fr: FaqPageCopy = {
  title: 'FAQ SécurPats',
  subtitle:
    'Bien-être animal, urgences, abonnement : toutes les réponses pour protéger vos compagnons — et comprendre pourquoi SécurPats existe.',
  themesNav: 'Thèmes',
  ctaTitle: 'Prêt à protéger vos animaux ?',
  ctaBody:
    'Un abonnement SécurPats, c’est la continuité des soins quand la vie bascule : fiches, référents, QR Code et alertes — pour moins de 5 € par mois.',
  ctaButton: 'Voir les tarifs',
  themes: [
    {
      id: 'quest-ce-que',
      sticker: '/faq/questions-v2.png',
      title: 'Qu’est-ce que SécurPats ?',
      intro:
        'SécurPats est la plateforme française qui prépare la prise en charge de vos animaux si vous êtes hospitalisé, accidenté ou indisponible.',
      items: [
        {
          question: 'À quoi sert SécurPats concrètement ?',
          answer:
            'SécurPats centralise les infos vitales de chaque animal (alimentation, traitements, allergies, vétérinaire, consignes) et relie vos proches de confiance. En urgence, un QR Code ou une alerte permet une prise en charge immédiate, sans panique ni improvisation.',
        },
        {
          question: 'Pour qui est faite la plateforme ?',
          answer:
            'Pour les propriétaires (chiens, chats et autres compagnons), leurs référents familiaux ou amis, et les pet-sitters / aidants qui interviennent en relais. L’objectif : qu’aucun animal ne reste seul face à l’imprévu.',
        },
        {
          question: 'En quoi est-ce différent d’un simple carnet santé ?',
          answer:
            'Un carnet papier reste à la maison. SécurPats est accessible via QR Code, avec alertes automatiques aux référents et un réseau de pet-sitters. C’est un dispositif d’urgence opérationnel, pas seulement un dossier.',
        },
      ],
    },
    {
      id: 'bien-etre',
      sticker: '/faq/joy-v2.png',
      title: 'Bien-être animal au quotidien',
      intro:
        'Le bien-être, c’est la continuité : repas, soins, rythme, et des humains qui savent quoi faire — surtout quand vous n’êtes plus là.',
      items: [
        {
          question: 'Comment SécurPats améliore le bien-être de mon animal ?',
          answer:
            'En évitant les ruptures de soins. Une hospitalisation ou un accident laisse souvent l’animal sans consignes claires. Avec SécurPats, la personne qui prend le relais connaît les repas, les médicaments, les peurs et les habitudes — ce qui réduit le stress pour l’animal.',
        },
        {
          question: 'Quelles infos de bien-être puis-je enregistrer ?',
          answer:
            'Espèce, race, âge, photo, alimentation, allergies, traitements, comportement, lieux de promenade, contacts vétérinaires, documents (carnet, ordonnances) et directives anticipées : qui doit s’occuper de lui, et dans quel ordre.',
        },
        {
          question: 'Est-ce utile même si je n’ai jamais eu d’urgence ?',
          answer:
            'Oui. Préparer aujourd’hui, c’est éviter demain le chaos. Beaucoup de propriétaires découvrent trop tard que personne n’a les clés, le vétérinaire ou le dosage. SécurPats transforme cette anticipation en sérénité au quotidien.',
        },
      ],
    },
    {
      id: 'abonnement',
      sticker: '/faq/cool-v2.png',
      title: 'Pourquoi prendre un abonnement ?',
      intro:
        'L’abonnement active la protection complète : fiches illimitées, référents, QR Code, documents et alertes. Sans abonnement, la préparation reste incomplète.',
      items: [
        {
          question: 'Pourquoi s’abonner plutôt que rester gratuit ?',
          answer:
            'L’abonnement débloque le dispositif d’urgence réel : QR Code de secours, alertes aux référents, espace documents et continuité de service. C’est l’équivalent d’une assurance organisationnelle pour vos animaux — à 4,99 €/mois ou 49,99 €/an.',
        },
        {
          question: 'Qu’est-ce qui est inclus dans l’abonnement propriétaire ?',
          answer:
            'Animaux illimités, jusqu’à 5 référents prioritaires, QR Code et carte d’urgence, stockage de documents, alertes, accès fiche de secours et support. Le paiement est sécurisé via Stripe ; résiliation possible à tout moment depuis votre espace.',
        },
        {
          question: 'L’abonnement annuel vaut-il le coup ?',
          answer:
            'Oui si vous vous engagez sur l’année : 49,99 €/an revient moins cher que 12 × 4,99 €. Vous gardez les mêmes fonctionnalités, avec un renouvellement automatique que vous pouvez couper quand vous voulez.',
        },
        {
          question: 'Et pour les pet-sitters ?',
          answer:
            'Les pet-sitters vérifiés peuvent souscrire l’offre VIP (9,90 €/mois) pour accéder aux missions, renforcer leur visibilité et accompagner les propriétaires en urgence dans leur zone.',
        },
      ],
    },
    {
      id: 'urgence',
      sticker: '/faq/surprise-v2.png',
      title: 'Urgences & imprévus',
      intro:
        'Hospitalisation, accident, voyage interrompu : la vie bascule vite. SécurPats est conçu pour ces secondes où tout doit être clair.',
      items: [
        {
          question: 'Que se passe-t-il si je déclenche une urgence ?',
          answer:
            'Vos référents sont notifiés selon l’ordre de priorité. Si besoin, un pet-sitter disponible dans votre zone peut être sollicité. L’objectif : une prise en charge immédiate de l’animal (nourriture, sorties, traitements).',
        },
        {
          question: 'Qui peut aider si mes proches ne répondent pas ?',
          answer:
            'Le réseau SécurPats (pet-sitters / aidants selon disponibilité) peut prendre le relais. C’est justement pour éviter qu’un animal reste plusieurs jours sans soins si la famille est débordée ou injoignable.',
        },
        {
          question: 'Quels scénarios sont couverts ?',
          answer:
            'Hospitalisation, accident, chute, urgence psychiatrique, incarceration, décès, voyage interrompu, ou toute situation où vous ne pouvez plus vous occuper de vos animaux. Les guides du site détaillent chaque cas.',
        },
      ],
    },
    {
      id: 'qr-code',
      sticker: '/faq/search-v2.png',
      title: 'QR Code & fiche de secours',
      intro:
        'Le QR Code est la porte d’entrée rapide vers l’essentiel : ce qu’il faut savoir pour soigner l’animal sans délai.',
      items: [
        {
          question: 'Comment fonctionne le QR Code ?',
          answer:
            'Chaque animal a un QR Code unique. En le scannant (smartphone), un secouriste, un vétérinaire ou un proche voit la fiche de secours : traitements, allergies, référents, vétérinaire. Les documents privés restent dans votre compte.',
        },
        {
          question: 'Où placer le QR Code ?',
          answer:
            'Sur le collier, dans le portefeuille, sur une carte d’urgence imprimée, ou à la maison près des affaires de l’animal. Plus il est visible, plus la prise en charge est rapide.',
        },
        {
          question: 'Le QR Code expose-t-il toute ma vie privée ?',
          answer:
            'Non. Seules les informations essentielles de secours sont visibles. Identité complète, documents médicaux détaillés et données de compte restent protégés derrière authentification.',
        },
      ],
    },
    {
      id: 'routines',
      sticker: '/faq/sleep-v2.png',
      title: 'Routines, soins & sérénité',
      intro:
        'Un animal stressé, c’est souvent un humain perdu. Des consignes claires = des nuits plus calmes pour tout le monde.',
      items: [
        {
          question: 'Puis-je indiquer les horaires de repas et de promenade ?',
          answer:
            'Oui. Plus vos consignes sont précises (heures, quantités, type de croquettes, sorties, médicaments), plus le relais est fidèle au rythme de l’animal — et moins il est anxieux.',
        },
        {
          question: 'Que faire pour un animal sous traitement long ?',
          answer:
            'Enregistrez posologie, horaires, nom du médicament et contact du vétérinaire. Ajoutez l’ordonnance dans les documents. En urgence, la personne qui intervient n’improvise pas un dosage.',
        },
        {
          question: 'SécurPats remplace-t-il un vétérinaire ?',
          answer:
            'Non. SécurPats organise l’information et l’humain de relais. Les décisions médicales restent au vétérinaire. Nous facilitons l’accès aux bonnes infos au bon moment.',
        },
      ],
    },
    {
      id: 'securite',
      sticker: '/faq/shield-v2.png',
      title: 'Sécurité & confiance',
      intro:
        'Vos données concernent vos animaux et votre famille. Elles sont traitées avec le sérieux d’un service d’urgence.',
      items: [
        {
          question: 'Mes données sont-elles protégées (RGPD) ?',
          answer:
            'Oui. Hébergement en Europe, chiffrement, accès contrôlé, conformité RGPD. Vous pouvez exporter, modifier ou supprimer vos données. Pas de revente publicitaire de vos fiches animaux.',
        },
        {
          question: 'Qui vérifie les pet-sitters ?',
          answer:
            'Les pet-sitters passent par une vérification d’identité (documents) avant d’intervenir sur des missions. L’admin valide les dossiers pour renforcer la confiance du réseau.',
        },
        {
          question: 'Puis-je faire confiance au paiement ?',
          answer:
            'Les paiements passent par Stripe, leader mondial du paiement en ligne. SécurPats ne stocke pas vos numéros de carte. Factures et reçus sont disponibles après souscription.',
        },
      ],
    },
    {
      id: 'famille',
      sticker: '/faq/love-v2.png',
      title: 'Famille, référents & lien',
      intro:
        'Protéger un animal, c’est aussi rassurer ceux qui vous aiment : chacun sait quoi faire, sans se disputer au pire moment.',
      items: [
        {
          question: 'Combien de référents puis-je ajouter ?',
          answer:
            'Jusqu’à 5 contacts de confiance, avec un ordre de priorité. En urgence, on contacte d’abord le n°1, puis les suivants si besoin.',
        },
        {
          question: 'Un référent doit-il avoir un compte SécurPats ?',
          answer:
            'Pas forcément pour être alerté et consulter la fiche de secours via le lien / QR. Pour un usage avancé (espace aidant, etc.), une inscription dédiée est possible.',
        },
        {
          question: 'Puis-je préparer des directives anticipées ?',
          answer:
            'Oui. Vous pouvez formaliser qui s’occupe de l’animal, les volontés de placement, et les consignes sensibles — pour que vos proches ne portent pas seuls ces décisions.',
        },
      ],
    },
    {
      id: 'fonctionnalites',
      sticker: '/faq/gears-v2.png',
      title: 'Fonctionnalités du compte',
      intro:
        'Tout est pensé pour être simple : ajouter un animal, un document, un référent, puis générer le QR.',
      items: [
        {
          question: 'Par où commencer après inscription ?',
          answer:
            '1) Complétez votre profil. 2) Ajoutez vos animaux. 3) Ajoutez vos référents. 4) Générez le QR Code / carte d’urgence. 5) Souscrivez l’abonnement pour activer la protection complète.',
        },
        {
          question: 'Puis-je gérer plusieurs animaux ?',
          answer:
            'Oui, sans limite de nombre avec l’abonnement. Chaque animal a sa fiche, son QR et ses documents.',
        },
        {
          question: 'Y a-t-il une application mobile ?',
          answer:
            'Oui, une application Android SécurPats est disponible (tests / Play Store selon votre accès). Le site fonctionne aussi sur mobile. La session est conçue pour rester connectée.',
        },
      ],
    },
    {
      id: 'gestion-abo',
      sticker: '/faq/refresh-v2.png',
      title: 'Gérer ou changer d’abonnement',
      intro:
        'Vous restez maître du contrat : pause, changement d’offre, résiliation — depuis votre espace.',
      items: [
        {
          question: 'Comment résilier ?',
          answer:
            'Depuis Mon espace → Abonnement, via le portail Stripe. La résiliation prend effet à la fin de la période déjà payée. Aucun engagement caché.',
        },
        {
          question: 'Puis-je passer du mensuel à l’annuel ?',
          answer:
            'Oui, depuis la page Abonnement / Tarifs. Le changement se fait via Stripe ; conservez vos données et vos fiches.',
        },
        {
          question: 'Que se passe-t-il si le paiement échoue ?',
          answer:
            'Stripe retente le paiement. En cas d’échec prolongé, l’accès premium peut être suspendu jusqu’à régularisation. Vos données ne sont pas effacées immédiatement : contactez-nous si besoin.',
        },
      ],
    },
    {
      id: 'aide',
      sticker: '/faq/support-v2.png',
      title: 'Aide & contact',
      intro:
        'Une question technique ou humaine ? L’équipe SécurPats est là — fondée par Johanna Hayer, passionnée et professionnelle du soin.',
      items: [
        {
          question: 'Comment vous contacter ?',
          answer:
            'Via la page Contact du site, ou l’email indiqué dans Mentions légales / Contact. Nous répondons en général sous 24 h ouvrées.',
        },
        {
          question: 'Puis-je écrire depuis mon espace connecté ?',
          answer:
            'Oui, les propriétaires et pet-sitters disposent d’une messagerie support dans l’application / l’espace connecté pour un suivi plus direct.',
        },
        {
          question: 'Où trouver les guides d’urgence détaillés ?',
          answer:
            'Dans le pied de page et les pages « guides urgence » (hospitalisation, accident, etc.). La FAQ complète ces guides avec une vue pratique abonnement + bien-être.',
        },
      ],
    },
    {
      id: 'demarrer',
      sticker: '/faq/celebrate-v2.png',
      title: 'Démarrer avec SécurPats',
      intro:
        'Quelques minutes suffisent pour poser les bases. Ensuite, vous avancerez fiche par fiche — en paix.',
      items: [
        {
          question: 'Combien de temps pour être opérationnel ?',
          answer:
            'Comptez 10 à 20 minutes pour le premier animal et un premier référent. Les documents et détails se complètent au fil du temps.',
        },
        {
          question: 'Puis-je tester avant de payer ?',
          answer:
            'Vous pouvez créer un compte et commencer à renseigner vos animaux. L’abonnement active ensuite QR, alertes et protection complète. Consultez la page Tarifs pour les offres en cours.',
        },
        {
          question: 'Que faire juste après s’être abonné ?',
          answer:
            'Vérifiez vos fiches, imprimez la carte d’urgence, parlez-en à vos référents, et placez le QR sur le collier. Puis respirez : le plus dur — anticiper — est fait.',
        },
      ],
    },
  ],
}

const en: FaqPageCopy = {
  title: 'SécurPats FAQ',
  subtitle:
    'Animal welfare, emergencies, subscription: clear answers to protect your pets — and why SécurPats exists.',
  themesNav: 'Topics',
  ctaTitle: 'Ready to protect your pets?',
  ctaBody:
    'A SécurPats subscription means continuity of care when life flips: profiles, contacts, QR Code and alerts — for under €5 a month.',
  ctaButton: 'See pricing',
  themes: [
  {
    id: 'quest-ce-que',
    sticker: '/faq/questions-v2.png',
    title: 'What is SécurPats?',
    intro:
      'SécurPats is the French platform that prepares care for your pets if you are hospitalised, injured or unavailable.',
    items: [
      {
        question: 'What does SécurPats actually do?',
        answer:
          'It centralises vital info for each pet (food, treatments, allergies, vet, instructions) and connects your trusted people. In an emergency, a QR Code or alert enables immediate care — without panic.',
      },
      {
        question: 'Who is it for?',
        answer:
          'Owners (dogs, cats and other companions), family/friend contacts, and pet-sitters / caregivers who step in. Goal: no pet left alone when the unexpected hits.',
      },
      {
        question: 'How is it different from a paper health booklet?',
        answer:
          'A booklet stays at home. SécurPats is reachable via QR Code, with automatic alerts and a pet-sitter network. It is an operational emergency setup, not just a file.',
      },
    ],
  },
  {
    id: 'bien-etre',
    sticker: '/faq/joy-v2.png',
    title: 'Everyday animal welfare',
    intro:
      'Welfare means continuity: meals, care, routine, and humans who know what to do — especially when you cannot be there.',
    items: [
      {
        question: 'How does SécurPats improve my pet’s welfare?',
        answer:
          'By preventing care gaps. Hospitalisation or accidents often leave pets without clear instructions. With SécurPats, the person stepping in knows meals, meds, fears and habits — lowering stress.',
      },
      {
        question: 'What welfare details can I store?',
        answer:
          'Species, breed, age, photo, diet, allergies, treatments, behaviour, walk habits, vet contacts, documents and advance directives: who should care for them, and in which order.',
      },
      {
        question: 'Is it useful if I never had an emergency?',
        answer:
          'Yes. Preparing today avoids chaos tomorrow. Many owners discover too late that nobody has keys, the vet number or the dosage. SécurPats turns anticipation into everyday peace of mind.',
      },
    ],
  },
  {
    id: 'abonnement',
    sticker: '/faq/cool-v2.png',
    title: 'Why subscribe?',
    intro:
      'The subscription unlocks full protection: unlimited pets, contacts, QR Code, documents and alerts.',
    items: [
      {
        question: 'Why subscribe instead of staying free?',
        answer:
          'Subscription unlocks the real emergency setup: rescue QR, contact alerts, documents and continuity — €4.99/month or €49.99/year via Stripe.',
      },
      {
        question: 'What is included for owners?',
        answer:
          'Unlimited pets, up to 5 priority contacts, QR & emergency card, document storage, alerts, rescue profile access and support. Cancel anytime from your space.',
      },
      {
        question: 'Is the yearly plan worth it?',
        answer:
          'Yes if you stay a year: €49.99/year is cheaper than 12 × €4.99. Same features, auto-renewal you can stop anytime.',
      },
      {
        question: 'What about pet-sitters?',
        answer:
          'Verified pet-sitters can take the VIP plan (€9.90/month) for missions, visibility and emergency support in their area.',
      },
    ],
  },
  {
    id: 'urgence',
    sticker: '/faq/surprise-v2.png',
    title: 'Emergencies & the unexpected',
    intro: 'Hospitalisation, accident, interrupted travel: life flips fast. SécurPats is built for those seconds.',
    items: [
      {
        question: 'What happens when I trigger an emergency?',
        answer:
          'Your contacts are notified by priority. If needed, an available pet-sitter in your area can be asked to step in for food, walks and treatments.',
      },
      {
        question: 'What if my contacts do not answer?',
        answer:
          'The SécurPats network (pet-sitters / caregivers when available) can take over — so a pet is not left days without care.',
      },
      {
        question: 'Which scenarios are covered?',
        answer:
          'Hospitalisation, accident, fall, psychiatric emergency, incarceration, death, interrupted travel, or any case where you cannot care for your pets. Site guides detail each case.',
      },
    ],
  },
  {
    id: 'qr-code',
    sticker: '/faq/search-v2.png',
    title: 'QR Code & rescue profile',
    intro: 'The QR Code is the fast door to essentials: what someone needs to care for the pet now.',
    items: [
      {
        question: 'How does the QR Code work?',
        answer:
          'Each pet has a unique QR Code. Scanning it shows the rescue profile: treatments, allergies, contacts, vet. Private documents stay in your account.',
      },
      {
        question: 'Where should I put the QR Code?',
        answer:
          'On the collar, in a wallet, on a printed emergency card, or at home near the pet’s things. Visibility = faster care.',
      },
      {
        question: 'Does the QR expose all my private data?',
        answer:
          'No. Only essential rescue info is visible. Full identity, detailed medical docs and account data stay behind login.',
      },
    ],
  },
  {
    id: 'routines',
    sticker: '/faq/sleep-v2.png',
    title: 'Routines, care & peace of mind',
    intro: 'A stressed pet often means a lost human. Clear instructions = calmer nights for everyone.',
    items: [
      {
        question: 'Can I record meal and walk schedules?',
        answer:
          'Yes. The more precise your notes (times, amounts, food brand, walks, meds), the closer the substitute stays to the pet’s routine.',
      },
      {
        question: 'What about long-term treatment?',
        answer:
          'Store dosage, schedule, medicine name and vet contact. Add the prescription in documents so nobody improvises a dose.',
      },
      {
        question: 'Does SécurPats replace a vet?',
        answer:
          'No. We organise information and human relay. Medical decisions stay with the veterinarian.',
      },
    ],
  },
  {
    id: 'securite',
    sticker: '/faq/shield-v2.png',
    title: 'Security & trust',
    intro: 'Your data covers your pets and family. We treat it like an emergency service should.',
    items: [
      {
        question: 'Is my data protected (GDPR)?',
        answer:
          'Yes. Hosted in Europe, encrypted, controlled access, GDPR compliant. Export, edit or delete anytime. No ad resale of pet profiles.',
      },
      {
        question: 'Who verifies pet-sitters?',
        answer:
          'Pet-sitters go through identity checks before missions. Admin validates files to strengthen network trust.',
      },
      {
        question: 'Is payment trustworthy?',
        answer:
          'Payments run through Stripe. SécurPats does not store card numbers. Invoices/receipts are available after subscribe.',
      },
    ],
  },
  {
    id: 'famille',
    sticker: '/faq/love-v2.png',
    title: 'Family, contacts & bond',
    intro: 'Protecting a pet also reassures the people who love you: everyone knows what to do.',
    items: [
      {
        question: 'How many emergency contacts can I add?',
        answer: 'Up to 5 trusted contacts with a priority order. Emergency flow tries #1 first, then the next.',
      },
      {
        question: 'Does a contact need a SécurPats account?',
        answer:
          'Not necessarily to be alerted and open the rescue profile via link/QR. Advanced caregiver tools may need a dedicated signup.',
      },
      {
        question: 'Can I prepare advance directives?',
        answer:
          'Yes. Formalise who cares for the pet, placement wishes and sensitive instructions — so loved ones are not alone with those choices.',
      },
    ],
  },
  {
    id: 'fonctionnalites',
    sticker: '/faq/gears-v2.png',
    title: 'Account features',
    intro: 'Built to be simple: add a pet, a document, a contact, then generate the QR.',
    items: [
      {
        question: 'Where do I start after signup?',
        answer:
          '1) Complete your profile. 2) Add pets. 3) Add contacts. 4) Generate QR / emergency card. 5) Subscribe to unlock full protection.',
      },
      {
        question: 'Can I manage several pets?',
        answer: 'Yes — unlimited with the subscription. Each pet has its profile, QR and documents.',
      },
      {
        question: 'Is there a mobile app?',
        answer:
          'Yes, an Android SécurPats app is available (Play / testing depending on access). The site also works on mobile with persistent login.',
      },
    ],
  },
  {
    id: 'gestion-abo',
    sticker: '/faq/refresh-v2.png',
    title: 'Manage your subscription',
    intro: 'You stay in control: change plan or cancel from your space.',
    items: [
      {
        question: 'How do I cancel?',
        answer:
          'From My space → Subscription via the Stripe portal. Access continues until the end of the paid period. No hidden lock-in.',
      },
      {
        question: 'Can I switch monthly to yearly?',
        answer: 'Yes from Subscription / Pricing via Stripe. Your pets and data stay.',
      },
      {
        question: 'What if payment fails?',
        answer:
          'Stripe retries. After prolonged failure, premium access may pause until payment is fixed. Data is not wiped immediately — contact us if needed.',
      },
    ],
  },
  {
    id: 'aide',
    sticker: '/faq/support-v2.png',
    title: 'Help & contact',
    intro: 'Technical or human question? The SécurPats team is here — founded by Johanna Hayer.',
    items: [
      {
        question: 'How can I contact you?',
        answer: 'Via the Contact page or the email in Legal notice / Contact. We usually reply within 24 business hours.',
      },
      {
        question: 'Can I write from my logged-in space?',
        answer: 'Yes — owners and pet-sitters have in-app support messaging for closer follow-up.',
      },
      {
        question: 'Where are detailed emergency guides?',
        answer: 'In the footer and emergency guide pages (hospitalisation, accident, etc.). This FAQ complements them with subscription & welfare answers.',
      },
    ],
  },
  {
    id: 'demarrer',
    sticker: '/faq/celebrate-v2.png',
    title: 'Get started with SécurPats',
    intro: 'A few minutes are enough to lay the foundations. Then complete profiles at your pace.',
    items: [
      {
        question: 'How long to become operational?',
        answer: 'About 10–20 minutes for the first pet and first contact. Documents can be added later.',
      },
      {
        question: 'Can I try before paying?',
        answer:
          'You can create an account and start adding pets. Subscription then unlocks QR, alerts and full protection. See Pricing for current offers.',
      },
      {
        question: 'What should I do right after subscribing?',
        answer:
          'Check profiles, print the emergency card, tell your contacts, put the QR on the collar — then breathe: the hard part (anticipating) is done.',
      },
    ],
  },
  ],
}

export function getFaqCopy(locale: 'fr' | 'en'): FaqPageCopy {
  return locale === 'en' ? en : fr
}

export function allFaqFlat(locale: 'fr' | 'en'): FaqItem[] {
  return getFaqCopy(locale).themes.flatMap(t => t.items)
}
