import Logo from "../components/Logo";

export default function About() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={48} />
        <p className="eyebrow mt-6">À propos</p>
        <h1 className="mt-2 text-3xl font-bold text-mist-100">Talentis D</h1>
      </div>

      <div className="card space-y-5 p-8 text-mist-300">
        <p>
          Talentis D est une entreprise spécialisée dans le recrutement et la mise
          en relation de talents avec des entreprises à la recherche de ressources
          humaines fiables, compétentes et adaptées à leurs besoins.
        </p>
        <p>
          Notre expertise se concentre principalement dans les secteurs manufacturier
          et industriel, notamment les usines, la production, la manutention, la
          préparation de commandes et les emplois généraux. Nous travaillons avec des
          entreprises ayant des besoins de main-d'œuvre variés et nous nous engageons
          à leur proposer des candidats correspondant le mieux possible aux exigences
          de chaque poste.
        </p>
        <p>
          Chez Talentis D, nous considérons que chaque recrutement représente un enjeu
          important pour une entreprise. C'est pourquoi nous adoptons une approche
          rigoureuse, professionnelle et axée sur la qualité. Nous prenons le temps de
          comprendre les besoins de nos entreprises partenaires, les caractéristiques
          des postes à combler ainsi que les compétences et qualités recherchées chez
          les candidats.
        </p>
        <p>
          Notre processus de recrutement s'effectue dans le respect des normes, des
          lois et des bonnes pratiques en matière de ressources humaines. Afin de
          déceler les candidats les plus appropriés, nous utilisons des méthodes et
          techniques de recrutement légales, pertinentes et essentielles, permettant
          notamment d'évaluer l'expérience, les compétences, la disponibilité, la
          motivation et l'adéquation du candidat avec les exigences du poste.
        </p>
        <p>
          Notre objectif n'est pas simplement de présenter un grand nombre de
          candidats, mais de mettre en avant des profils soigneusement sélectionnés et
          susceptibles de répondre réellement aux attentes de nos entreprises
          partenaires. Nous croyons qu'un recrutement réussi repose sur une bonne
          compréhension des besoins, une sélection attentive et un accompagnement
          professionnel tout au long du processus.
        </p>
        <p>
          Talentis D se distingue par son approche humaine, sa rigueur et son
          engagement envers ses partenaires. Nous travaillons chaque mandat avec
          sérieux afin de favoriser des placements efficaces, durables et satisfaisants
          pour les entreprises comme pour les travailleurs.
        </p>
        <p className="font-medium text-mist-100">
          Notre engagement est simple : mettre notre expertise au service de nos
          entreprises partenaires afin de leur permettre de trouver les talents dont
          elles ont besoin et de contribuer concrètement à leur réussite.
        </p>
      </div>
    </section>
  );
}