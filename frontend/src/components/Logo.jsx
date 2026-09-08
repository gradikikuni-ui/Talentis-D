export default function Logo({ size = 36, withWordmark = true, dark = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="td-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3DDBFF" />
            <stop offset="100%" stopColor="#7CE8FF" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill="url(#td-grad)" />
        <path d="M12 15h14M19 15v18" stroke="#0B0F17" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="30" cy="26" r="6.2" stroke="#0B0F17" strokeWidth="2.6" fill="none" />
        <line x1="34.6" y1="30.6" x2="39" y2="35" stroke="#0B0F17" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      {withWordmark && (
        <span className={`font-display font-semibold text-lg tracking-tight ${dark ? "text-mist-100" : "text-ink-950"}`}>
          Talentis <span className="text-cyan-400">D</span>
        </span>
      )}
    </div>
  );
}