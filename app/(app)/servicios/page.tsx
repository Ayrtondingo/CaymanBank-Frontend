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
  Select,
  Skeleton,
} from "../../components/ui";
import type { EmpresaServicio, ServicioAdherido } from "@/lib/api";
import { fecha, money } from "@/lib/format";

export default function ServiciosPage() {
  const { api, refrescar, avisar } = useBank();

  const [empresas, setEmpresas] = useState<EmpresaServicio[] | null>(null);
  const [adheridos, setAdheridos] = useState<ServicioAdherido[] | null>(null);
  const [adhiriendo, setAdhiriendo] = useState(false);
  const [pagando, setPagando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    const [emp, adh] = await Promise.allSettled([
      api.empresas(),
      api.serviciosAdheridos(),
    ]);
    setEmpresas(emp.status === "fulfilled" ? emp.value : []);
    setAdheridos(adh.status === "fulfilled" ? adh.value : []);
  }, [api]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function pagar(servicio: ServicioAdherido, facturaId: number, importe: number) {
    setPagando(facturaId);
    try {
      await api.pagarServicio(servicio.empresaId, {
        numeroCliente: servicio.numeroCliente,
        importe,
      });
      avisar("exito", `Pagaste ${money(importe)} de ${servicio.empresa}.`);
      await Promise.all([cargar(), refrescar()]);
    } catch (e) {
      avisar("error", (e as Error).message);
    } finally {
      setPagando(null);
    }
  }

  async function quitar(servicio: ServicioAdherido) {
    try {
      await api.quitarAdhesion(servicio.id);
      avisar("info", `${servicio.empresa} ya no está adherido.`);
      await cargar();
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  const totalGeneral = (adheridos ?? []).reduce((sum, s) => sum + s.totalAdeudado, 0);
  const conVencidas = (adheridos ?? []).filter((s) => s.tieneVencidas).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Pago de servicios
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Adherí tus servicios una vez y después pagalos de un clic.
          </p>
        </div>
        <Boton onClick={() => setAdhiriendo(true)}>Adherir servicio</Boton>
      </header>

      {adheridos && adheridos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs text-ink-500">Total a pagar</p>
            <p className="tabular mt-1 text-2xl font-semibold text-ink-900">
              {money(totalGeneral)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-ink-500">Servicios adheridos</p>
            <p className="tabular mt-1 text-2xl font-semibold text-ink-900">
              {adheridos.length}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-ink-500">Con facturas vencidas</p>
            <p
              className={[
                "tabular mt-1 text-2xl font-semibold",
                conVencidas > 0 ? "text-negative-700" : "text-ink-900",
              ].join(" ")}
            >
              {conVencidas}
            </p>
          </Card>
        </div>
      )}

      {adheridos === null ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : adheridos.length === 0 ? (
        <Card>
          <EstadoVacio
            titulo="No tenés servicios adheridos"
            descripcion="Adherí una empresa con tu número de cliente y vas a ver tus facturas acá, sin tener que buscarlas."
            accion={<Boton onClick={() => setAdhiriendo(true)}>Adherir mi primer servicio</Boton>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {adheridos.map((servicio) => (
            <Card key={servicio.id}>
              <CardHeader
                titulo={servicio.apodo ? `${servicio.empresa} · ${servicio.apodo}` : servicio.empresa}
                descripcion={`${servicio.rubro} · cliente ${servicio.numeroCliente}`}
                accion={
                  <div className="flex items-center gap-3">
                    {servicio.cantidadFacturas > 0 ? (
                      <span className="tabular text-sm font-semibold text-ink-900">
                        {money(servicio.totalAdeudado)}
                      </span>
                    ) : (
                      <Badge tono="positivo">al día</Badge>
                    )}
                    <button
                      onClick={() => void quitar(servicio)}
                      className="text-xs font-medium text-ink-400 transition-colors hover:text-negative-500"
                    >
                      Quitar
                    </button>
                  </div>
                }
              />

              {servicio.facturas.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-ink-500">
                  No tenés facturas pendientes con esta empresa.
                </p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {servicio.facturas.map((factura) => (
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
                        onClick={() => void pagar(servicio, factura.id, factura.importe)}
                      >
                        Pagar
                      </Boton>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}

      <ModalAdherir
        abierto={adhiriendo}
        empresas={empresas ?? []}
        yaAdheridas={(adheridos ?? []).map((s) => s.empresaId)}
        onCerrar={() => setAdhiriendo(false)}
        onHecho={async () => {
          setAdhiriendo(false);
          await cargar();
        }}
      />
    </div>
  );
}

function ModalAdherir({
  abierto,
  empresas,
  yaAdheridas,
  onCerrar,
  onHecho,
}: {
  abierto: boolean;
  empresas: EmpresaServicio[];
  yaAdheridas: number[];
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [empresaId, setEmpresaId] = useState("");
  const [numeroCliente, setNumeroCliente] = useState("");
  const [apodo, setApodo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se ofrecen primero las que todavía no están adheridas.
  const disponibles = empresas.filter((e) => !yaAdheridas.includes(e.id));

  useEffect(() => {
    if (abierto && disponibles[0]) setEmpresaId(String(disponibles[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!numeroCliente.trim()) {
      setError("Ingresá tu número de cliente, el que figura en la factura.");
      return;
    }

    setEnviando(true);
    try {
      await api.adherirServicio(Number(empresaId), {
        numeroCliente: numeroCliente.trim(),
        apodo: apodo.trim() || undefined,
      });
      avisar("exito", "Servicio adherido.");
      setNumeroCliente("");
      setApodo("");
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
      titulo="Adherir servicio"
      descripcion="Una vez adherido, tus facturas aparecen solas."
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Empresa">
          <Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
            {disponibles.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre} — {empresa.rubro}
              </option>
            ))}
          </Select>
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

        <Campo etiqueta="Apodo (opcional)" ayuda="Para distinguir casa de departamento.">
          <Input
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            placeholder="Casa"
          />
        </Campo>

        {disponibles.length === 0 && (
          <Aviso tono="neutro">Ya adheriste todas las empresas disponibles.</Aviso>
        )}

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando} disabled={disponibles.length === 0}>
            Adherir
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
