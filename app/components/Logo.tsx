import Image from "next/image";

const ARCHIVO = "/images/cayman-shadow-bank-logo.jpg";

/**
 * El archivo del logo es un JPEG con el fondo blanco quemado, sin canal alfa.
 * Sobre fondos oscuros se recorta al isotipo (el yacaré en el escudo) y se lo
 * apoya en una pastilla blanca, para que no aparezca un rectángulo blanco.
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
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
        {/* El isotipo ocupa el tercio superior del archivo: se escala y se
            desplaza para mostrar solo esa parte. */}
        <span className="relative size-9 overflow-hidden">
          <Image
            src={ARCHIVO}
            alt=""
            aria-hidden
            width={1536}
            height={1024}
            priority
            className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-[62%] scale-[1.75]"
          />
        </span>
      </span>

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

/** Logo completo, con el lockup original. Para pantallas de login y el footer. */
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
