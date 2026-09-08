import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(form.email, form.password);
      if (data.active_role === "worker") navigate("/travailleur");
      else if (data.active_role === "employer") navigate("/entreprise");
      else navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.detail || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <section className="flex min-h-[85vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo withText={false} size={56} />
            <h1 className="mt-6 text-2xl font-bold">Content de vous revoir</h1>
            <p className="mt-2 text-sm text-mist-500">Connectez-vous à votre compte Talentis D.</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5 p-8">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Mot de passe</label>
              <input
                type="password"
                required
                className="input-field"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-signal-coral">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mist-500">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-cyan-400 hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}