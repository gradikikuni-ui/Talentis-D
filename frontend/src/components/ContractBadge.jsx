const LABELS = {
  mission_courte: "Mission courte",
  interim: "Intérim",
  cdd: "CDD",
  cdi: "CDI",
  freelance: "Freelance",
  stage: "Stage",
  alternance: "Alternance",
};

export default function ContractBadge({ type }) {
  return (
    <span className="rounded-full bg-signal-gradient px-3 py-1 font-mono text-xs font-medium text-white">
      {LABELS[type] || type}
    </span>
  );
}