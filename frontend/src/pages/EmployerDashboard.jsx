import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const CONTRACT_OPTIONS = ["mission_courte", "interim", "cdd", "cdi", "freelance", "stage", "alternance"];
const EMPTY_JOB = { title: "", description: "", contract_type: "cdi", location: "", remote: false, duration: "" };

export default function EmployerDashboard() {
  const { me } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(EMPTY_JOB);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadJobs = () => api.get("/jobs/mine").then(({ data }) => setJobs(data)).finally(() => setLoading(false));

  useEffect(() => { loadJobs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/jobs", form);
    setForm(EMPTY_JOB);
    setShowForm(false);
    loadJobs();
  };

  const openApplications = async (job) => {
    setSelectedJob(job);
    const { data } = await api.get(`/jobs/${job.id}/applications`);
    setApplications(data);
  };

  const updateStatus = async (appId, status) => {
    await api.put(`/applications/${appId}/status`, { status });
    openApplications(selectedJob);
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">{me?.employer_profile?.company_name}</h1>
          <p className="mt-1 text-navy-900/60">Gérez vos offres et vos candidatures</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Annuler" : "+ Nouvelle offre"}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 grid gap-4 sm:grid-cols-2">
          <input required placeholder="Titre du poste" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="sm:col-span-2 rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500" />
          <textarea required rows={4} placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-2 rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500" />
          <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
            className="rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500">
            {CONTRACT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input required placeholder="Localisation" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500" />
          <input placeholder="Durée (ex : 3 jours)" value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500" />
          <label className="flex items-center gap-2 text-sm text-navy-900/70">
            <input type="checkbox" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} />
            Télétravail possible
          </label>
          <Button type="submit" className="sm:col-span-2">Publier l'offre</Button>
        </form>
      )}

      <h2 className="mt-12 text-xl font-semibold text-navy-900">Mes offres</h2>
      {loading ? (
        <p className="mt-4 text-navy-900/40">Chargement…</p>
      ) : jobs.length === 0 ? (
        <p className="mt-4 text-navy-900/40">Aucune offre publiée pour le moment.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <button key={job.id} onClick={() => openApplications(job)} className="card text-left hover:shadow-glow">
              <p className="font-semibold text-navy-900">{job.title}</p>
              <p className="mt-1 text-sm text-navy-900/50">{job.location} · {job.status}</p>
            </button>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-navy-900">Candidatures — {selectedJob.title}</h3>
          {applications.length === 0 ? (
            <p className="mt-3 text-navy-900/40">Aucune candidature reçue.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {applications.map((app) => (
                <div key={app.id} className="card flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy-900">{app.worker.full_name}</p>
                    <p className="text-sm text-navy-900/50">{app.worker.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => updateStatus(app.id, "refusee")}>Refuser</Button>
                    <Button className="!px-3 !py-1.5 text-xs" onClick={() => updateStatus(app.id, "acceptee")}>Accepter</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}