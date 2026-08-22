"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

const CLAVE = "cayman-tema";

/** Lee la preferencia guardada; si no hay, usa la del sistema. */
function temaInicial(): Tema {
  if (typeof window === "undefined") return "light";
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === "light" || guardado === "dark") return guardado;
  } catch {
    /* modo incógnito o cookies bloqueadas */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function aplicarTema(tema: Tema) {
  document.documentElement.dataset.theme = tema;
  document.documentElement.style.colorScheme = tema;
}

export function TemaToggle({ invertido = false }: { invertido?: boolean }) {
  // Arranca en null para no renderizar el ícono equivocado antes de hidratar:
  // el servidor no sabe qué tema eligió esta persona.
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const inicial = temaInicial();
    setTema(inicial);
    aplicarTema(inicial);
  }, []);

  function alternar() {
    const siguiente: Tema = tema === "dark" ? "light" : "dark";
    setTema(siguiente);
    aplicarTema(siguiente);
    try {
      localStorage.setItem(CLAVE, siguiente);
    } catch {
      /* si no se puede guardar, el tema dura lo que la pestaña */
    }
  }

  const base = invertido
    ? "text-brand-100 hover:bg-white/10"
    : "text-ink-500 hover:bg-ink-100 hover:text-ink-800";

  return (
    <button
      onClick={alternar}
      aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={tema === "dark" ? "Tema claro" : "Tema oscuro"}
      className={`grid size-9 place-items-center rounded-lg transition-colors ${base}`}
    >
      {/* Sin tema resuelto todavía: se reserva el espacio y no se dibuja nada,
          así no hay salto de layout ni parpadeo del ícono incorrecto. */}
      {tema === null ? (
        <span className="size-[18px]" />
      ) : tema === "dark" ? (
        <svg
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Aplica el tema guardado antes del primer pintado.
 *
 * Va como script inline en el <head>: si esperáramos al efecto de React, la
 * página aparecería en claro y saltaría a oscuro un instante después.
 */
export function ScriptTema() {
  const codigo = `(function(){try{var t=localStorage.getItem("${CLAVE}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: codigo }} />;
}
