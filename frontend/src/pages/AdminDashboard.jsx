import { useEffect, useState } from "react";
import api from "../lib/api";
import Button from "../components/Button";

const CONTRACT_OPTIONS = ["mission_courte", "interim", "cdd", "cdi", "freelance", "stage", "alternance"];
const EMPTY_JOB = {
  company_name: "", company_sector: "", title: "", description: "",
  contract_type: "cdi", location: "", remote: false, duration: "",
  contact_request_id: null, questions: [],
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("contacts"); // contacts | jobs
  const [contacts, setContacts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(EMPTY_JOB);
  const [showForm, setShowForm] = useState(false);

  const loadContacts = () => api.get("/employer-contact").then(({ data }) => setContacts(data));
  const loadJobs = () => api.get("/jobs").then(({ data }) => setJobs(data));

  useEffect(() => { loadContacts(); loadJobs(); }, []);

  const markStatus = async (id, status) => {
    await api.put(`/employer-contact/${id}/status`, { status });
    loadContacts();
  };

  const useContactAsJobBase = (c) => {
    setForm({
      ...EMPTY_JOB,
      company_name: c.company_name,
      company_sector: c.sector || "",
      description: c.message,
      contact_request_id: c.id,
    });
    setTab("jobs");
    setShowForm(true);
  };

  const addQuestion = () => setForm((f) => ({
    ...f, questions: [...f.questions, { question_text: "", is_required: true, order: f.questions.length }],
  }));

  const updateQuestion = (i, field, value) => setForm((f) => ({
    ...f, questions: f.questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q),
  }));

  const removeQuestion = (i) => setForm((f) => ({
    ...f, questions: f.questions.filter((_, idx) => idx !== i),
  }));

  const handleCreateJob = async (e) => {
    e.preventDefault();
    await api.post("/jobs", form);
    setForm(EMPTY_JOB);
    setShowForm(false);
    loadJobs();
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-navy-900">Espace administrateur</h1>

      <div className="mt-6 flex gap-2 border-b border-navy-900/10">
        {["contacts", "jobs"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-azure-500 text-navy-900" : "text-navy-900/50"}`}
          >
            {t === "contacts" ? "Demandes employeurs" : "Offres publiées"}
          </button>
        ))}
      </div>

      {tab === "contacts" && (
        <div className="mt-6 flex flex-col gap-3">
          {contacts.length === 0 && <p className="text-navy-900/40">Aucune demande pour le moment.</p>}
          {contacts.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-navy-900">{c.company_name} — {c.contact_name}</p>
                  <p className="text-sm text-navy-900/50">{c.email} {c.phone && `· ${c.phone}`} {c.sector && `· ${c.sector}`}</p>
                </div>
                <span className="shrink-0 rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy-900/70">{c.status}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-navy-900/70">{c.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="!px-3 !py-1.5 text-xs" onClick={() => useContactAsJobBase(c)}>Créer une offre à partir de ça</Button>
                <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => markStatus(c.id, "traite")}>Marquer traité</Button>
                <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => markStatus(c.id, "archive")}>Archiver</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "jobs" && (
        <div className="mt-6">
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Annuler" : "+ Nouvelle offre"}</Button>

          {showForm && (
            <form onSubmit={handleCreateJob} className="card mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Nom de l'entreprise" value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500" />
              <input placeholder="Secteur" value={form.company_sector}
                onChange={(e) => setForm({ ...form, company_sector: e.target.value })}
                className="rounded-lg border border-navy-900/10 px-4 py-2.5 outline-none focus:border-azure-500" />
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

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-navy-900/80">Questions de présélection</p>
                  <button type="button" onClick={addQuestion} className="text-xs font-medium text-azure-500">+ Ajouter</button>
                </div>
                {form.questions.map((q, i) => (
                  <div key={i} className="mt-2 flex items-center gap-2">
                    <input
                      placeholder="Intitulé de la question"
                      value={q.question_text}
                      onChange={(e) => updateQuestion(i, "question_text", e.target.value)}
                      className="flex-1 rounded-lg border border-navy-900/10 px-3 py-2 text-sm outline-none focus:border-azure-500"
                    />
                    <label className="flex items-center gap-1 text-xs text-navy-900/60">
                      <input type="checkbox" checked={q.is_required} onChange={(e) => updateQuestion(i, "is_required", e.target.checked)} />
                      Obligatoire
                    </label>
                    <button type="button" onClick={() => removeQuestion(i)} className="text-xs text-red-500">Retirer</button>
                  </div>
                ))}
              </div>

              <Button type="submit" className="sm:col-span-2">Publier l'offre</Button>
            </form>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <div key={job.id} className="card">
                <p className="font-semibold text-navy-900">{job.title}</p>
                <p className="mt-1 text-sm text-navy-900/50">{job.company_name} · {job.location} · {job.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}