"use client";

import { FormEvent, useEffect, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Boton,
  Campo,
  Card,
  CardHeader,
  EstadoVacio,
  Input,
  Skeleton,
} from "../../components/ui";
import type { Moneda, MovimientoRed } from "@/lib/api";
import { cbuCorto, esCbu, fechaHora, money } from "@/lib/format";

export default function TransferenciasPage() {
  const { api, perfil, refrescar, avisar, cargando } = useBank();

  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [destinatario, setDestinatario] = useState("");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historial, setHistorial] = useState<MovimientoRed[] | null>(null);

  const cuentas = perfil?.accounts ?? [];
  const cuentaOrigen = cuentas.find((cuenta) => cuenta.currency === moneda);
  const saldo = Number(cuentaOrigen?.balance ?? 0);
  const puedeOperar = Boolean(cuentaOrigen?.cbu);
  const tieneUsd = cuentas.some((cuenta) => cuenta.currency === "USD");

  async function cargarHistorial() {
    try {
      setHistorial(await api.historial());
    } catch {
      setHistorial([]);
    }
  }

  useEffect(() => {
    if (puedeOperar) void cargarHistorial();
    else setHistorial([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeOperar]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const destino = destinatario.trim();
    const valor = Number(monto);

    if (!destino) {
      setError("Ingresá el CBU o el alias de destino.");
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("El importe tiene que ser mayor a cero.");
      return;
    }
    if (valor > saldo) {
      setError(`No te alcanza el saldo. Disponible: ${money(saldo, moneda)}.`);
      return;
    }
    if (destino === cuentaOrigen?.cbu) {
      setError("No podés transferirte a tu propia cuenta.");
      return;
    }

    setEnviando(true);
    try {
      await api.transferir(destino, valor, motivo.trim() || undefined, moneda);
      avisar("exito", `Transferiste ${money(valor, moneda)} correctamente.`);
      setDestinatario("");
      setMonto("");
      setMotivo("");
      await refrescar();
      await cargarHistorial();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-96 rounded-[var(--radius-card)] lg:col-span-2" />
          <Skeleton className="h-96 rounded-[var(--radius-card)] lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Transferencias</h1>
        <p className="mt-1 text-sm text-ink-500">
          Enviá dinero a cualquier CBU o alias de la red interbancaria.
        </p>
      </header>

      {!puedeOperar && (
        <Aviso tono="advertencia" titulo="Necesitás activar tu cuenta">
          Sin CBU no podés enviar ni recibir transferencias. Activala desde el inicio.
        </Aviso>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader titulo="Nueva transferencia" />
          <form onSubmit={enviar} className="space-y-4 p-5">
            {tieneUsd && (
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-100 p-1">
                {(["ARS", "USD"] as const).map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setMoneda(opcion)}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                      moneda === opcion
                        ? "bg-white text-brand-900 shadow-[var(--shadow-card)]"
                        : "text-ink-600 hover:text-ink-800",
                    ].join(" ")}
                  >
                    {opcion === "ARS" ? "Pesos" : "Dólares"}
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-ink-50 px-4 py-3">
              <p className="text-xs text-ink-500">
                Disponible en {moneda === "ARS" ? "pesos" : "dólares"}
              </p>
              <p className="tabular mt-0.5 text-xl font-semibold text-ink-900">
                {money(saldo, moneda)}
              </p>
            </div>

            {/* El Banco Central no valida que las monedas coincidan, asi que
                conviene avisarlo antes de que el backend rechace. */}
            <Aviso tono="neutro">
              El destino tiene que ser una cuenta en{" "}
              <strong>{moneda === "ARS" ? "pesos" : "dólares"}</strong>. Para cambiar de
              moneda, usá Cuentas.
            </Aviso>

            <Campo
              etiqueta="Destino"
              ayuda={
                destinatario && !esCbu(destinatario)
                  ? "Se va a resolver como alias."
                  : "CBU de 22 dígitos o alias."
              }
            >
              <Input
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="0170099220000067797370 o juan.perez.cayman"
                disabled={!puedeOperar}
              />
            </Campo>

            <Campo etiqueta="Importe">
              <Input
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0,00"
                disabled={!puedeOperar}
              />
            </Campo>

            <Campo etiqueta="Motivo (opcional)">
              <Input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Alquiler, préstamo, regalo…"
                maxLength={80}
                disabled={!puedeOperar}
              />
            </Campo>

            {error && <Aviso tono="negativo">{error}</Aviso>}

            <Boton type="submit" cargando={enviando} disabled={!puedeOperar} className="w-full">
              Transferir
            </Boton>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            titulo="Historial"
            descripcion="Transferencias enviadas y recibidas"
            accion={
              <button
                onClick={() => void cargarHistorial()}
                className="text-xs font-semibold text-accent-600 hover:text-accent-700"
              >
                Actualizar
              </button>
            }
          />

          {historial === null ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : historial.length === 0 ? (
            <EstadoVacio
              titulo="Sin transferencias"
              descripcion="Las transferencias que envíes o recibas van a aparecer acá."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {historial.map((movimiento) => {
                const entrante = movimiento.type === "IN";
                return (
                  <li key={String(movimiento.id)} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={[
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        entrante ? "bg-positive-50 text-positive-700" : "bg-ink-100 text-ink-600",
                      ].join(" ")}
                      aria-hidden
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d={entrante ? "M12 5v14m0 0-5-5m5 5 5-5" : "M12 19V5m0 0-5 5m5-5 5 5"}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {movimiento.counterpartyName ??
                          cbuCorto(movimiento.to ?? movimiento.from)}
                      </p>
                      <p className="text-xs text-ink-500">{fechaHora(movimiento.date)}</p>
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
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
