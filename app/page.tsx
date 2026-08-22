import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "./components/Logo";
import { TemaToggle } from "./components/TemaToggle";
import {
  BotonesEntrada,
  ICONOS,
  Icono,
  Seccion,
  TituloSeccion,
} from "./components/landing";

/** La cotización se revalida cada 5 minutos: no cambia más seguido que eso. */
export const revalidate = 300;

interface Cotizacion {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
}

/**
 * Se consulta DolarAPI directo y no el backend, porque `/market/dolar` pide
 * autenticación y esta página es pública. Si la API falla, la franja de
 * cotizaciones simplemente no se muestra.
 */
async function getCotizaciones(): Promise<Cotizacion[]> {
  try {
    const respuesta = await fetch("https://dolarapi.com/v1/dolares", {
      next: { revalidate },
    });
    if (!respuesta.ok) return [];
    const datos: Cotizacion[] = await respuesta.json();
    return ["oficial", "blue", "bolsa", "tarjeta"]
      .map((casa) => datos.find((d) => d.casa === casa))
      .filter((d): d is Cotizacion => Boolean(d));
  } catch {
    return [];
  }
}

const pesos = (valor: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);

const PRODUCTOS = [
  {
    icono: ICONOS.cuenta,
    titulo: "Cuentas en pesos y dólares",
    texto:
      "Caja de ahorro con CBU y alias propios. Comprá y vendé dólares a la cotización del momento, sin salir de la app.",
    puntos: ["$150.000 de bienvenida", "US$10.000 al abrir la de dólares", "CBU y alias propios"],
  },
  {
    icono: ICONOS.tarjeta,
    titulo: "Tarjetas de débito y crédito",
    texto:
      "Pedila y usala en el momento. Seguí cada consumo, mirá tu resumen y bloqueala vos mismo si la perdés.",
    puntos: ["Alta inmediata", "Bloqueo desde la app", "Resumen con CFT"],
  },
  {
    icono: ICONOS.prestamo,
    titulo: "Préstamos personales",
    texto:
      "Simulá la cuota antes de pedirlo, con tasas reales del mercado. Pagá cuotas o cancelá anticipado cuando quieras.",
    puntos: ["Sistema francés", "Tasas de mercado", "Precancelación sin cargo"],
  },
  {
    icono: ICONOS.inversion,
    titulo: "Inversiones",
    texto:
      "Plazos fijos tradicionales o ajustados por UVA, y CEDEARs con cotización en vivo del mercado local.",
    puntos: ["Plazo fijo y UVA", "CEDEARs", "Portafolio valuado"],
  },
  {
    icono: ICONOS.pago,
    titulo: "Pagos y recargas",
    texto:
      "Consultá tu deuda con las empresas de servicios y pagala al toque. Cargá el celular de cualquier operadora.",
    puntos: ["Luz, gas, agua, internet", "Recarga prepaga", "Historial completo"],
  },
  {
    icono: ICONOS.chat,
    titulo: "Asistente con IA",
    texto:
      "Preguntale por tus saldos, movimientos o gastos. Resuelve gestiones simples y te deriva a una persona si hace falta.",
    puntos: ["Disponible siempre", "Consulta tus datos", "Deriva a un humano"],
  },
];

const PASOS = [
  {
    numero: "01",
    titulo: "Creá tu usuario",
    texto: "Con tu mail. Te lleva menos de un minuto y no pedimos tarjeta.",
  },
  {
    numero: "02",
    titulo: "Validá tu identidad",
    texto:
      "Cargá nombre, apellido y DNI. El Banco Central te asigna tu CBU y te acreditamos $150.000.",
  },
  {
    numero: "03",
    titulo: "Empezá a operar",
    texto:
      "Transferí, pedí tu tarjeta, invertí. Abrí tu caja en dólares y sumá US$10.000 más.",
  },
];

const SEGURIDAD = [
  {
    icono: ICONOS.candado,
    titulo: "Autenticación gestionada",
    texto:
      "Las credenciales las administra Clerk, un proveedor especializado. El banco nunca guarda tu contraseña.",
  },
  {
    icono: ICONOS.escudo,
    titulo: "Cada operación, verificada",
    texto:
      "Toda transferencia se valida contra el Banco Central antes de mover un peso, y queda registrada de las dos puntas.",
  },
  {
    icono: ICONOS.rayo,
    titulo: "Control sobre tus tarjetas",
    texto:
      "Bloqueala al instante desde la app si la perdés. Los consumos se autorizan uno por uno contra tu saldo o límite.",
  },
];

const FAQ = [
  {
    pregunta: "¿Cuánto cuesta abrir una cuenta?",
    respuesta:
      "Nada. La caja de ahorro en pesos no tiene costo de apertura ni de mantenimiento, y la de dólares tampoco.",
  },
  {
    pregunta: "¿Cómo son los $150.000 y los US$10.000 de regalo?",
    respuesta:
      "Los $150.000 se acreditan en tu caja en pesos cuando validás tu identidad y el Banco Central te asigna el CBU. Los US$10.000 se acreditan solos al abrir tu caja de ahorro en dólares. Los dos son tuyos: podés transferirlos, invertirlos o gastarlos sin condiciones.",
  },
  {
    pregunta: "¿Puedo transferir a otros bancos?",
    respuesta:
      "Sí. Cayman Bank opera en la red interbancaria con el código de entidad 19, así que podés transferir a cualquier CBU o alias del sistema, y recibir de cualquier banco.",
  },
  {
    pregunta: "¿Cómo se calcula la cuota de un préstamo?",
    respuesta:
      "Con el sistema francés, que da cuota fija: los primeros pagos son mayormente interés y los últimos mayormente capital. Antes de pedirlo podés simularlo y ver la tabla de amortización completa, con TNA y CFT.",
  },
  {
    pregunta: "¿Qué pasa si pierdo mi tarjeta?",
    respuesta:
      "Entrá a la sección Tarjetas y bloqueala. El bloqueo es inmediato: desde ese momento cualquier consumo se rechaza. Podés desbloquearla vos mismo si aparece.",
  },
  {
    pregunta: "¿De dónde salen las cotizaciones y las tasas?",
    respuesta:
      "De fuentes públicas reales: DolarAPI para el dólar, ArgentinaDatos para las tasas de plazo fijo y préstamos y para el índice UVA, y data912 para los CEDEARs. No son números inventados.",
  },
];

export default async function LandingPage() {
  const cotizaciones = await getCotizaciones();

  return (
    <div className="bg-surface">
      {/* ─────────────────────────────────────────────────────────── Header */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-7 md:flex">
            {[
              ["#productos", "Productos"],
              ["#como-empezar", "Cómo empezar"],
              ["#seguridad", "Seguridad"],
              ["#preguntas", "Preguntas"],
            ].map(([href, texto]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                {texto}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <TemaToggle />
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-100 sm:block"
              >
                Ingresar
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Abrir cuenta
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/inicio"
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Ir a mi banco
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── Hero */}
      <section className="relative overflow-hidden bg-brand-900">
        {/* Halo suave detrás del contenido, para que el azul no quede plano. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-accent-500/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-3 py-1 text-xs font-medium text-accent-300">
              <span className="size-1.5 animate-pulse rounded-full bg-accent-300" />
              $150.000 de regalo al abrir tu cuenta
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Tu banco entero,
              <br />
              en una sola app
            </h1>

            <p className="mt-5 max-w-lg text-lg text-brand-100">
              Cuentas en pesos y dólares, tarjetas, préstamos e inversiones.
              Transferencias inmediatas a cualquier CBU o alias del país.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <BotonesEntrada invertido />
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
              {[
                ["$150.000", "de bienvenida"],
                ["US$10.000", "en tu caja en dólares"],
                ["$0", "de mantenimiento"],
              ].map(([valor, etiqueta]) => (
                <div key={etiqueta}>
                  <dt className="tabular text-xl font-semibold text-white sm:text-2xl">{valor}</dt>
                  <dd className="mt-0.5 text-xs text-brand-200">{etiqueta}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mock del resumen de cuenta */}
          <div className="lg:justify-self-end">
            <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-[var(--shadow-overlay)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                    Caja de ahorro
                  </p>
                  <p className="text-sm text-ink-600">en pesos</p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  ARS
                </span>
              </div>

              <p className="tabular mt-4 text-3xl font-semibold tracking-tight text-ink-900">
                $ 1.284.500,20
              </p>

              <div className="mt-5 space-y-3 border-t border-ink-100 pt-4">
                {[
                  ["Sueldo", "+ $ 890.000", true],
                  ["Supermercado", "− $ 42.310", false],
                  ["Plazo fijo constituido", "− $ 300.000", false],
                  ["Transferencia recibida", "+ $ 15.000", true],
                ].map(([concepto, importe, entra]) => (
                  <div key={concepto as string} className="flex items-center justify-between">
                    <span className="text-sm text-ink-600">{concepto}</span>
                    <span
                      className={`tabular text-sm font-semibold ${
                        entra ? "text-positive-700" : "text-ink-900"
                      }`}
                    >
                      {importe}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4">
                <div className="rounded-lg bg-ink-50 px-3 py-2">
                  <p className="text-[11px] text-ink-500">Tarjeta crédito</p>
                  <p className="tabular text-sm font-semibold text-ink-900">$ 80.000</p>
                </div>
                <div className="rounded-lg bg-ink-50 px-3 py-2">
                  <p className="text-[11px] text-ink-500">Inversiones</p>
                  <p className="tabular text-sm font-semibold text-positive-700">$ 312.450</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── Cotizaciones en vivo */}
      {cotizaciones.length > 0 && (
        <div className="border-b border-ink-200 bg-ink-50">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-positive-500" />
                Cotización hoy
              </span>
              {cotizaciones.map((c) => (
                <div key={c.casa} className="flex items-baseline gap-2">
                  <span className="text-sm text-ink-500">{c.nombre}</span>
                  <span className="tabular text-sm font-semibold text-ink-900">
                    {pesos(c.venta)}
                  </span>
                </div>
              ))}
              <span className="ml-auto text-xs text-ink-400">Fuente: DolarAPI</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── Productos */}
      <Seccion id="productos" className="py-20">
        <TituloSeccion
          sobretitulo="Productos"
          titulo="Todo lo que necesitás, en un solo lugar"
          bajada="Sin sucursales, sin turnos y sin papeles. Cada producto se resuelve en dos clics."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((producto) => (
            <article
              key={producto.titulo}
              className="group rounded-[var(--radius-card)] border border-ink-200 p-6 transition-all hover:border-brand-200 hover:shadow-[var(--shadow-raised)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-900 group-hover:text-white">
                <Icono d={producto.icono} />
              </span>

              <h3 className="mt-5 text-base font-semibold text-ink-900">{producto.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{producto.texto}</p>

              <ul className="mt-4 space-y-1.5 border-t border-ink-100 pt-4">
                {producto.puntos.map((punto) => (
                  <li key={punto} className="flex items-center gap-2 text-xs text-ink-600">
                    <Icono d={ICONOS.check} className="size-3.5 shrink-0 text-accent-600" />
                    {punto}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Seccion>

      {/* ─────────────────────────────────────────────────────── Beneficios */}
      <Seccion className="pb-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              monto: "$150.000",
              titulo: "Por abrir tu cuenta",
              texto:
                "Se acreditan en tu caja de ahorro en pesos apenas validás tu identidad. Sin condiciones ni permanencia.",
              icono: ICONOS.cuenta,
            },
            {
              monto: "US$10.000",
              titulo: "Por abrir tu caja en dólares",
              texto:
                "Se acreditan automáticamente al crearla. Podés operarlos, transferirlos o venderlos cuando quieras.",
              icono: ICONOS.inversion,
            },
          ].map((b) => (
            <article
              key={b.titulo}
              className="relative overflow-hidden rounded-[var(--radius-card)] border border-accent-500/25 bg-accent-50 p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent-500 text-white">
                <Icono d={b.icono} />
              </span>
              <p className="tabular mt-5 text-3xl font-semibold tracking-tight text-ink-900">
                {b.monto}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink-800">{b.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{b.texto}</p>
            </article>
          ))}
        </div>
      </Seccion>

      {/* ────────────────────────────────────────────────────── Cómo empezar */}
      <Seccion id="como-empezar" className="border-y border-ink-200 bg-ink-50 py-20">
        <TituloSeccion
          sobretitulo="Cómo empezar"
          titulo="Tu cuenta, en tres pasos"
          bajada="Todo online. No hace falta ir a ninguna sucursal ni esperar aprobaciones."
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {PASOS.map((paso, indice) => (
            <li key={paso.numero} className="relative">
              {/* Línea que conecta los pasos, solo en escritorio. */}
              {indice < PASOS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-5 left-[calc(2.5rem+0.75rem)] hidden h-px w-[calc(100%-3.25rem)] bg-ink-300 md:block"
                />
              )}
              <div className="relative flex size-10 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                {indice + 1}
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{paso.titulo}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </Seccion>

      {/* ───────────────────────────────────────────────────────── Seguridad */}
      <Seccion id="seguridad" className="py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <TituloSeccion
            sobretitulo="Seguridad"
            titulo="Tu plata, con controles en cada paso"
            bajada="Un banco se juzga por lo que hace cuando algo sale mal. Esto es lo que hay detrás de cada operación."
          />

          <ul className="space-y-8">
            {SEGURIDAD.map((item) => (
              <li key={item.titulo} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                  <Icono d={item.icono} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{item.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Seccion>

      {/* ────────────────────────────────────────────────────────── Preguntas */}
      <Seccion id="preguntas" className="border-t border-ink-200 py-20">
        <TituloSeccion sobretitulo="Preguntas frecuentes" titulo="Lo que suelen preguntarnos" />

        <div className="mt-10 max-w-3xl divide-y divide-ink-200 border-y border-ink-200">
          {FAQ.map((item) => (
            /* <details> nativo: acordeón accesible y sin una línea de JS. */
            <details key={item.pregunta} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink-900 marker:hidden">
                {item.pregunta}
                <span className="shrink-0 text-ink-400 transition-transform group-open:rotate-45">
                  <Icono d="M12 5v14M5 12h14" className="size-4" />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
                {item.respuesta}
              </p>
            </details>
          ))}
        </div>
      </Seccion>

      {/* ─────────────────────────────────────────────────────── CTA de cierre */}
      <Seccion className="pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-brand-900 px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-accent-500/15 blur-3xl"
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Abrí tu cuenta en un minuto
            </h2>
            <p className="mx-auto mt-3 max-w-md text-brand-100">
              Te damos $150.000 de bienvenida y US$10.000 más al abrir tu caja en
              dólares. Sin costo de apertura ni mantenimiento.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <BotonesEntrada invertido />
            </div>
          </div>
        </div>
      </Seccion>

      {/* ───────────────────────────────────────────────────────────── Footer */}
      <footer className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-sm text-sm text-ink-500">
                Banca en línea con cuentas en pesos y dólares, tarjetas, préstamos e
                inversiones. Entidad N.º 19 de la red interbancaria.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-ink-900 uppercase">
                Productos
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-500">
                {["Cuentas", "Tarjetas", "Préstamos", "Inversiones", "Seguros"].map((p) => (
                  <li key={p}>
                    <a href="#productos" className="transition-colors hover:text-ink-900">
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide text-ink-900 uppercase">
                Información
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-500">
                <li>
                  <a href="#seguridad" className="transition-colors hover:text-ink-900">
                    Seguridad
                  </a>
                </li>
                <li>
                  <a href="#preguntas" className="transition-colors hover:text-ink-900">
                    Preguntas frecuentes
                  </a>
                </li>
                <li>
                  <a href="#como-empezar" className="transition-colors hover:text-ink-900">
                    Cómo empezar
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400">
            <span>© {new Date().getFullYear()} Cayman Bank</span>
            <span className="max-w-lg text-right">
              Proyecto académico. Cayman Bank no es una entidad financiera real y no opera
              con dinero de curso legal.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
