export default function RoleToggle({ value, onChange, disabled = false, size = "md" }) {
  const isWorker = value === "worker";
  const dims = size === "sm" ? "w-56 h-11 text-sm" : "w-72 h-14 text-base";

  return (
    <div
      role="tablist"
      aria-label="Choisir un profil"
      className={`relative ${dims} rounded-full bg-line/5 p-1 flex select-none ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <span
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-signal-gradient shadow-glow
                   transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: isWorker ? "translateX(0%)" : "translateX(calc(100% + 8px))" }}
      />
      <button role="tab" aria-selected={isWorker} onClick={() => onChange("worker")}
        className={`relative z-10 flex-1 rounded-full font-display font-semibold transition-colors duration-200 ${isWorker ? "text-ink-950" : "text-mist-400"}`}>
        Je cherche du travail
      </button>
      <button role="tab" aria-selected={!isWorker} onClick={() => onChange("employer")}
        className={`relative z-10 flex-1 rounded-full font-display font-semibold transition-colors duration-200 ${!isWorker ? "text-ink-950" : "text-mist-400"}`}>
        Je recrute
      </button>
    </div>
  );
}