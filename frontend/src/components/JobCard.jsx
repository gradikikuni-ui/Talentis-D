import { Link } from "react-router-dom";

const CONTRACT_LABELS = {
  mission_courte: "Mission courte",
  interim: "Intérim",
  cdd: "CDD",
  cdi: "CDI",
  freelance: "Freelance",
  stage: "Stage",
  alternance: "Alternance",
};

export default function JobCard({ job }) {
  return (
    <Link to={`/offres/${job.id}`} className="card group flex flex-col gap-3 transition-shadow hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{job.employer?.company_name}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-navy-900 group-hover:text-azure-500">
            {job.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-signal-gradient px-3 py-1 font-mono text-xs font-medium text-white">
          {CONTRACT_LABELS[job.contract_type] || job.contract_type}
        </span>
      </div>

      <p className="line-clamp-2 text-sm text-navy-900/60">{job.description}</p>

      <div className="mt-1 flex flex-wrap items-center gap-4 font-mono text-xs text-navy-900/50">
        <span>📍 {job.location}{job.remote ? " · Télétravail" : ""}</span>
        {(job.salary_min || job.salary_max) && (
          <span>
            💰 {job.salary_min ?? "?"}–{job.salary_max ?? "?"} €
          </span>
        )}
        {job.duration && <span>⏱ {job.duration}</span>}
      </div>
    </Link>
  );
}