"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Boton,
  Campo,
  Card,
  EstadoBadge,
  EstadoVacio,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabla,
} from "../../components/ui";
import type { ResumenTarjeta, Tarjeta } from "@/lib/api";
import { ModalDatos, ModalPagar } from "./modales";
import { fecha, money, percent } from "@/lib/format";

export default function TarjetasPage() {
  const { api, perfil, avisar } = useBank();

  const [tarjetas, setTarjetas] = useState<Tarjeta[] | null>(null);
  const [emitiendo, setEmitiendo] = useState(false);
  const [resumenDe, setResumenDe] = useState<Tarjeta | null>(null);
  const [datosDe, setDatosDe] = useState<Tarjeta | null>(null);
  const [pagarCon, setPagarCon] = useState<Tarjeta | null>(null);

  const cargar = useCallback(async () => {
    try {
      setTarjetas(await api.tarjetas());
    } catch (e) {
      avisar("error", (e as Error).message);
      setTarjetas([]);
    }
  }, [api, avisar]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function alternarBloqueo(tarjeta: Tarjeta) {
    const accion = tarjeta.estado === "activa" ? "bloquear" : "desbloquear";
    try {
      await api.bloquearTarjeta(tarjeta.id, accion);
      avisar("exito", accion === "bloquear" ? "Tarjeta bloqueada." : "Tarjeta desbloqueada.");
      await cargar();
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Tarjetas</h1>
          <p className="mt-1 text-sm text-ink-500">
            Tus tarjetas de débito y crédito, y el resumen de cada una.
          </p>
        </div>
        <Boton onClick={() => setEmitiendo(true)}>Solicitar tarjeta</Boton>
      </header>

      {tarjetas === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-52 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : tarjetas.length === 0 ? (
        <Card>
          <EstadoVacio
            titulo="Todavía no tenés tarjetas"
            descripcion="Pedí una tarjeta de débito ligada a tu caja de ahorro, o una de crédito con límite propio."
            accion={<Boton onClick={() => setEmitiendo(true)}>Solicitar tarjeta</Boton>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tarjetas.map((tarjeta) => (
            <PlasticoTarjeta
              key={tarjeta.id}
              tarjeta={tarjeta}
              titular={perfil?.fullName ?? ""}
              onBloquear={() => void alternarBloqueo(tarjeta)}
              onResumen={() => setResumenDe(tarjeta)}
              onVerDatos={() => setDatosDe(tarjeta)}
              onPagar={() => setPagarCon(tarjeta)}
            />
          ))}
        </div>
      )}

      <ModalEmitir
        abierto={emitiendo}
        onCerrar={() => setEmitiendo(false)}
        onHecho={async () => {
          setEmitiendo(false);
          await cargar();
        }}
      />

      <ModalResumen tarjeta={resumenDe} onCerrar={() => setResumenDe(null)} />

      <ModalDatos tarjeta={datosDe} onCerrar={() => setDatosDe(null)} />

      <ModalPagar
        tarjeta={pagarCon}
        onCerrar={() => setPagarCon(null)}
        onHecho={async () => {
          setPagarCon(null);
          await cargar();
        }}
      />
    </div>
  );
}

function PlasticoTarjeta({
  tarjeta,
  titular,
  onBloquear,
  onResumen,
  onVerDatos,
  onPagar,
}: {
  tarjeta: Tarjeta;
  titular: string;
  onBloquear: () => void;
  onResumen: () => void;
  onVerDatos: () => void;
  onPagar: () => void;
}) {
  const bloqueada = tarjeta.estado === "bloqueada";
  const credito = tarjeta.tipo === "credito";

  return (
    <Card className="overflow-hidden">
      {/* El plástico: gradiente distinto por tipo, y en gris si está bloqueada. */}
      <div
        className={[
          "relative p-5 text-white",
          bloqueada
            ? "bg-ink-500"
            : credito
              ? "bg-gradient-to-br from-brand-800 to-brand-950"
              : "bg-gradient-to-br from-accent-600 to-brand-900",
        ].join(" ")}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-80">
            Cayman Bank
          </span>
          <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
            {credito ? "Crédito" : "Débito"}
          </span>
        </div>

        <p className="tabular mt-8 text-lg font-medium tracking-[0.14em]">
          {tarjeta.numeroEnmascarado}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] tracking-wider uppercase opacity-70">Titular</p>
            <p className="truncate text-xs font-medium">{titular.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-wider uppercase opacity-70">Vence</p>
            <p className="tabular text-xs font-medium">
              {new Date(`${tarjeta.vencimiento}T12:00:00`).toLocaleDateString("es-AR", {
                month: "2-digit",
                year: "2-digit",
              })}
            </p>
          </div>
        </div>

        {bloqueada && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
            Bloqueada
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        {credito ? (
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-500">Disponible</span>
              <span className="tabular font-semibold text-ink-900">
                {money(tarjeta.limiteDisponible ?? 0)}
              </span>
            </div>
            {/* Barra de consumo: cuánto del límite queda libre. */}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-accent-500"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, ((tarjeta.limiteDisponible ?? 0) / (tarjeta.limite || 1)) * 100),
                  )}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">
              Límite total {money(tarjeta.limite ?? 0)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-ink-500">
            Descuenta de tu caja de ahorro en pesos.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <EstadoBadge estado={tarjeta.estado} />
          <div className="flex flex-wrap gap-2">
            <Boton variante="secundario" onClick={onVerDatos}>
              Ver datos
            </Boton>
            <Boton variante="secundario" onClick={onPagar} disabled={bloqueada}>
              Pagar
            </Boton>
            {credito && (
              <Boton variante="secundario" onClick={onResumen}>
                Resumen
              </Boton>
            )}
            <Boton variante={bloqueada ? "secundario" : "peligro"} onClick={onBloquear}>
              {bloqueada ? "Desbloquear" : "Bloquear"}
            </Boton>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ModalEmitir({
  abierto,
  onCerrar,
  onHecho,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, perfil, avisar } = useBank();
  const [tipo, setTipo] = useState<"debito" | "credito">("debito");
  const [cbu, setCbu] = useState("");
  const [limite, setLimite] = useState("200000");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cuentas = perfil?.accounts.filter((cuenta) => cuenta.cbu) ?? [];

  useEffect(() => {
    if (abierto && cuentas[0]?.cbu) setCbu(cuentas[0].cbu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await api.emitirTarjeta(
        tipo === "debito"
          ? { tipo, cbuAsociado: cbu }
          : { tipo, limite: Number(limite) },
      );
      avisar("exito", "Tu tarjeta fue emitida.");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Solicitar tarjeta">
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-100 p-1">
          {(["debito", "credito"] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setTipo(opcion)}
              className={[
                "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                tipo === opcion
                  ? "bg-surface text-ink-900 shadow-[var(--shadow-card)]"
                  : "text-ink-600 hover:text-ink-800",
              ].join(" ")}
            >
              {opcion === "debito" ? "Débito" : "Crédito"}
            </button>
          ))}
        </div>

        {tipo === "debito" ? (
          <Campo etiqueta="Cuenta asociada" ayuda="Los consumos se descuentan de esta caja.">
            <Select value={cbu} onChange={(e) => setCbu(e.target.value)}>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.cbu ?? ""}>
                  Caja en {cuenta.currency} · {money(cuenta.balance, cuenta.currency)}
                </option>
              ))}
            </Select>
          </Campo>
        ) : (
          <Campo etiqueta="Límite de compra" ayuda="Tope de consumo del período.">
            <Input
              inputMode="numeric"
              value={limite}
              onChange={(e) => setLimite(e.target.value.replace(/\D/g, ""))}
            />
          </Campo>
        )}

        {cuentas.length === 0 && tipo === "debito" && (
          <Aviso tono="advertencia">
            Necesitás una caja de ahorro con CBU para pedir una tarjeta de débito.
          </Aviso>
        )}

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton
            type="submit"
            cargando={enviando}
            disabled={tipo === "debito" && cuentas.length === 0}
          >
            Emitir tarjeta
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

function ModalResumen({ tarjeta, onCerrar }: { tarjeta: Tarjeta | null; onCerrar: () => void }) {
  const { api } = useBank();
  const [resumen, setResumen] = useState<ResumenTarjeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tarjeta) {
      setResumen(null);
      setError(null);
      return;
    }
    api
      .resumenTarjeta(tarjeta.id)
      .then(setResumen)
      .catch((e) => setError((e as Error).message));
  }, [tarjeta, api]);

  return (
    <Modal
      abierto={tarjeta !== null}
      onCerrar={onCerrar}
      titulo="Resumen de cuenta"
      descripcion={tarjeta?.numeroEnmascarado}
      ancho="max-w-2xl"
    >
      {error ? (
        <Aviso tono="negativo">{error}</Aviso>
      ) : !resumen ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-brand-900 px-4 py-3 text-white">
              <p className="text-xs text-brand-200">Total a pagar</p>
              <p className="tabular mt-0.5 text-2xl font-semibold">
                {money(resumen.totalAPagar)}
              </p>
            </div>
            <div className="rounded-lg bg-ink-50 px-4 py-3">
              <p className="text-xs text-ink-500">Pago mínimo</p>
              <p className="tabular mt-0.5 text-2xl font-semibold text-ink-900">
                {money(resumen.pagoMinimo)}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-ink-200 px-4 py-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-ink-500">Período</dt>
              <dd className="font-medium text-ink-900">{resumen.periodo}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Vencimiento</dt>
              <dd className="font-medium text-ink-900">{fecha(resumen.vencimiento)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">TNA</dt>
              <dd className="tabular font-medium text-ink-900">{percent(resumen.tna)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">CFT</dt>
              <dd className="tabular font-medium text-ink-900">{percent(resumen.cft)}</dd>
            </div>
          </dl>

          {resumen.consumos.length === 0 ? (
            <EstadoVacio titulo="Sin consumos en el período" />
          ) : (
            <div className="overflow-hidden rounded-lg border border-ink-200">
              <Tabla columnas={["Fecha", "Comercio", "Cuotas", "Importe"]}>
                {resumen.consumos.map((consumo) => (
                  <tr key={consumo.id}>
                    <td className="px-5 py-2.5 whitespace-nowrap text-ink-600">
                      {fecha(consumo.fecha)}
                    </td>
                    <td className="px-5 py-2.5 text-ink-900">{consumo.comercio}</td>
                    <td className="tabular px-5 py-2.5 text-ink-600">{consumo.cuotas}</td>
                    <td className="tabular px-5 py-2.5 text-right font-semibold text-ink-900">
                      {money(consumo.monto)}
                    </td>
                  </tr>
                ))}
              </Tabla>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
