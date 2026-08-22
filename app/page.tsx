import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "./components/Logo";

const PRODUCTOS = [
  {
    titulo: "Cuentas en pesos y dólares",
    texto: "Caja de ahorro con CBU y alias, y cambio de divisas a cotización del día.",
    d: "M3 7h18v12H3zM3 11h18M7 15h4",
  },
  {
    titulo: "Tarjetas de débito y crédito",
    texto: "Pedila en el momento, seguí tus consumos y bloqueala desde la app.",
    d: "M2.5 7h19v10h-19zM2.5 11h19M6 14.5h3",
  },
  {
    titulo: "Préstamos personales",
    texto: "Simulá la cuota con tasas reales del mercado antes de pedirlo.",
    d: "M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6",
  },
  {
    titulo: "Inversiones",
    texto: "Plazos fijos tradicionales o UVA, y CEDEARs con cotización en vivo.",
    d: "M4 19V9M10 19V5M16 19v-6M22 19H2",
  },
  {
    titulo: "Pagos y recargas",
    texto: "Pagá tus servicios y cargá el celular sin salir del homebanking.",
    d: "M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01",
  },
  {
    titulo: "Asistente 24/7",
    texto: "Consultá saldos y movimientos, o derivá tu caso a un representante.",
    d: "M21 12a8 8 0 1 1-3.2-6.4M21 4v5h-5",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
              >
                Ingresar
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Abrir cuenta
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/inicio"
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Ir a mi banco
              </Link>
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-900 to-brand-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent-300">
              Entidad N.º 19 · Red interbancaria
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Tu banco, sin vueltas
            </h1>
            <p className="mt-4 max-w-lg text-base text-brand-100">
              Cuentas en pesos y dólares, tarjetas, préstamos e inversiones. Todo en un
              mismo lugar, con transferencias inmediatas a cualquier CBU o alias.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
                >
                  Abrir mi cuenta
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Ya soy cliente
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/inicio"
                  className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
                >
                  Entrar a mi banco
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Mock del resumen de cuenta */}
          <div className="lg:justify-self-end">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[var(--shadow-overlay)]">
              <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                Caja de ahorro en pesos
              </p>
              <p className="tabular mt-2 text-3xl font-semibold tracking-tight text-ink-900">
                $ 1.284.500,20
              </p>
              <div className="mt-5 space-y-3 border-t border-ink-100 pt-4">
                {[
                  ["Sueldo", "+ $ 890.000,00", true],
                  ["Supermercado", "− $ 42.310,50", false],
                  ["Transferencia recibida", "+ $ 15.000,00", true],
                ].map(([concepto, importe, entra]) => (
                  <div key={concepto as string} className="flex items-center justify-between">
                    <span className="text-sm text-ink-600">{concepto}</span>
                    <span
                      className={[
                        "tabular text-sm font-semibold",
                        entra ? "text-positive-700" : "text-ink-900",
                      ].join(" ")}
                    >
                      {importe}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
          Todo lo que necesitás
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          Productos pensados para resolverse en dos clics.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((producto) => (
            <article
              key={producto.titulo}
              className="rounded-[var(--radius-card)] border border-ink-200 p-6 transition-shadow hover:shadow-[var(--shadow-raised)]"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={producto.d} />
                </svg>
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{producto.titulo}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{producto.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-200 bg-ink-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-ink-500 sm:px-6">
          <Logo />
          <p className="max-w-md text-right">
            Proyecto académico. Cayman Bank no es una entidad financiera real y no opera
            con dinero de curso legal.
          </p>
        </div>
      </footer>
    </div>
  );
}
