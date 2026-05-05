import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">Route_Not_Found</p>
      <h1 className="text-2xl font-black text-white">Terminal no encontrada</h1>
      <Link
        href="/dashboard"
        className="rounded-lg border border-[#2ECC71] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#2ECC71] transition-colors hover:bg-[#2ECC71] hover:text-black"
      >
        Volver al panel
      </Link>
    </div>
  );
}
