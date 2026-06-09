import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 bg-black px-4 text-center font-mono">
      <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#003300]">ERR_404</p>
      <h1 className="text-3xl font-black uppercase tracking-tight text-[#00ff41]" style={{ textShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
        ROUTE_NOT_FOUND
      </h1>
      <p className="text-[10px] text-[#004400] uppercase tracking-widest">
        El nodo solicitado no existe en esta red.
      </p>
      <Link
        href="/dashboard"
        className="btn-terminal mt-4 text-[10px]"
      >
        RETURN_TO_BASE
      </Link>
    </div>
  );
}
