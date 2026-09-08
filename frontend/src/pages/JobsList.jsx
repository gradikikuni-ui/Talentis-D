import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import { CONTRACT_TYPES } from "../constants";
import client from "../api/clients";

export default function JobsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    contract_type: searchParams.get("contract_type") || "",
    remote: searchParams.get("remote") || "",
  });

  async function fetchJobs(f) {
    setLoading(true);
    try {
      const params = {};
      if (f.q) params.q = f.q;
      if (f.location) params.location = f.location;
      if (f.contract_type) params.contract_type = f.contract_type;
      if (f.remote) params.remote = f.remote === "true";
      const { data } = await client.get("/jobs", { params });
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    setSearchParams(params);
    fetchJobs(filters);
  }

  return (
    <div className="min-h-screen">
      

      <section className="px-6 pb-8 pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="eyebrow mb-3">Offres d'emploi</div>
          <h1 className="mb-8 text-3xl font-bold md:text-4xl">
            {loading ? "Recherche…" : `${jobs.length} offre${jobs.length > 1 ? "s" : ""} disponible${jobs.length > 1 ? "s" : ""}`}
          </h1>

          <form onSubmit={applyFilters} className="card flex flex-col gap-3 p-4 md:flex-row">
            <input
              className="input-field md:flex-1"
              placeholder="Métier, mot-clé…"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
            <input
              className="input-field md:w-48"
              placeholder="Ville"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            />
            <select
              className="input-field md:w-56"
              value={filters.contract_type}
              onChange={(e) => setFilters((f) => ({ ...f, contract_type: e.target.value }))}
            >
              <option value="" className="bg-ink-900">Tout type de contrat</option>
              {CONTRACT_TYPES.map((c) => (
                <option key={c.value} value={c.value} className="bg-ink-900">
                  {c.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary shrink-0">
              Filtrer
            </button>
          </form>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-48 animate-pulse bg-white/[0.03]" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="card p-12 text-center text-mist-300">
              Aucune offre ne correspond à votre recherche pour le moment.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

     
    </div>
  );
}