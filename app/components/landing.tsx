import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

/* ------------------------------------------------------------------ Iconos */

export function Icono({ d, className = "size-5" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export const ICONOS = {
  cuenta: "M3 7h18v12H3zM3 11h18M7 15h4",
  tarjeta: "M2.5 7h19v10h-19zM2.5 11h19M6 14.5h3",
  prestamo: "M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6",
  inversion: "M4 19V9M10 19V5M16 19v-6M22 19H2",
  pago: "M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01",
  chat: "M21 12a8 8 0 1 1-3.2-6.4M21 4v5h-5",
  escudo: "M12 3 4.5 6v6c0 4.5 3.2 7.9 7.5 9 4.3-1.1 7.5-4.5 7.5-9V6z",
  candado: "M6 11h12v10H6zM9 11V7a3 3 0 0 1 6 0v4",
  rayo: "M13 2 4 14h7l-1 8 9-12h-7z",
  check: "M4 12.5 9 17.5 20 6.5",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",
};

/* --------------------------------------------------------------- Secciones */

export function Seccion({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={className}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function TituloSeccion({
  sobretitulo,
  titulo,
  bajada,
  invertido = false,
}: {
  sobretitulo?: string;
  titulo: string;
  bajada?: string;
  invertido?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {sobretitulo && (
        <p
          className={`text-xs font-semibold tracking-[0.14em] uppercase ${
            invertido ? "text-accent-300" : "text-accent-600"
          }`}
        >
          {sobretitulo}
        </p>
      )}
      <h2
        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
          invertido ? "text-white" : "text-ink-900"
        }`}
      >
        {titulo}
      </h2>
      {bajada && (
        <p className={`mt-3 text-base ${invertido ? "text-brand-100" : "text-ink-500"}`}>
          {bajada}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Llamadas */

export function BotonesEntrada({ invertido = false }: { invertido?: boolean }) {
  return (
    <>
      <SignedOut>
        <Link
          href="/sign-up"
          className={
            invertido
              ? "rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-ink-100"
              : "rounded-lg bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          }
        >
          Abrí tu cuenta
        </Link>
        <Link
          href="/sign-in"
          className={
            invertido
              ? "rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              : "rounded-lg border border-ink-300 px-5 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-100"
          }
        >
          Ya soy cliente
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/inicio"
          className={
            invertido
              ? "rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-ink-100"
              : "rounded-lg bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          }
        >
          Entrar a mi banco
        </Link>
      </SignedIn>
    </>
  );
}
