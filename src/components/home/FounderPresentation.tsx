const FOUNDER_PHOTO = '/founder-johanna-hayer.png'

const paragraphs = [
  'Passionnée par les animaux depuis mon plus jeune âge, j\'ai toujours entretenu avec eux un lien profond, bienveillant et particulier. Aujourd\'hui encore, ils occupent une place essentielle dans ma vie. Je partage mon quotidien avec des chiens, des chats, des hamsters et des poissons… et si je m\'écoutais, ce serait certainement l\'Arche de Noé !',
  'La vie m\'a conduite vers le métier d\'aide médico-psychologique, une profession tournée vers l\'accompagnement et l\'humain. Pourtant, je ne me suis jamais éloignée de ma passion pour les animaux. Depuis plusieurs années, j\'exerce également une activité de pet-sitting auprès de particuliers, ce qui m\'a permis de tisser une relation de confiance avec de nombreux propriétaires.',
  'En mai 2026, une ancienne cliente avec qui j\'avais gardé contact s\'est retrouvée hospitalisée. Son inquiétude n\'était pas seulement liée à son état de santé, mais aussi au fait que sa chienne se retrouvait sans solution de garde quotidienne. Je suis naturellement intervenue pour prendre soin de son animal, assurer son suivi et, surtout, rassurer à la fois la maîtresse et sa chienne.',
  'Cette expérience a été un véritable déclic. Je me suis demandée : pourquoi n\'existe-t-il pas un service permettant de faire le lien entre les propriétaires d\'animaux, leurs proches, les professionnels et, à terme, les services de secours et les institutions lorsqu\'un imprévu survient ?',
  'J\'étais persuadée qu\'une telle solution existait déjà. Après plusieurs recherches, j\'ai découvert qu\'aucune plateforme ne proposait une prise en charge globale de l\'animal en cas d\'hospitalisation, d\'accident, de décès ou de toute autre situation d\'urgence. C\'est ainsi qu\'est née SécurPats.',
  'Mon ambition est simple : faire en sorte qu\'aucun animal ne soit laissé seul parce que son propriétaire ne peut plus s\'occuper de lui. À travers SécurPats, je souhaite créer un véritable réseau de solidarité réunissant propriétaires, référents, professionnels du monde animal, associations et, demain, les services d\'urgence.',
  'Parce qu\'un imprévu ne devrait jamais mettre un animal en danger, l\'aventure SécurPats est aujourd\'hui lancée.',
]

export function FounderPresentation() {
  return (
    <section className="founder-presentation py-12 sm:py-16 lg:py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <p className="text-base sm:text-lg font-pacifico text-brand-600 mb-3">
            Présentation fondatrice
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-pacifico text-slate-900">
            L&apos;histoire de SécurPats
          </h2>
        </div>

        <div className="grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
          <div className="mx-auto lg:mx-0 w-full max-w-sm lg:max-w-none">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-50">
              <img
                src={FOUNDER_PHOTO}
                alt="Johanna Hayer, fondatrice de SécurPats, avec son chien sur la plage"
                className="w-full h-auto object-cover aspect-[3/4]"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-center lg:text-left">
              <span className="block font-pacifico text-slate-900 text-2xl sm:text-3xl">Johanna Hayer</span>
              <span className="block font-pacifico text-brand-700 text-lg sm:text-xl mt-1">Fondatrice et dirigeante de SécurPats</span>
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6 text-slate-700 text-lg sm:text-xl lg:text-2xl leading-relaxed font-pacifico">
            {paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
