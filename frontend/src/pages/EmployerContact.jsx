import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import client from "../api/clients";

const EMPTY_FORM = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  sector: "",
  website: "",
  message: "",
};

export default function EmployerContact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await client.post("/employer-requests", form);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.detail || "Votre demande n'a pas pu être envoyée.");
    }
  }

  return (
    <div className="min-h-screen">
     

      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo withText={false} size={56} />
            <div className="eyebrow mt-6 mb-3">Pour les employeurs</div>
            <h1 className="text-3xl font-bold md:text-4xl">Publiez votre offre sur Talentis D</h1>
            <p className="mt-3 max-w-lg text-mist-400">
              Décrivez-nous votre besoin — mission d'un jour, Temps plein, Temps partiel ou autre —
              et notre équipe vous recontacte pour publier votre offre.
            </p>
          </div>

          {status === "done" ? (
            <div className="card p-10 text-center">
              <div className="mb-3 text-3xl">✅</div>
              <h2 className="mb-2 text-xl font-bold">Demande envoyée</h2>
              <p className="text-mist-400">
                Merci ! Notre équipe va étudier votre demande et publiera votre offre
                sous peu. Vous serez contacté(e) à l'adresse indiquée.
              </p>
              <Link to="/offres" className="btn-secondary mt-6 inline-flex">
                Voir les offres publiées
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-5 p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom de l'entreprise" required>
                  <input
                    required
                    className="input-field"
                    value={form.company_name}
                    onChange={(e) => update("company_name", e.target.value)}
                    placeholder="Nom de l'entreprise"
                  />
                </Field>
                <Field label="Nom du contact">
                  <input
                    className="input-field"
                    value={form.contact_name}
                    onChange={(e) => update("contact_name", e.target.value)}
                    placeholder="Responsable recrutement"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" required>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="rh@entreprise.com"
                  />
                </Field>
                <Field label="Téléphone">
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="Téléphone"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Secteur d'activité">
                  <input
                    className="input-field"
                    value={form.sector}
                    onChange={(e) => update("sector", e.target.value)}
                    placeholder="Restauration, BTP, tech…"
                  />
                </Field>
                <Field label="Site web">
                  <input
                    className="input-field"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://"
                  />
                </Field>
              </div>

              <Field label="Décrivez votre besoin" required>
                <textarea
                  required
                  minLength={10}
                  className="input-field min-h-[140px]"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Poste recherché, type de contrat, durée, lieu, compétences souhaitées, rémunération envisagée…"
                />
              </Field>

              {status === "error" && <p className="text-sm text-signal-coral">{error}</p>}

              <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
                {status === "sending" ? "Envoi…" : "Envoyer ma demande"}
              </button>
            </form>
          )}
        </div>
      </section>

      
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-mist-500">
        {label} {required && <span className="text-signal-coral">*</span>}
      </label>
      {children}
    </div>
  );
}