"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBank } from "../../components/BankProvider";
import { Badge, Boton, Card, CardHeader, EstadoVacio, Skeleton } from "../../components/ui";
import { VincularCbu } from "../../components/VincularCbu";
import type { CotizacionDolar, MovimientoRed } from "@/lib/api";
import { cbuCorto, cbuLegible, fecha, money } from "@/lib/format";

const ACCESOS = [
  { href: "/transferencias", etiqueta: "Transferir", d: "M4 8h13m0 0-3.5-3.5M17 8l-3.5 3.5M20 16H7m0 0 3.5-3.5M7 16l3.5 3.5" },
  { href: "/servicios", etiqueta: "Pagar servicios", d: "M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01" },
  { href: "/recargas", etiqueta: "Recargar celular", d: "M8 2.5h8v19H8zM11 18.5h2" },
  { href: "/inversiones", etiqueta: "Invertir", d: "M4 19V9M10 19V5M16 19v-6M22 19H2" },
];

export default function InicioPage() {
  const { perfil, cargando, api } = useBank();
  const [dolar, setDolar] = useState<CotizacionDolar | null>(null);

  useEffect(() => {
    // La cotización es informativa: si la API pública se cae, la tarjeta no se muestra
    // y el resto del inicio funciona igual.
    api.dolar().then(setDolar).catch(() => setDolar(null));
  }, [api]);

  if (cargando) return <CargandoInicio />;

  const cuentas = perfil?.accounts ?? [];
  const principal = cuentas.find((cuenta) => cuenta.currency === "ARS");
  const vinculada = Boolean(principal?.cbu);
  const movimientos = (perfil?.transactions ?? []).slice(0, 6);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Hola, {perfil?.fullName?.split(" ")[0] ?? "cliente"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">Este es el resumen de tus productos.</p>
      </header>

      {!vinculada && <VincularCbu />}

      {/* Saldos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cuentas.map((cuenta) => (
          <Card key={cuenta.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                  Caja de ahorro
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink-700">
                  en {cuenta.currency === "ARS" ? "pesos" : "dólares"}
                </p>
              </div>
              <Badge tono={cuenta.currency === "ARS" ? "marca" : "positivo"}>
                {cuenta.currency}
              </Badge>
            </div>

            <p className="tabular mt-5 text-3xl font-semibold tracking-tight text-ink-900">
              {money(cuenta.balance, cuenta.currency)}
            </p>

            <dl className="mt-4 space-y-1 border-t border-ink-100 pt-3 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">CBU</dt>
                <dd className="tabular truncate font-medium text-ink-700">
                  {cuenta.cbu ? cbuLegible(cuenta.cbu) : "sin vincular"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Alias</dt>
                <dd className="truncate font-medium text-ink-700">{cuenta.alias ?? "—"}</dd>
              </div>
            </dl>
          </Card>
        ))}

        {!cuentas.some((cuenta) => cuenta.currency === "USD") && (
          <Card className="flex flex-col justify-center border-dashed p-5">
            <p className="text-sm font-medium text-ink-700">Caja de ahorro en dólares</p>
            <p className="mt-1 text-xs text-ink-500">
              Abrila para comprar y vender dólares desde el banco.
            </p>
            <Link href="/cuentas" className="mt-4">
              <Boton variante="secundario" className="w-full">
                Abrir cuenta en USD
              </Boton>
            </Link>
          </Card>
        )}
      </div>

      {/* Accesos rápidos */}
      <Card>
        <CardHeader titulo="Accesos rápidos" />
        <div className="grid grid-cols-2 gap-px bg-ink-100 sm:grid-cols-4">
          {ACCESOS.map((acceso) => (
            <Link
              key={acceso.href}
              href={acceso.href}
              className="flex flex-col items-center gap-2 bg-white px-4 py-5 text-center transition-colors hover:bg-brand-50"
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
                  <path d={acceso.d} />
                </svg>
              </span>
              <span className="text-xs font-medium text-ink-700">{acceso.etiqueta}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Últimos movimientos */}
        <Card className="lg:col-span-2">
          <CardHeader
            titulo="Últimos movimientos"
            descripcion="Transferencias de la red interbancaria"
            accion={
              <Link
                href="/cuentas"
                className="text-xs font-semibold text-accent-600 hover:text-accent-700"
              >
                Ver todo
              </Link>
            }
          />
          {movimientos.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no hay movimientos"
              descripcion="Cuando envíes o recibas una transferencia, va a aparecer acá."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {movimientos.map((movimiento) => (
                <FilaMovimiento key={String(movimiento.id)} movimiento={movimiento} />
              ))}
            </ul>
          )}
        </Card>

        {/* Cotización */}
        <div className="space-y-6">
          {dolar && (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-900">Dólar {dolar.nombre}</h2>
                <Badge tono="neutro">{dolar.casa}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-ink-50 px-3 py-2.5">
                  <p className="text-xs text-ink-500">Compra</p>
                  <p className="tabular mt-0.5 text-lg font-semibold text-ink-900">
                    {money(dolar.compra)}
                  </p>
                </div>
                <div className="rounded-lg bg-ink-50 px-3 py-2.5">
                  <p className="text-xs text-ink-500">Venta</p>
                  <p className="tabular mt-0.5 text-lg font-semibold text-ink-900">
                    {money(dolar.venta)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-400">
                Actualizado el {fecha(dolar.fechaActualizacion)}
              </p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-900">Tu perfil</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Titular</dt>
                <dd className="truncate font-medium text-ink-800">{perfil?.fullName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">DNI</dt>
                <dd className="tabular font-medium text-ink-800">{perfil?.dni ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Perfil</dt>
                <dd className="font-medium text-ink-800">
                  {perfil?.role === "gerente"
                    ? "Gerente"
                    : perfil?.role === "admin"
                      ? "Empleado"
                      : "Cliente"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FilaMovimiento({ movimiento }: { movimiento: MovimientoRed }) {
  const entrante = movimiento.type === "IN";
  const contraparte = movimiento.counterpartyName ?? cbuCorto(movimiento.to ?? movimiento.from);

  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <span
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          entrante ? "bg-positive-50 text-positive-700" : "bg-ink-100 text-ink-600",
        ].join(" ")}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d={entrante ? "M12 5v14m0 0-5-5m5 5 5-5" : "M12 19V5m0 0-5 5m5-5 5 5"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {entrante ? "Transferencia recibida" : "Transferencia enviada"}
        </p>
        <p className="truncate text-xs text-ink-500">
          {contraparte} · {fecha(movimiento.date)}
        </p>
      </div>

      <p
        className={[
          "tabular shrink-0 text-sm font-semibold",
          entrante ? "text-positive-700" : "text-ink-900",
        ].join(" ")}
      >
        {entrante ? "+" : "−"}
        {money(movimiento.amount)}
      </p>
    </li>
  );
}

function CargandoInicio() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 rounded-[var(--radius-card)]" />
        ))}
      </div>
      <Skeleton className="h-28 rounded-[var(--radius-card)]" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-[var(--radius-card)] lg:col-span-2" />
        <Skeleton className="h-80 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
