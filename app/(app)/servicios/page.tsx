"use client";

import { FormEvent, useEffect, useState } from "react";
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
  Select,
  Skeleton,
} from "../../components/ui";
import type { DeudaServicio, EmpresaServicio } from "@/lib/api";
import { fecha, money } from "@/lib/format";

export default function ServiciosPage() {
  const { api, refrescar, avisar } = useBank();

  const [empresas, setEmpresas] = useState<EmpresaServicio[] | null>(null);
  const [empresaId, setEmpresaId] = useState("");
  const [numeroCliente, setNumeroCliente] = useState("");
  const [deuda, setDeuda] = useState<DeudaServicio | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [pagando, setPagando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .empresas()
      .then((lista) => {
        setEmpresas(lista);
        if (lista[0]) setEmpresaId(String(lista[0].id));
      })
      .catch(() => setEmpresas([]));
  }, [api]);

  async function buscar(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setDeuda(null);

    if (!numeroCliente.trim()) {
      setError("Ingresá tu número de cliente de la empresa.");
      return;
    }

    setBuscando(true);
    try {
      setDeuda(await api.deudaServicio(Number(empresaId), numeroCliente.trim()));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  async function pagar(importe: number, facturaId: number) {
    setPagando(facturaId);
    try {
      await api.pagarServicio(Number(empresaId), {
        numeroCliente: numeroCliente.trim(),
        importe,
      });
      avisar("exito", `Pagaste ${money(importe)}.`);
      setDeuda(await api.deudaServicio(Number(empresaId), numeroCliente.trim()));
      await refrescar();
    } catch (e) {
      avisar("error", (e as Error).message);
    } finally {
      setPagando(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Pago de servicios</h1>
        <p className="mt-1 text-sm text-ink-500">
          Consultá tu deuda con las empresas adheridas y pagala desde tu caja de ahorro.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader titulo="Consultar deuda" />
          <form onSubmit={buscar} className="space-y-4 p-5">
            <Campo etiqueta="Empresa">
              {empresas === null ? (
                <Skeleton className="h-11" />
              ) : (
                <Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre} — {empresa.rubro}
                    </option>
                  ))}
                </Select>
              )}
            </Campo>

            <Campo
              etiqueta="Número de cliente"
              ayuda="El que figura en tu factura, no tu DNI."
            >
              <Input
                value={numeroCliente}
                onChange={(e) => setNumeroCliente(e.target.value)}
                placeholder="55501234"
              />
            </Campo>

            {error && <Aviso tono="negativo">{error}</Aviso>}

            <Boton type="submit" cargando={buscando} className="w-full">
              Consultar
            </Boton>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            titulo="Facturas pendientes"
            descripcion={deuda ? deuda.empresa : "Consultá una empresa para ver tu deuda"}
          />

          {!deuda ? (
            <EstadoVacio
              titulo="Sin consulta"
              descripcion="Elegí una empresa e ingresá tu número de cliente."
            />
          ) : deuda.facturas.length === 0 ? (
            <EstadoVacio
              titulo="No tenés deuda"
              descripcion={`No hay facturas pendientes para el cliente ${deuda.numeroCliente}.`}
            />
          ) : (
            <>
              <div className="border-b border-ink-100 bg-ink-50 px-5 py-3">
                <p className="text-xs text-ink-500">Total adeudado</p>
                <p className="tabular text-2xl font-semibold text-ink-900">
                  {money(deuda.totalAdeudado)}
                </p>
              </div>
              <ul className="divide-y divide-ink-100">
                {deuda.facturas.map((factura) => (
                  <li
                    key={factura.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="tabular text-sm font-semibold text-ink-900">
                          {money(factura.importe)}
                        </p>
                        {factura.vencida && <Badge tono="negativo">Vencida</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">
                        Vence el {fecha(factura.vencimiento)}
                      </p>
                    </div>
                    <Boton
                      cargando={pagando === factura.id}
                      onClick={() => void pagar(factura.importe, factura.id)}
                    >
                      Pagar
                    </Boton>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
