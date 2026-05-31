import {
  UserPlus, PawPrint, Users, QrCode, CreditCard, AlertTriangle, CheckCircle,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Card } from '@/components/ui/Card'

const steps = [
  {
    icon: UserPlus,
    title: 'Création du compte',
    desc: 'Inscrivez-vous en quelques clics avec votre email. Votre espace personnel sécurisé est immédiatement disponible.',
  },
  {
    icon: PawPrint,
    title: 'Ajout des animaux',
    desc: 'Créez une fiche complète pour chaque animal : photo, espèce, race, traitements, allergies, alimentation et consignes particulières.',
  },
  {
    icon: Users,
    title: 'Ajout des référents',
    desc: 'Définissez jusqu\'à 5 contacts de confiance avec un ordre de priorité. Ils seront alertés automatiquement en cas d\'urgence.',
  },
  {
    icon: QrCode,
    title: 'Génération du QR Code',
    desc: 'Chaque animal reçoit un QR Code unique. Scannez-le pour accéder instantanément à la fiche de secours essentielle.',
  },
  {
    icon: CreditCard,
    title: 'Création de la carte d\'urgence',
    desc: 'Imprimez une carte contenant la photo, le nom, le QR Code et un message d\'urgence. À garder sur le collier ou à la maison.',
  },
  {
    icon: AlertTriangle,
    title: 'Déclenchement d\'une urgence',
    desc: 'En cas d\'urgence, déclenchez l\'alerte : vos référents et un pet-sitter disponible sont notifiés immédiatement.',
  },
]

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Comment ça fonctionne</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              De la création de votre compte au déclenchement d'une urgence, découvrez le parcours complet SécurPats.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <Card key={i} hover className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      Étape {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 bg-brand-50 border-brand-100">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Résultat</h3>
                <p className="text-slate-600">
                  Vos animaux bénéficient d'une prise en charge immédiate et organisée, même lorsque vous êtes dans l'impossibilité de vous en occuper.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
