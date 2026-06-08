import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-[var(--brand)]">Pagina no encontrada</p>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">No encontramos esa seccion</h1>
      <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
        Puede que el enlace haya cambiado o que la pagina ya no este disponible.
      </p>
      <Link href="/dashboard" className="primary-button">
        Volver al inicio
      </Link>
    </div>
  );
}
