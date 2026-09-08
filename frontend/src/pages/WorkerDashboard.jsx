import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const STATUS_LABELS = {
  en_attente: ["En attente", "bg-amber-100 text-amber-700"],
  acceptee: ["Acceptée", "bg-emerald-100 text-emerald-700"],
  refusee: ["Refusée", "bg-red-100 text-red-700"],
};

export default function WorkerDashboard() {
  const { me } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/applications/mine").then(({ data }) => setApplications(data)).finally(() => setLoading(false));
  }, []);

  const profile = me?.worker_profile;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-navy-900">Bonjour {profile?.full_name?.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-navy-900/60">{profile?.title || "Complétez votre profil pour être repéré·e plus vite."}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="eyebrow">Candidatures</p>
          <p className="mt-2 text-3xl font-bold text-navy-900">{applications.length}</p>
        </div>
        <div className="card">
          <p className="eyebrow">Localisation</p>
          <p className="mt-2 text-lg font-semibold text-navy-900">{profile?.location || "—"}</p>
        </div>
        <div className="card">
          <p className="eyebrow">Disponibilité</p>
          <p className="mt-2 text-lg font-semibold text-navy-900">{profile?.availability || "—"}</p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-navy-900">Mes candidatures</h2>
      {loading ? (
        <p className="mt-4 text-navy-900/40">Chargement…</p>
      ) : applications.length === 0 ? (
        <p className="mt-4 text-navy-900/40">
          Vous n'avez pas encore postulé. <Link to="/offres" className="text-azure-500 font-medium">Voir les offres</Link>
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {applications.map((app) => {
            const [label, cls] = STATUS_LABELS[app.status] || ["", ""];
            return (
              <Link key={app.id} to={`/offres/${app.job.id}`} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy-900">{app.job.title}</p>
                  <p className="text-sm text-navy-900/50">{app.job.location}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}