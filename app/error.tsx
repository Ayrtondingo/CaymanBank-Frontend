"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="text-red-500" size={36} />
      <h1 className="text-2xl font-black text-white">Error de terminal</h1>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-white hover:text-white"
      >
        <RefreshCw size={14} />
        Reintentar
      </button>
    </div>
  );
}
