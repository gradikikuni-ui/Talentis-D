import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ContractBadge from "../components/ContractBadge";
import Button from "../components/Button";

export default function JobDetail() {
  const { jobId } = useParams();
  const { isAuthenticated, session } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${jobId}`)
      .then(({ data }) => setJob(data))
      .catch(() => setJob(false))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p className="py-32 text-center text-navy-900/40">Chargement…</p>;
  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Offre introuvable</h1>
        <Link to="/offres" className="btn-ghost mt-6 inline-flex">Retour aux offres</Link>
      </div>
    );
  }

  const canApply = isAuthenticated && session?.activeRole === "worker" && session?.hasWorkerProfile;
  const skills = job.skills_required?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <Link to="/offres" className="mb-6 inline-flex items-center gap-2 text-sm text-navy-900/50 hover:text-navy-900">
        ← Retour aux offres
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <ContractBadge type={job.contract_type} />
            {job.remote && (
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy-900/70">Télétravail</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-navy-900 md:text-4xl">{job.title}</h1>
          <p className="mt-2 text-navy-900/60">
            {job.company_name} · {job.location}{job.duration && ` · ${job.duration}`}
          </p>

          <div className="card mt-8">
            <h2 className="font-display text-lg font-semibold text-navy-900">Description du poste</h2>
            <p className="mt-3 whitespace-pre-line text-navy-900/70">{job.description}</p>

            {skills.length > 0 && (
              <>
                <h2 className="mt-8 font-display text-lg font-semibold text-navy-900">Compétences recherchées</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy-900/70">{s}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h3 className="font-display font-semibold text-navy-900">Détails</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Entreprise" value={job.company_name} />
              <Row label="Secteur" value={job.company_sector || "—"} />
              <Row label="Lieu" value={job.location} />
              {(job.salary_min || job.salary_max) && (
                <Row label="Rémunération" value={
                  job.salary_min && job.salary_max
                    ? `${job.salary_min} – ${job.salary_max} €`
                    : `${job.salary_min || job.salary_max} €`
                } />
              )}
            </dl>
          </div>

          <ApplyCard job={job} isAuthenticated={isAuthenticated} canApply={canApply} />
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-navy-900/5 pb-3">
      <dt className="text-navy-900/50">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{value}</dd>
    </div>
  );
}

function ApplyCard({ job, isAuthenticated, canApply }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [answers, setAnswers] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [state, setState] = useState("idle"); // idle | uploading | sending | done | error
  const [error, setError] = useState("");

  const updateAnswer = (id, value) => setAnswers((a) => ({ ...a, [id]: value }));

  const uploadIfPresent = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/uploads/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");

    const missing = (job.questions || []).find((q) => q.is_required && !answers[q.id]?.trim());
    if (missing) {
      setError(`Merci de répondre à la question obligatoire : « ${missing.question_text} »`);
      return;
    }

    setState("uploading");
    try {
      const [cvUrl, coverLetterFileUrl] = await Promise.all([
        uploadIfPresent(cvFile),
        uploadIfPresent(coverLetterFile),
      ]);

      setState("sending");
      await api.post(`/jobs/${job.id}/apply`, {
        cover_letter: coverLetter || null,
        cv_url: cvUrl,
        cover_letter_file_url: coverLetterFileUrl,
        answers: Object.entries(answers)
          .filter(([, text]) => text?.trim())
          .map(([question_id, answer_text]) => ({ question_id, answer_text })),
      });
      setState("done");
    } catch (err) {
      setState("error");
      setError(err.response?.data?.detail || "La candidature n'a pas pu être envoyée.");
    }
  };

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-navy-900">Postuler</h3>

      {!isAuthenticated ? (
        <>
          <p className="mt-3 text-sm text-navy-900/60">Connectez-vous en tant que travailleur pour postuler.</p>
          <Link to="/connexion" className="btn-signal mt-4 w-full">Se connecter</Link>
        </>
      ) : !canApply ? (
        <p className="mt-3 text-sm text-navy-900/60">
          Basculez en mode Travailleur pour postuler à cette offre.
        </p>
      ) : state === "done" ? (
        <p className="mt-3 text-sm text-emerald-600">
          Votre candidature a été envoyée. Suivez son statut dans « Mes candidatures ».
        </p>
      ) : (
        <form onSubmit={handleApply} className="mt-4 space-y-4">
          {(job.questions || []).map((q) => (
            <div key={q.id}>
              <label className="mb-1.5 block text-xs font-medium text-navy-900/70">
                {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
              </label>
              <textarea
                required={q.is_required}
                className="min-h-[70px] w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm outline-none focus:border-azure-500"
                value={answers[q.id] || ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
              />
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-navy-900/70">Mot de motivation (optionnel)</label>
            <textarea
              className="min-h-[80px] w-full rounded-lg border border-navy-900/10 px-3 py-2 text-sm outline-none focus:border-azure-500"
              placeholder="Quelques lignes sur votre motivation…"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <FileField label="CV (PDF, DOC, DOCX — 5 Mo max)" file={cvFile} onChange={setCvFile} />
          <FileField label="Lettre de motivation en fichier (optionnel)" file={coverLetterFile} onChange={setCoverLetterFile} />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <Button type="submit" disabled={state === "uploading" || state === "sending"} className="w-full">
            {state === "uploading" ? "Envoi des fichiers…" : state === "sending" ? "Envoi…" : "Envoyer ma candidature"}
          </Button>
        </form>
      )}
    </div>
  );
}

function FileField({ label, file, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-navy-900/70">{label}</label>
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-navy-900/15 bg-mist px-4 py-3 text-sm text-navy-900/60 hover:border-azure-500/40">
        <span className="truncate">{file ? file.name : "Choisir un fichier…"}</span>
        <span className="shrink-0 font-medium text-azure-500">Parcourir</span>
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}