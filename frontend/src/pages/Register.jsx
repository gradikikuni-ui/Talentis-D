import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleToggle from "../components/RoleToggle";
import Logo from "../components/Logo";

const EMPTY_WORKER = { email: "", password: "", full_name: "", title: "", location: "", skills: "" };

export default function Register() {
  const { registerWorker } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("worker");
  const [worker, setWorker] = useState(EMPTY_WORKER);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerWorker(worker);
      navigate("/travailleur");
    } catch (err) {
      setError(err.response?.data?.detail || "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center"><Logo size={44} /></div>
      <h1 className="text-center text-2xl font-bold text-mist-100">Créer un compte</h1>
      <p className="mt-2 text-center text-sm text-mist-400">
        Choisissez votre profil pour continuer
      </p>

      <div className="mt-6 flex justify-center">
        <RoleToggle value={role} onChange={setRole} />
      </div>

      {role === "employer" ? (
        <div className="card mt-8 flex flex-col items-center gap-4 text-center">
          <p className="text-mist-300">
            Les entreprises ne créent pas de compte pour publier une offre —
            remplissez notre formulaire et notre équipe s'occupe du reste.
          </p>
          <Link to="/entreprises/contact" className="btn-primary">
            Accéder au formulaire employeur
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card mt-8 flex flex-col gap-4">
          {error && <p className="rounded-lg bg-signal-coral/10 px-3 py-2 text-sm text-signal-coral">{error}</p>}

          <Field label="Email" type="email" value={worker.email} onChange={(v) => setWorker({ ...worker, email: v })} required placeholder="Email"/>
          <Field label="Mot de passe" type="password" value={worker.password} onChange={(v) => setWorker({ ...worker, password: v })} required placeholder="******"/>
          <Field label="Nom complet" value={worker.full_name} onChange={(v) => setWorker({ ...worker, full_name: v })} required placeholder="Nom complet"/>
          <Field label="Poste recherché" value={worker.title} onChange={(v) => setWorker({ ...worker, title: v })} placeholder="Poste recherché" />
          <Field label="Localisation" value={worker.location} onChange={(v) => setWorker({ ...worker, location: v })} placeholder="Localisation" />
          <Field label="Compétences" value={worker.skills} onChange={(v) => setWorker({ ...worker, skills: v })} placeholder="Compétences" />

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>
      )}

      {role === "worker" && (
        <p className="mt-6 text-center text-sm text-mist-400">
          Déjà un compte ? <Link to="/connexion" className="font-medium text-cyan-400">Se connecter</Link>
        </p>
      )}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-mist-300">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </label>
  );
}