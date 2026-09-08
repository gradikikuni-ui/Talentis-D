export const CONTRACT_TYPES = [
  { value: "mission_courte", label: "Mission courte", color: "text-signal-coral border-signal-coral/40 bg-signal-coral/10" },
  { value: "temps_partiel", label: "Temps partiel", color: "text-cyan-300 border-cyan-300/40 bg-cyan-300/10" },
  { value: "temps_plein", label: "Temps plein", color: "text-signal-mint border-signal-mint/40 bg-signal-mint/10" },
  { value: "freelance", label: "Freelance", color: "text-azure-400 border-azure-400/40 bg-azure-400/10" },
  { value: "stage", label: "Stage", color: "text-mist-300 border-mist-300/40 bg-mist-300/10" },
];

export function contractMeta(value) {
  return CONTRACT_TYPES.find((c) => c.value === value) || CONTRACT_TYPES[0];
}

export const AVAILABILITY = [
  { value: "immediate", label: "Disponible immédiatement" },
  { value: "une_semaine", label: "Disponible sous 1 semaine" },
  { value: "un_mois", label: "Disponible sous 1 mois" },
  { value: "a_definir", label: "À définir" },
];

export const APPLICATION_STATUS = {
  en_attente: { label: "En attente", color: "text-amber-300 bg-amber-300/10 border-amber-300/30" },
  acceptee: { label: "Acceptée", color: "text-signal-mint bg-signal-mint/10 border-signal-mint/30" },
  refusee: { label: "Refusée", color: "text-signal-coral bg-signal-coral/10 border-signal-coral/30" },
};