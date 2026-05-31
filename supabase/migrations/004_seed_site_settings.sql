-- Initialiser le contenu site (optionnel — ou via Admin > Contenu du site)
UPDATE site_settings
SET settings = '{
  "siteName": "SécurPats",
  "logoUrl": "/logo-securpats-icon.png",
  "contact": {
    "email": "contact@securpats.fr",
    "phone": "",
    "addressLine1": "",
    "addressLine2": "",
    "city": "",
    "postalCode": "",
    "country": "France"
  },
  "legal": {
    "companyName": "SécurPats",
    "legalForm": "",
    "siret": "",
    "rcs": "",
    "vatNumber": "",
    "capital": "",
    "directorName": "",
    "dpoEmail": "dpo@securpats.fr",
    "hostName": "Vercel Inc.",
    "hostAddress": "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    "dataHostName": "Supabase (AWS)",
    "dataHostRegion": "Union européenne",
    "mediatorName": "",
    "mediatorUrl": "https://www.economie.gouv.fr/mediation-conso"
  },
  "home": {
    "badge": "Protection animale d''urgence",
    "title": "Vos animaux",
    "titleHighlight": "toujours protégés",
    "subtitle": "Préparez à l''avance toutes les informations nécessaires pour la prise en charge de vos compagnons en cas d''urgence.",
    "heroImage": "",
    "heroImageAlt": "Votre compagnon",
    "ctaTitle": "Protégez vos compagnons dès aujourd''hui",
    "ctaSubtitle": "Abonnement à partir de 5,99 €/mois — renouvellement automatique."
  },
  "footer": {
    "description": "La plateforme qui garantit qu''aucun animal ne soit laissé sans prise en charge en cas d''urgence."
  },
  "testimonials": []
}'::jsonb,
updated_at = NOW()
WHERE id = 'global';
