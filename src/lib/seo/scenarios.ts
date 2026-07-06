export type EmergencyScenario = {
  title: string
  description: string
  path: string
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    title: 'Hospitalisation',
    description: 'Les référents sont prévenus pour prendre en charge l\'animal.',
    path: '/hospitalisation-animal',
  },
  {
    title: 'Accident',
    description: 'Les secours identifient que la victime possède un animal grâce à une carte ou un QR Code et contactent les référents.',
    path: '/accident-animal-urgence',
  },
  {
    title: 'Décès',
    description: 'Application du « testament animalier » avec ordre de priorité des personnes désignées.',
    path: '/deces-proprietaire-animal',
  },
  {
    title: 'Personne âgée',
    description: 'En cas de chute ou d\'hospitalisation, un proche est immédiatement alerté.',
    path: '/personne-agee-animal',
  },
  {
    title: 'Violence conjugale',
    description: 'Prise en charge rapide de l\'animal via un référent ou une association.',
    path: '/violence-conjugale-animal',
  },
  {
    title: 'Hospitalisation psychiatrique',
    description: 'Protection temporaire de l\'animal.',
    path: '/hospitalisation-psychiatrique-animal',
  },
  {
    title: 'Incarcération',
    description: 'Organisation de la garde.',
    path: '/incarceration-garde-animal',
  },
  {
    title: 'Voyage interrompu',
    description: 'Le propriétaire déclenche une alerte pour nourrir ou sortir son animal.',
    path: '/voyage-interrompu-animal',
  },
  {
    title: 'Catastrophe naturelle',
    description: 'Coordination rapide entre référents et associations.',
    path: '/catastrophe-naturelle-animal',
  },
]
