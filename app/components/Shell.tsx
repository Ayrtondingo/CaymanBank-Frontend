"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Logo } from "./Logo";
import { cx } from "./ui";

interface ItemNav {
  href: string;
  etiqueta: string;
  icono: ReactNode;
  /** Solo visible para el personal del banco. */
  soloStaff?: boolean;
}

const icono = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-[18px] shrink-0"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

const NAV: { seccion: string; items: ItemNav[] }[] = [
  {
    seccion: "Mi banco",
    items: [
      { href: "/inicio", etiqueta: "Inicio", icono: icono("M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5") },
      { href: "/cuentas", etiqueta: "Cuentas", icono: icono("M3 7h18v12H3zM3 11h18M7 15h4") },
      {
        href: "/transferencias",
        etiqueta: "Transferencias",
        icono: icono("M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5"),
      },
      { href: "/tarjetas", etiqueta: "Tarjetas", icono: icono("M2.5 7h19v10h-19zM2.5 11h19M6 14.5h3") },
    ],
  },
  {
    seccion: "Productos",
    items: [
      { href: "/prestamos", etiqueta: "Préstamos", icono: icono("M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6") },
      { href: "/inversiones", etiqueta: "Inversiones", icono: icono("M4 19V9M10 19V5M16 19v-6M22 19H2") },
      { href: "/seguros", etiqueta: "Seguros", icono: icono("M12 3 4.5 6v6c0 4.5 3.2 7.9 7.5 9 4.3-1.1 7.5-4.5 7.5-9V6z") },
    ],
  },
  {
    seccion: "Pagos",
    items: [
      { href: "/servicios", etiqueta: "Servicios", icono: icono("M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01") },
      { href: "/recargas", etiqueta: "Recargas", icono: icono("M8 2.5h8v19H8zM11 18.5h2") },
    ],
  },
  {
    seccion: "Más",
    items: [
      { href: "/reportes", etiqueta: "Reportes", icono: icono("M4 20V4m0 16h16M8 16V9m4 7V6m4 10v-4") },
      { href: "/asistente", etiqueta: "Asistente", icono: icono("M21 12a8 8 0 1 1-3.2-6.4M21 4v5h-5") },
      { href: "/administracion", etiqueta: "Administración", icono: icono("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"), soloStaff: true },
    ],
  },
];

export function Shell({ children, rol }: { children: ReactNode; rol?: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esStaff = rol === "admin" || rol === "gerente";

  // Navegar cierra el menú móvil; si no, queda tapando la página nueva.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const secciones = NAV.map((seccion) => ({
    ...seccion,
    items: seccion.items.filter((item) => !item.soloStaff || esStaff),
  })).filter((seccion) => seccion.items.length > 0);

  const navegacion = (
    <nav className="flex flex-col gap-6 px-3 py-5">
      {secciones.map((seccion) => (
        <div key={seccion.seccion}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-300 uppercase">
            {seccion.seccion}
          </p>
          <ul className="space-y-0.5">
            {seccion.items.map((item) => {
              const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={activo ? "page" : undefined}
                    className={cx(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      activo
                        ? "bg-white/10 text-white"
                        : "text-brand-100 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <span className={activo ? "text-accent-300" : "text-brand-300"}>
                      {item.icono}
                    </span>
                    {item.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fijo en escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto bg-brand-900 lg:flex">
        <div className="px-5 py-5">
          <Logo invertido />
        </div>
        {navegacion}
      </aside>

      {/* Sidebar deslizable en móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-950/50"
            onClick={() => setMenuAbierto(false)}
            role="presentation"
          />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-64 flex-col overflow-y-auto bg-brand-900">
            <div className="flex items-center justify-between px-5 py-5">
              <Logo invertido />
              <button
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-1 text-brand-200 hover:bg-white/10"
              >
                <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {navegacion}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>

          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink-900">{user?.fullName ?? "Cliente"}</p>
              <p className="text-xs text-ink-500">
                {rol === "gerente" ? "Gerente" : rol === "admin" ? "Empleado" : "Cliente"}
              </p>
            </div>
            <UserButton
              appearance={{ elements: { avatarBox: "size-9 rounded-full ring-1 ring-ink-200" } }}
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <footer className="border-t border-ink-200 px-4 py-5 text-xs text-ink-400 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2">
            <span>Cayman Bank — Entidad N.º 19</span>
            <span>Proyecto académico. No es una entidad financiera real.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
