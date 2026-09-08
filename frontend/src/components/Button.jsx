export default function Button({ variant = "signal", className = "", ...props }) {
  const base = variant === "signal" ? "btn-signal" : variant === "ghost" ? "btn-ghost" : "";
  return <button className={`${base} ${className} disabled:opacity-50 disabled:pointer-events-none`} {...props} />;
}