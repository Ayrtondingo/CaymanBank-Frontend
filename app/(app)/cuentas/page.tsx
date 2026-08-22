"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Badge,
  Boton,
  Campo,
  Card,
  CardHeader,
  EstadoVacio,
  Input,
  Modal,
  Skeleton,
  Tabla,
} from "../../components/ui";
import type { CotizacionDolar, Cuenta, Movimiento } from "@/lib/api";
import { cbuLegible, fechaHora, money, titulo } from "@/lib/format";

export default function CuentasPage() {
  const { api, perfil, refrescar, avisar, cargando } = useBank();

  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[] | null>(null);
  const [operacion, setOperacion] = useState<"deposito" | "extraccion" | null>(null);
  const [cambioAbierto, setCambioAbierto] = useState(false);
  const [abriendoUsd, setAbriendoUsd] = useState(false);

  const cuentas = perfil?.accounts ?? [];
  const cuentaActiva = cuentas.find((c) => c.cbu === seleccionada) ?? cuentas[0] ?? null;
  const tieneUsd = cuentas.some((c) => c.currency === "USD");

  const cargarMovimientos = useCallback(
    async (cbu: string) => {
      setMovimientos(null);
      try {
        setMovimientos(await api.movimientos(cbu));
      } catch (e) {
        avisar("error", (e as Error).message);
        setMovimientos([]);
      }
    },
    [api, avisar],
  );

  useEffect(() => {
    if (cuentaActiva?.cbu) void cargarMovimientos(cuentaActiva.cbu);
  }, [cuentaActiva?.cbu, cargarMovimientos]);

  async function abrirCuentaUsd() {
    setAbriendoUsd(true);
    try {
      await api.abrirCuenta("USD");
      await refrescar();
      avisar("exito", "Tu caja de ahorro en dólares está abierta.");
    } catch (e) {
      avisar("error", (e as Error).message);
    } finally {
      setAbriendoUsd(false);
    }
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 rounded-[var(--radius-card)]" />
        <Skeleton className="h-96 rounded-[var(--radius-card)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Cuentas</h1>
          <p className="mt-1 text-sm text-ink-500">
            Tus cajas de ahorro y el detalle de cada movimiento.
          </p>
        </div>
        <div className="flex gap-2">
          {tieneUsd && (
            <Boton variante="secundario" onClick={() => setCambioAbierto(true)}>
              Comprar / vender dólares
            </Boton>
          )}
          {!tieneUsd && (
            <Boton onClick={abrirCuentaUsd} cargando={abriendoUsd}>
              Abrir cuenta en USD
            </Boton>
          )}
        </div>
      </header>

      {cuentas.length === 0 ? (
        <Card>
          <EstadoVacio
            titulo="Todavía no tenés cuentas"
            descripcion="Activá tu cuenta desde el inicio para que el Banco Central te asigne un CBU."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {cuentas.map((cuenta) => (
              <TarjetaCuenta
                key={cuenta.id}
                cuenta={cuenta}
                activa={cuenta.cbu === cuentaActiva?.cbu}
                onSeleccionar={() => cuenta.cbu && setSeleccionada(cuenta.cbu)}
                onCopiar={() => {
                  if (!cuenta.cbu) return;
                  void navigator.clipboard.writeText(cuenta.cbu);
                  avisar("info", "CBU copiado");
                }}
              />
            ))}
          </div>

          <Card>
            <CardHeader
              titulo="Movimientos"
              descripcion={
                cuentaActiva?.cbu
                  ? `Caja en ${cuentaActiva.currency} · ${cbuLegible(cuentaActiva.cbu)}`
                  : undefined
              }
              accion={
                <div className="flex gap-2">
                  <Boton variante="secundario" onClick={() => setOperacion("deposito")}>
                    Depositar
                  </Boton>
                  <Boton variante="secundario" onClick={() => setOperacion("extraccion")}>
                    Extraer
                  </Boton>
                </div>
              }
            />

            {movimientos === null ? (
              <div className="space-y-2 p-5">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : movimientos.length === 0 ? (
              <EstadoVacio
                titulo="Sin movimientos"
                descripcion="Los depósitos, extracciones y pagos de esta cuenta aparecen acá."
              />
            ) : (
              <Tabla columnas={["Fecha", "Descripción", "Categoría", "Importe", "Saldo"]}>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-ink-50">
                    <td className="px-5 py-3 whitespace-nowrap text-ink-600">
                      {fechaHora(movimiento.fecha)}
                    </td>
                    <td className="px-5 py-3 text-ink-900">{movimiento.descripcion}</td>
                    <td className="px-5 py-3">
                      <Badge>{titulo(movimiento.tipo)}</Badge>
                    </td>
                    <td
                      className={[
                        "tabular px-5 py-3 text-right font-semibold whitespace-nowrap",
                        movimiento.signo === "credito" ? "text-positive-700" : "text-ink-900",
                      ].join(" ")}
                    >
                      {movimiento.signo === "credito" ? "+" : "−"}
                      {money(movimiento.monto, movimiento.moneda)}
                    </td>
                    <td className="tabular px-5 py-3 text-right whitespace-nowrap text-ink-600">
                      {money(movimiento.saldo, movimiento.moneda)}
                    </td>
                  </tr>
                ))}
              </Tabla>
            )}
          </Card>
        </>
      )}

      <ModalCaja
        operacion={operacion}
        cuenta={cuentaActiva}
        onCerrar={() => setOperacion(null)}
        onHecho={async () => {
          setOperacion(null);
          await refrescar();
          if (cuentaActiva?.cbu) await cargarMovimientos(cuentaActiva.cbu);
        }}
      />

      <ModalCambio
        abierto={cambioAbierto}
        onCerrar={() => setCambioAbierto(false)}
        onHecho={async () => {
          setCambioAbierto(false);
          await refrescar();
          if (cuentaActiva?.cbu) await cargarMovimientos(cuentaActiva.cbu);
        }}
      />
    </div>
  );
}

function TarjetaCuenta({
  cuenta,
  activa,
  onSeleccionar,
  onCopiar,
}: {
  cuenta: Cuenta;
  activa: boolean;
  onSeleccionar: () => void;
  onCopiar: () => void;
}) {
  return (
    <button
      onClick={onSeleccionar}
      className={[
        "rounded-[var(--radius-card)] border p-5 text-left transition-colors",
        activa
          ? "border-brand-900 bg-brand-900 text-white"
          : "border-ink-200 bg-white hover:border-ink-300",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={[
              "text-xs font-medium tracking-wide uppercase",
              activa ? "text-brand-200" : "text-ink-500",
            ].join(" ")}
          >
            Caja de ahorro
          </p>
          <p className={activa ? "text-sm text-brand-100" : "text-sm text-ink-700"}>
            en {cuenta.currency === "ARS" ? "pesos" : "dólares"}
          </p>
        </div>
        <Badge tono={activa ? "neutro" : cuenta.currency === "ARS" ? "marca" : "positivo"}>
          {cuenta.currency}
        </Badge>
      </div>

      <p
        className={[
          "tabular mt-4 text-2xl font-semibold tracking-tight",
          activa ? "text-white" : "text-ink-900",
        ].join(" ")}
      >
        {money(cuenta.balance, cuenta.currency)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={[
            "tabular truncate text-xs",
            activa ? "text-brand-200" : "text-ink-500",
          ].join(" ")}
        >
          {cuenta.cbu ? cbuLegible(cuenta.cbu) : "sin CBU"}
        </span>
        {cuenta.cbu && (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onCopiar();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.stopPropagation();
                onCopiar();
              }
            }}
            className={[
              "shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-semibold",
              activa ? "text-accent-300 hover:bg-white/10" : "text-accent-600 hover:bg-accent-50",
            ].join(" ")}
          >
            Copiar
          </span>
        )}
      </div>
    </button>
  );
}

function ModalCaja({
  operacion,
  cuenta,
  onCerrar,
  onHecho,
}: {
  operacion: "deposito" | "extraccion" | null;
  cuenta: Cuenta | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [monto, setMonto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esDeposito = operacion === "deposito";

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("Ingresá un importe mayor a cero.");
      return;
    }
    if (!cuenta?.cbu) {
      setError("La cuenta no tiene CBU.");
      return;
    }

    setEnviando(true);
    try {
      if (esDeposito) await api.depositar(cuenta.cbu, valor);
      else await api.extraer(cuenta.cbu, valor);

      avisar("exito", esDeposito ? "Depósito acreditado." : "Extracción realizada.");
      setMonto("");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={operacion !== null}
      onCerrar={onCerrar}
      titulo={esDeposito ? "Depositar" : "Extraer"}
      descripcion={
        cuenta ? `Caja en ${cuenta.currency} · saldo ${money(cuenta.balance, cuenta.currency)}` : ""
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Importe">
          <Input
            autoFocus
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0,00"
          />
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            {esDeposito ? "Depositar" : "Extraer"}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

function ModalCambio({
  abierto,
  onCerrar,
  onHecho,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [operacion, setOperacion] = useState<"compra" | "venta">("compra");
  const [monto, setMonto] = useState("");
  const [dolar, setDolar] = useState<CotizacionDolar | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) api.dolar().then(setDolar).catch(() => setDolar(null));
  }, [abierto, api]);

  const precio = operacion === "compra" ? dolar?.venta : dolar?.compra;
  const estimado = precio && Number(monto) ? Number(monto) * precio : null;

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("Ingresá un importe en dólares mayor a cero.");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await api.cambiarDivisas(operacion, valor);
      avisar(
        "exito",
        `${operacion === "compra" ? "Compraste" : "Vendiste"} ${money(
          resultado.montoDestino,
          resultado.monedaDestino,
        )} a ${money(resultado.cotizacionUsada)}.`,
      );
      setMonto("");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Comprar y vender dólares"
      descripcion="La conversión se hace entre tus cajas en pesos y en dólares."
    >
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-100 p-1">
          {(["compra", "venta"] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setOperacion(opcion)}
              className={[
                "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                operacion === opcion
                  ? "bg-white text-brand-900 shadow-[var(--shadow-card)]"
                  : "text-ink-600 hover:text-ink-800",
              ].join(" ")}
            >
              {opcion === "compra" ? "Comprar USD" : "Vender USD"}
            </button>
          ))}
        </div>

        <Campo
          etiqueta="Cantidad de dólares"
          ayuda={
            precio
              ? `Cotización ${operacion === "compra" ? "de venta" : "de compra"}: ${money(precio)}`
              : "Buscando cotización…"
          }
        >
          <Input
            autoFocus
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="100"
          />
        </Campo>

        {estimado !== null && (
          <div className="rounded-lg bg-brand-50 px-4 py-3">
            <p className="text-xs text-brand-700">
              {operacion === "compra" ? "Vas a pagar" : "Vas a recibir"}
            </p>
            <p className="tabular mt-0.5 text-xl font-semibold text-brand-900">
              {money(estimado)}
            </p>
          </div>
        )}

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Confirmar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
