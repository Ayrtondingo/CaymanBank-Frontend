"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Boton,
  Campo,
  Card,
  CardHeader,
  EstadoBadge,
  EstadoVacio,
  Input,
  Modal,
  Skeleton,
  Tabla,
} from "../../components/ui";
import type { Prestamo, SimulacionPrestamo } from "@/lib/api";
import { fecha, money, percent } from "@/lib/format";

export default function PrestamosPage() {
  const { api, refrescar, avisar } = useBank();

  const [prestamos, setPrestamos] = useState<Prestamo[] | null>(null);
  const [detalle, setDetalle] = useState<Prestamo | null>(null);

  const [monto, setMonto] = useState("500000");
  const [plazo, setPlazo] = useState("12");
  const [simulacion, setSimulacion] = useState<SimulacionPrestamo | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setPrestamos(await api.prestamos());
    } catch {
      setPrestamos([]);
    }
  }, [api]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function simular(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSimulando(true);
    try {
      setSimulacion(
        await api.simularPrestamo({ monto: Number(monto), plazoMeses: Number(plazo) }),
      );
    } catch (e) {
      setError((e as Error).message);
      setSimulacion(null);
    } finally {
      setSimulando(false);
    }
  }

  async function solicitar() {
    setError(null);
    setSolicitando(true);
    try {
      await api.solicitarPrestamo({ monto: Number(monto), plazoMeses: Number(plazo) });
      avisar("exito", "Préstamo acreditado en tu caja de ahorro.");
      setSimulacion(null);
      await Promise.all([cargar(), refrescar()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSolicitando(false);
    }
  }

  async function pagarCuota(prestamo: Prestamo) {
    try {
      await api.pagarCuota(prestamo.id);
      avisar("exito", "Cuota pagada.");
      await Promise.all([cargar(), refrescar()]);
      setDetalle(null);
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  async function precancelar(prestamo: Prestamo) {
    try {
      await api.precancelar(prestamo.id);
      avisar("exito", "Préstamo precancelado.");
      await Promise.all([cargar(), refrescar()]);
      setDetalle(null);
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Préstamos</h1>
        <p className="mt-1 text-sm text-ink-500">
          Simulá con tasas reales del mercado y pedí tu préstamo personal.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader titulo="Simulador" descripcion="Sistema francés, cuota fija" />
          <form onSubmit={simular} className="space-y-4 p-5">
            <Campo etiqueta="¿Cuánto necesitás?">
              <Input
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))}
              />
            </Campo>

            <Campo etiqueta="Plazo" ayuda={`${plazo} cuotas mensuales`}>
              <input
                type="range"
                min={3}
                max={60}
                step={3}
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                className="w-full accent-[var(--color-accent-500)]"
              />
            </Campo>

            {error && <Aviso tono="negativo">{error}</Aviso>}

            <Boton type="submit" variante="secundario" cargando={simulando} className="w-full">
              Simular
            </Boton>

            {simulacion && (
              <div className="space-y-3 rounded-lg bg-brand-900 px-4 py-4 text-white">
                <div>
                  <p className="text-xs text-brand-200">Cuota mensual</p>
                  <p className="tabular text-2xl font-semibold">{money(simulacion.cuota)}</p>
                </div>
                <dl className="grid grid-cols-2 gap-2 border-t border-white/15 pt-3 text-xs">
                  <div>
                    <dt className="text-brand-200">TNA</dt>
                    <dd className="tabular font-semibold">{percent(simulacion.tna)}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-200">CFT</dt>
                    <dd className="tabular font-semibold">{percent(simulacion.cft)}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-200">Total a pagar</dt>
                    <dd className="tabular font-semibold">{money(simulacion.totalPagado)}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-200">Intereses</dt>
                    <dd className="tabular font-semibold">{money(simulacion.totalIntereses)}</dd>
                  </div>
                </dl>
                {simulacion.tasaDeReferencia && (
                  <p className="text-[11px] text-brand-200">
                    Tasa de referencia del mercado, tomada de ArgentinaDatos.
                  </p>
                )}
                <Boton
                  onClick={solicitar}
                  cargando={solicitando}
                  variante="secundario"
                  className="w-full"
                >
                  Solicitar este préstamo
                </Boton>
              </div>
            )}
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader titulo="Mis préstamos" />
          {prestamos === null ? (
            <div className="space-y-2 p-5">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : prestamos.length === 0 ? (
            <EstadoVacio
              titulo="No tenés préstamos"
              descripcion="Simulá uno del lado izquierdo para ver la cuota antes de pedirlo."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {prestamos.map((prestamo) => (
                <li key={prestamo.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">
                          Préstamo #{prestamo.id}
                        </p>
                        <EstadoBadge estado={prestamo.estado} />
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {money(prestamo.monto)} en {prestamo.plazoMeses} cuotas ·{" "}
                        {percent(prestamo.tna)} TNA
                      </p>
                    </div>
                    <Boton variante="secundario" onClick={() => setDetalle(prestamo)}>
                      Ver cuotas
                    </Boton>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-ink-500">Cuota</p>
                      <p className="tabular font-semibold text-ink-900">
                        {money(prestamo.cuota)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-500">Adeudado</p>
                      <p className="tabular font-semibold text-ink-900">
                        {money(prestamo.capitalAdeudado)}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-500">Próximo venc.</p>
                      <p className="font-semibold text-ink-900">
                        {fecha(prestamo.proximoVencimiento)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-accent-500"
                        style={{
                          width: `${(prestamo.cuotasPagadas / prestamo.plazoMeses) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-ink-500">
                      {prestamo.cuotasPagadas} de {prestamo.plazoMeses} cuotas pagadas
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={`Préstamo #${detalle?.id ?? ""}`}
        descripcion="Tabla de amortización"
        ancho="max-w-3xl"
      >
        {detalle && (
          <div className="space-y-4">
            {detalle.estado === "vigente" && (
              <div className="flex flex-wrap gap-2">
                <Boton onClick={() => void pagarCuota(detalle)}>
                  Pagar cuota de {money(detalle.cuota)}
                </Boton>
                <Boton variante="secundario" onClick={() => void precancelar(detalle)}>
                  Precancelar por {money(detalle.capitalAdeudado)}
                </Boton>
              </div>
            )}

            <div className="overflow-hidden rounded-lg border border-ink-200">
              <Tabla columnas={["#", "Vencimiento", "Capital", "Interés", "Cuota", "Estado"]}>
                {detalle.cuotas.map((cuota) => (
                  <tr key={cuota.numero} className={cuota.estado === "pagada" ? "bg-ink-50" : ""}>
                    <td className="tabular px-5 py-2.5 text-ink-600">{cuota.numero}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-ink-600">
                      {fecha(cuota.vencimiento)}
                    </td>
                    <td className="tabular px-5 py-2.5 text-right text-ink-700">
                      {money(cuota.capital)}
                    </td>
                    <td className="tabular px-5 py-2.5 text-right text-ink-700">
                      {money(cuota.interes)}
                    </td>
                    <td className="tabular px-5 py-2.5 text-right font-semibold text-ink-900">
                      {money(cuota.cuota)}
                    </td>
                    <td className="px-5 py-2.5">
                      <EstadoBadge estado={cuota.estado} />
                    </td>
                  </tr>
                ))}
              </Tabla>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
