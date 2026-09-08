import { useState } from "react";
import { Link } from "react-router-dom";
import RoleToggle from "../components/RoleToggle";

const CONTENT = {
  worker: {
    eyebrow: "Pour les talents",
    title: "Votre prochaine mission commence ici.",
    subtitle:
      "D'une journée de renfort à un Temps plein, trouvez des offres qui correspondent vraiment à votre rythme et vos compétences.",
    cta: "Trouver une offre",
    ctaLink: "/offres",
    stat: ["Plusieurs", "offres actives"],
  },
  employer: {
    eyebrow: "Pour les entreprises",
    title: "Le bon profil, au bon moment.",
    subtitle:
      "Décrivez votre besoin — mission courte, intérim ou poste durable — et notre équipe publie l'offre pour vous.",
    cta: "Publier une offre",
    ctaLink: "/entreprises/contact",
    stat: ["6 min", "temps moyen de réponse"],
  },
};

const CONTRACTS = ["Mission courte", "Temps partiel", "Temps plein", "Freelance", "Stage"];

export default function Landing() {
  const [role, setRole] = useState("worker");
  const c = CONTENT[role];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-gradient">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
          <div className="flex justify-center">
            <RoleToggle value={role} onChange={setRole} />
          </div>

          <p key={c.eyebrow} className="eyebrow mt-10 animate-fadeUp">{c.eyebrow}</p>
          <h1 key={c.title} className="mx-auto mt-3 max-w-2xl text-4xl font-bold leading-tight text-mist-100 animate-fadeUp sm:text-5xl">
            {c.title}
          </h1>
          <p key={c.subtitle} className="mx-auto mt-5 max-w-lg text-mist-400 animate-fadeUp">{c.subtitle}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link key={c.cta} to={c.ctaLink} className="btn-primary animate-fadeUp">{c.cta}</Link>
            <Link to="/offres" className="btn-secondary">Explorer les offres</Link>
          </div>

          <div key={c.stat[0]} className="mt-14 inline-flex items-center gap-3 rounded-full bg-line/5 px-5 py-2.5 font-mono text-sm text-mist-300 backdrop-blur">
            <span className="text-lg font-semibold text-cyan-400">{c.stat[0]}</span>
            {c.stat[1]}
          </div>
        </div>
      </section>

      {/* TYPES DE CONTRATS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="eyebrow text-center">Tous les formats, un seul endroit</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {CONTRACTS.map((type) => (
            <span
              key={type}
              className="rounded-full border border-line/10 bg-ink-800 px-4 py-2 text-sm font-medium text-mist-300"
            >
              {type}
            </span>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-ink-900 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-mist-100">Comment ça marche</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Créez votre profil",
                text: "Un formulaire pensé pour les travailleurs, en moins de deux minutes.",
              },
              {
                title: "Trouvez la bonne correspondance",
                text: "Recherchez par type de contrat, localisation ou compétences.",
              },
              {
                title: "Postulez en un clic",
                text: "CV, lettre de motivation et réponses aux questions de l'employeur, tout au même endroit.",
              },
            ].map((step, i) => (
              <div key={step.title} className="card">
                <span className="font-mono text-sm text-cyan-400">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-mist-100">{step.title}</h3>
                <p className="mt-2 text-sm text-mist-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-mist-100">Prêt à commencer ?</h2>
        <p className="mx-auto mt-3 max-w-md text-mist-400">
          Rejoignez Talentis D — gratuit, rapide, et pensé pour les deux côtés du marché.
        </p>
        <Link to="/inscription" className="btn-primary mt-8 inline-flex">
          Créer un compte
        </Link>
      </section>
    </>
  );
}