import Image from "next/image";

const ARCHIVO = "/images/cayman-shadow-bank-logo.jpg";

/**
 * El archivo es un JPEG con el fondo blanco quemado (sin canal alfa) y el
 * lockup completo: emblema arriba y el texto "CAYMAN SHADOW BANK" abajo.
 *
 * Para el isotipo se recorta con background-position en vez de <Image>: el
 * emblema ocupa aproximadamente el 33%–66% horizontal y el 15%–58% vertical,
 * asi que con el fondo al 300% queda encuadrado. Va sobre una pastilla blanca
 * porque el yacare es negro y desapareceria sobre el sidebar oscuro.
 */
export function Logo({
  className = "",
  invertido = false,
}: {
  className?: string;
  invertido?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        role="img"
        aria-label="Cayman Shadow Bank"
        className="size-10 shrink-0 rounded-lg bg-white bg-no-repeat ring-1 ring-black/5"
        style={{
          backgroundImage: `url(${ARCHIVO})`,
          backgroundSize: "300%",
          backgroundPosition: "49.5% 36.5%",
        }}
      />

      <span className="leading-tight">
        <span
          className={`block text-[15px] font-bold tracking-tight ${
            invertido ? "text-white" : "text-ink-900"
          }`}
        >
          Cayman Shadow
        </span>
        <span
          className={`block text-[10px] font-semibold tracking-[0.18em] uppercase ${
            invertido ? "text-accent-300" : "text-accent-600"
          }`}
        >
          Bank
        </span>
      </span>
    </span>
  );
}

/** Lockup completo, tal cual el archivo original. Para login y footer. */
export function LogoCompleto({ className = "" }: { className?: string }) {
  return (
    <Image
      src={ARCHIVO}
      alt="Cayman Shadow Bank"
      width={1536}
      height={1024}
      priority
      className={`h-auto w-full rounded-xl ${className}`}
    />
  );
}
