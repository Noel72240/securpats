import catImg from '@/assets/animals/animal-cat.webp'
import dogImg from '@/assets/animals/animal-dog.webp'
import birdImg from '@/assets/animals/animal-bird.webp'
import rabbitImg from '@/assets/animals/animal-rabbit.webp'
import fishImg from '@/assets/animals/animal-fish.webp'
import hamsterImg from '@/assets/animals/animal-hamster.webp'
import horseImg from '@/assets/animals/animal-horse.webp'
import goatImg from '@/assets/animals/animal-goat.webp'
import chickenImg from '@/assets/animals/animal-chicken.webp'
import donkeyImg from '@/assets/animals/animal-donkey.webp'
import { useI18n } from '@/i18n/LanguageContext'

const ANIMALS = [
  { src: catImg, fr: 'Chat', en: 'Cat' },
  { src: dogImg, fr: 'Chien', en: 'Dog' },
  { src: birdImg, fr: 'Oiseau', en: 'Bird' },
  { src: rabbitImg, fr: 'Lapin', en: 'Rabbit' },
  { src: fishImg, fr: 'Poisson', en: 'Fish' },
  { src: hamsterImg, fr: 'Hamster', en: 'Hamster' },
  { src: horseImg, fr: 'Cheval', en: 'Horse' },
  { src: goatImg, fr: 'Chèvre', en: 'Goat' },
  { src: chickenImg, fr: 'Poule', en: 'Hen' },
  { src: donkeyImg, fr: 'Âne', en: 'Donkey' },
] as const

function ParadeTrack({ ariaHidden, locale }: { ariaHidden?: boolean; locale: 'fr' | 'en' }) {
  return (
    <div className="animal-parade__track" aria-hidden={ariaHidden}>
      {ANIMALS.map((animal, i) => (
        <img
          key={`${animal.fr}-${i}`}
          src={animal.src}
          alt={locale === 'en' ? animal.en : animal.fr}
          className="animal-parade__photo"
          width={88}
          height={88}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ))}
    </div>
  )
}

export function AnimalParadeFrieze() {
  const { locale } = useI18n()

  return (
    <section
      className="animal-parade relative overflow-hidden border-y border-brand-100/80"
      aria-label={locale === 'en' ? 'Animal parade' : "Frise d'animaux"}
    >
      <div className="animal-parade__bg pointer-events-none" aria-hidden />
      <div className="relative py-4 sm:py-5">
        <div className="animal-parade__viewport">
          <ParadeTrack locale={locale} />
          <ParadeTrack locale={locale} ariaHidden />
        </div>
      </div>
    </section>
  )
}
