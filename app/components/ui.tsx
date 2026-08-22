"use client";

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, useEffect } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------- Botón */

type Variante = "primario" | "secundario" | "fantasma" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 disabled:bg-ink-300",
  secundario:
    "bg-white text-brand-900 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 disabled:text-ink-400",
  fantasma:
    "bg-transparent text-brand-700 hover:bg-brand-50 disabled:text-ink-400",
  peligro:
    "bg-negative-500 text-white hover:bg-negative-700 disabled:bg-ink-300",
};

export function Boton({
  variante = "primario",
  cargando = false,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  cargando?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || cargando}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold",
        "transition-colors disabled:cursor-not-allowed",
        VARIANTES[variante],
        className,
      )}
    >
      {cargando && (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cx(
        "rounded-[var(--radius-card)] border border-ink-200 bg-white shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink-900">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-xs text-ink-500">{descripcion}</p>}
      </div>
      {accion}
    </header>
  );
}

/* ------------------------------------------------------------------ Inputs */

export function Campo({
  etiqueta,
  ayuda,
  error,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-700">{etiqueta}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-negative-500">{error}</span>
      ) : (
        ayuda && <span className="mt-1 block text-xs text-ink-500">{ayuda}</span>
      )}
    </label>
  );
}

const CONTROL =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 " +
  "placeholder:text-ink-400 focus:border-accent-500 disabled:bg-ink-50 disabled:text-ink-400";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(CONTROL, className)} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cx(CONTROL, "cursor-pointer", className)}>
      {children}
    </select>
  );
}

/* ------------------------------------------------------------------ Badges */

type Tono = "neutro" | "positivo" | "negativo" | "advertencia" | "marca";

const TONOS: Record<Tono, string> = {
  neutro: "bg-ink-100 text-ink-600",
  positivo: "bg-positive-50 text-positive-700",
  negativo: "bg-negative-50 text-negative-700",
  advertencia: "bg-warning-50 text-warning-700",
  marca: "bg-brand-50 text-brand-700",
};

export function Badge({ tono = "neutro", children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONOS[tono],
      )}
    >
      {children}
    </span>
  );
}

/** Mapea los estados que devuelve el backend a un tono, en un solo lugar. */
export function EstadoBadge({ estado }: { estado: string }) {
  const positivos = ["aprobada", "activa", "vigente", "pagada", "acreditado", "ejecutada"];
  const negativos = ["rechazada", "bloqueada", "cancelado", "cancelada"];
  const advertencia = ["pendiente", "vencido", "en_analisis", "local"];

  const tono: Tono = positivos.includes(estado)
    ? "positivo"
    : negativos.includes(estado)
      ? "negativo"
      : advertencia.includes(estado)
        ? "advertencia"
        : "neutro";

  return <Badge tono={tono}>{estado.replace(/_/g, " ")}</Badge>;
}

/* ------------------------------------------------------------------ Avisos */

export function Aviso({
  tono = "neutro",
  titulo,
  children,
}: {
  tono?: Tono;
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("rounded-lg px-4 py-3 text-sm", TONOS[tono])}>
      {titulo && <p className="font-semibold">{titulo}</p>}
      <div className={titulo ? "mt-0.5" : undefined}>{children}</div>
    </div>
  );
}

/* --------------------------------------------------------- Estados de carga */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm font-semibold text-ink-700">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-sm text-sm text-ink-500">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  ancho = "max-w-lg",
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  ancho?: string;
}) {
  // Escape cierra, y mientras está abierto el fondo no scrollea.
  useEffect(() => {
    if (!abierto) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCerrar();
    };

    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/40 p-0 sm:items-center sm:p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(event) => event.stopPropagation()}
        className={cx(
          "animate-fade-up w-full rounded-t-2xl bg-white shadow-[var(--shadow-overlay)] sm:rounded-2xl",
          ancho,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink-900">{titulo}</h2>
            {descripcion && <p className="mt-0.5 text-xs text-ink-500">{descripcion}</p>}
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-m-1 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Tabla */

export function Tabla({
  columnas,
  children,
}: {
  columnas: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left">
            {columnas.map((columna) => (
              <th
                key={columna}
                className="px-5 py-2.5 text-xs font-medium tracking-wide text-ink-500 uppercase"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  );
}
