export function Logo({
  className = "",
  invertido = false,
}: {
  className?: string;
  invertido?: boolean;
}) {
  const marca = invertido ? "text-white" : "text-brand-900";
  const acento = invertido ? "text-accent-300" : "text-accent-500";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect
          width="32"
          height="32"
          rx="8"
          className={invertido ? "fill-white/10" : "fill-brand-900"}
        />
        {/* Frontón: tres columnas bajo un techo, la silueta clásica de un banco. */}
        <path d="M8 13h16v1.6H8z" className="fill-accent-500" />
        <path d="M16 6.5 25 12H7z" className="fill-white" />
        <path
          d="M10.5 16h2.2v6h-2.2zM14.9 16h2.2v6h-2.2zM19.3 16h2.2v6h-2.2z"
          className="fill-white"
        />
        <path d="M8 23.5h16V25H8z" className="fill-accent-500" />
      </svg>
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-tight ${marca}`}>
          Cayman
        </span>
        <span className={`block text-[10px] font-semibold tracking-[0.18em] uppercase ${acento}`}>
          Bank
        </span>
      </span>
    </span>
  );
}
