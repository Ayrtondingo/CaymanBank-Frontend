/**
 * Los archivos del logo son JPEG con el fondo quemado, sin canal alfa: hay una
 * version para fondo claro y otra para oscuro. La eleccion se hace por CSS
 * (ver `.logo-marca` en globals.css), no por JS, asi no parpadea al hidratar.
 */
export function Logo({
  className = "",
  invertido = false,
}: {
  className?: string;
  /** Para fondos siempre oscuros, como el sidebar, que no siguen al tema. */
  invertido?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        role="img"
        aria-label="Cayman Shadow Bank"
        className={[
          "size-10 shrink-0 rounded-lg",
          invertido ? "logo-marca-oscuro" : "logo-marca ring-1 ring-black/5",
        ].join(" ")}
      />

      <span className="leading-tight">
        <span
          className={`block text-[15px] font-bold tracking-tight ${
            invertido ? "text-white" : "text-ink-900"
          }`}
        >
          Cayman Shadow
        </span>
        <span
          className={`block text-[10px] font-semibold tracking-[0.18em] uppercase ${
            invertido ? "text-accent-300" : "text-accent-600"
          }`}
        >
          Bank
        </span>
      </span>
    </span>
  );
}

/** Lockup completo, con el nombre incluido. Para login y footer. */
export function LogoCompleto({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Cayman Shadow Bank"
      className={`logo-lockup block ${className}`}
    />
  );
}
