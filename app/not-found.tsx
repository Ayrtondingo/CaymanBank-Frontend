import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-ink-200 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-3xl font-semibold text-brand-900">404</p>
        <h1 className="mt-2 text-lg font-semibold text-ink-900">Página no encontrada</h1>
        <p className="mt-2 text-sm text-ink-500">
          La dirección que buscás no existe o cambió de lugar.
        </p>
        <Link
          href="/inicio"
          className="mt-6 inline-block rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
