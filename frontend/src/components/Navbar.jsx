import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import ThemeToggle from "../components/ThemeToogle";

export default function Navbar() {
  const { isAuthenticated, session, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async () => {
    try {
      await switchRole();
    } catch {
      navigate("/");
    }
  };

  const spaceLink = session?.activeRole === "admin"
    ? "/admin"
    : session?.activeRole === "employer"
    ? "/entreprise"
    : "/travailleur";

  return (
    <header className="sticky top-0 z-40 border-b border-line/5 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/"><Logo /></Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-mist-400 md:flex">
          <NavLink to="/offres" className={({isActive}) => isActive ? "text-mist-100" : "hover:text-mist-100"}>
            Offres
          </NavLink>
          {isAuthenticated && (
            <NavLink to={spaceLink} className={({isActive}) => isActive ? "text-mist-100" : "hover:text-mist-100"}>
              {session?.activeRole === "admin" ? "Administration" : "Mon espace"}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {session?.activeRole === "worker" && (
                <button
                  onClick={handleSwitch}
                  className="hidden items-center gap-2 rounded-full border border-line/10 px-4 py-2 font-mono text-xs uppercase tracking-wide text-mist-400 hover:border-cyan-400/40 sm:flex"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Basculer
                </button>
              )}
              <button onClick={logout} className="btn-secondary !px-4 !py-2 text-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/entreprises/contact" className="hidden font-medium text-mist-400 hover:text-mist-100 sm:inline">
                Vous recrutez ?
              </Link>
              <Link to="/connexion" className="font-medium text-mist-400 hover:text-mist-100">
                Connexion
              </Link>
              <Link to="/inscription" className="btn-primary !px-5 !py-2.5 text-sm">
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}