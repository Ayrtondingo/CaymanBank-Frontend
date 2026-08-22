"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Boton,
  Card,
  CardHeader,
  EstadoVacio,
  Input,
  Select,
  Skeleton,
} from "../../components/ui";
import type { ResumenGastos } from "@/lib/api";
import { money, periodoLegible, titulo } from "@/lib/format";

/** Un color por categoría, estable entre renders y consistente con la leyenda. */
const COLORES = [
  "var(--color-brand-700)",
  "var(--color-accent-500)",
  "var(--color-brand-400)",
  "var(--color-warning-500)",
  "var(--color-positive-500)",
  "var(--color-brand-300)",
  "var(--color-negative-500)",
  "var(--color-ink-400)",
];

function periodoActual() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

export default function ReportesPage() {
  const { api, perfil, avisar } = useBank();

  const [cbu, setCbu] = useState("");
  const [periodo, setPeriodo] = useState(periodoActual());
  const [resumen, setResumen] = useState<ResumenGastos | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cuentas = useMemo(
    () => perfil?.accounts.filter((cuenta) => cuenta.cbu) ?? [],
    [perfil],
  );

  useEffect(() => {
    if (!cbu && cuentas[0]?.cbu) setCbu(cuentas[0].cbu);
  }, [cbu, cuentas]);

  const cargar = useCallback(async () => {
    if (!cbu) return;
    setCargandoResumen(true);
    setError(null);
    try {
      setResumen(await api.resumenGastos(cbu, periodo));
    } catch (e) {
      setError((e as Error).message);
      setResumen(null);
    } finally {
      setCargandoResumen(false);
    }
  }, [api, cbu, periodo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  /**
   * La exportación va con fetch + blob y no con un <a href>, porque el endpoint
   * pide el header Authorization y un link plano no lo manda.
   */
  async function exportar(formato: "csv" | "json") {
    try {
      const contenido = await api.request<unknown>(
        `/accounts/${cbu}/movimientos/exportar?formato=${formato}&periodo=${periodo}`,
      );
      const texto =
        typeof contenido === "string" ? contenido : JSON.stringify(contenido, null, 2);
      const blob = new Blob([texto], {
        type: formato === "csv" ? "text/csv;charset=utf-8" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `movimientos-${cbu}-${periodo}.${formato}`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Reportes</h1>
        <p className="mt-1 text-sm text-ink-500">
          Mirá en qué se te va la plata y descargá tus movimientos.
        </p>
      </header>

      <Card>
        <div className="flex flex-wrap items-end gap-3 p-5">
          <label className="min-w-48 flex-1">
            <span className="mb-1.5 block text-xs font-medium text-ink-700">Cuenta</span>
            <Select value={cbu} onChange={(e) => setCbu(e.target.value)}>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.cbu ?? ""}>
                  Caja en {cuenta.currency}
                </option>
              ))}
            </Select>
          </label>

          <label className="w-44">
            <span className="mb-1.5 block text-xs font-medium text-ink-700">Período</span>
            <Input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
          </label>

          <div className="flex gap-2">
            <Boton variante="secundario" onClick={() => void exportar("csv")} disabled={!cbu}>
              Descargar CSV
            </Boton>
            <Boton variante="secundario" onClick={() => void exportar("json")} disabled={!cbu}>
              JSON
            </Boton>
          </div>
        </div>
      </Card>

      {error && <Aviso tono="negativo">{error}</Aviso>}

      {cargandoResumen ? (
        <Skeleton className="h-96 rounded-[var(--radius-card)]" />
      ) : !resumen ? (
        <Card>
          <EstadoVacio titulo="Sin datos" descripcion="Elegí una cuenta y un período." />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs text-ink-500">Gastado en {periodoLegible(resumen.periodo)}</p>
              <p className="tabular mt-1 text-2xl font-semibold text-ink-900">
                {money(resumen.totalGastado, resumen.moneda)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-ink-500">Ingresado</p>
              <p className="tabular mt-1 text-2xl font-semibold text-positive-700">
                {money(resumen.totalIngresado, resumen.moneda)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-ink-500">Movimientos</p>
              <p className="tabular mt-1 text-2xl font-semibold text-ink-900">
                {resumen.cantidadMovimientos}
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader
              titulo="Gastos por categoría"
              descripcion={periodoLegible(resumen.periodo)}
            />
            {resumen.categorias.length === 0 ? (
              <EstadoVacio
                titulo="Sin gastos en el período"
                descripcion="Probá con otro mes."
              />
            ) : (
              <div className="p-5">
                {/* Barra apilada: la proporción de cada categoría de un vistazo. */}
                <div className="flex h-3 overflow-hidden rounded-full">
                  {resumen.categorias.map((categoria, indice) => (
                    <div
                      key={categoria.categoria}
                      style={{
                        width: `${categoria.porcentaje}%`,
                        background: COLORES[indice % COLORES.length],
                      }}
                      title={`${titulo(categoria.categoria)} — ${categoria.porcentaje}%`}
                    />
                  ))}
                </div>

                <ul className="mt-5 space-y-3">
                  {resumen.categorias.map((categoria, indice) => (
                    <li key={categoria.categoria} className="flex items-center gap-3">
                      <span
                        className="size-3 shrink-0 rounded-sm"
                        style={{ background: COLORES[indice % COLORES.length] }}
                        aria-hidden
                      />
                      <span className="flex-1 text-sm text-ink-800">
                        {titulo(categoria.categoria)}
                        <span className="ml-2 text-xs text-ink-400">
                          {categoria.cantidad} mov.
                        </span>
                      </span>
                      <span className="tabular text-sm font-semibold text-ink-900">
                        {money(categoria.total, resumen.moneda)}
                      </span>
                      <span className="tabular w-14 text-right text-xs text-ink-500">
                        {categoria.porcentaje}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
