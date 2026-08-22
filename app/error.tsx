"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-ink-200 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="text-lg font-semibold text-ink-900">Algo salió mal</h1>
        <p className="mt-2 text-sm text-ink-500">
          No pudimos cargar esta sección. Probá de nuevo en unos segundos.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
