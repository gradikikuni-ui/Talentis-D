import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <Logo dark />
            <p className="mt-3 max-w-xs text-sm text-mist-500">
              La plateforme qui relie travailleurs et employeurs, de la mission d'un jour au travail à temps plein.
            </p>
          </div>
          <div className="flex gap-16 font-mono text-sm text-mist-500">
            <div className="flex flex-col gap-2">
              <span className="eyebrow mb-1">Plateforme</span>
              <Link to="/offres" className="hover:text-mist-100">Offres</Link>
              <Link to="/inscription" className="hover:text-mist-100">Créer un compte</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="eyebrow mb-1">Entreprises</span>
              <Link to="/entreprises/contact" className="hover:text-mist-100">Publier une offre</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/5 pt-6 font-mono text-xs text-mist-500/60">
          © {new Date().getFullYear()} Talentis D
        </div>
      </div>
    </footer>
  );
}