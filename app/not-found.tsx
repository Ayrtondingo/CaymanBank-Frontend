import Link from "next/link";

export default function NotFound() {
  return (
<<<<<<< HEAD
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-[var(--brand)]">Pagina no encontrada</p>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">No encontramos esa seccion</h1>
      <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
        Puede que el enlace haya cambiado o que la pagina ya no este disponible.
      </p>
      <Link href="/dashboard" className="primary-button">
        Volver al inicio
=======
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">Route_Not_Found</p>
      <h1 className="text-2xl font-black text-white">Terminal no encontrada</h1>
      <Link
        href="/dashboard"
        className="rounded-lg border border-[#2ECC71] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#2ECC71] transition-colors hover:bg-[#2ECC71] hover:text-black"
      >
        Volver al panel
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
      </Link>
    </div>
  );
}
