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
} from "../../components/ui";
import type { SolicitudPrestamo } from "@/lib/api";
import { fechaHora, money, percent } from "@/lib/format";

/** 1 normal … 5 irrecuperable. El color acompaña la gravedad. */
const SITUACIONES: Record<number, { texto: string; tono: "positivo" | "advertencia" | "negativo" }> = {
  1: { texto: "Normal", tono: "positivo" },
  2: { texto: "Riesgo bajo", tono: "advertencia" },
  3: { texto: "Con problemas", tono: "advertencia" },
  4: { texto: "Riesgo alto", tono: "negativo" },
  5: { texto: "Irrecuperable", tono: "negativo" },
};

export function SolicitudesPrestamo({ esGerente }: { esGerente: boolean }) {
  const { api, avisar } = useBank();

  const [solicitudes, setSolicitudes] = useState<SolicitudPrestamo[] | null>(null);
  const [resolviendo, setResolviendo] = useState<number | null>(null);
  const [rechazando, setRechazando] = useState<SolicitudPrestamo | null>(null);

  const cargar = useCallback(async () => {
    if (!esGerente) {
      setSolicitudes([]);
      return;
    }
    try {
      setSolicitudes(await api.solicitudesPendientes());
    } catch {
      setSolicitudes([]);
    }
  }, [api, esGerente]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function aprobar(solicitud: SolicitudPrestamo) {
    setResolviendo(solicitud.id);
    try {
      await api.aprobarSolicitud(solicitud.id);
      avisar(
        "exito",
        `Préstamo de ${money(solicitud.monto)} aprobado para ${solicitud.cliente.nombre}.`,
      );
      await cargar();
    } catch (e) {
      avisar("error", (e as Error).message);
    } finally {
      setResolviendo(null);
    }
  }

  // El personal que no es gerente no ve esta sección.
  if (!esGerente) return null;

  return (
    <>
      <Card>
        <CardHeader
          titulo="Solicitudes de préstamo a revisar"
          descripcion="Quedaron pendientes porque no pasaron el control automático de la central de deudores."
          accion={
            solicitudes && solicitudes.length > 0 ? (
              <Badge tono="advertencia">{solicitudes.length} pendiente(s)</Badge>
            ) : undefined
          }
        />

        {solicitudes === null ? (
          <div className="space-y-2 p-5">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : solicitudes.length === 0 ? (
          <EstadoVacio
            titulo="No hay solicitudes pendientes"
            descripcion="Las que pasan el control automático se aprueban solas."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {solicitudes.map((solicitud) => (
              <li key={solicitud.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {solicitud.cliente.nombre}
                      <span className="ml-2 text-xs font-normal text-ink-500">
                        DNI {solicitud.cliente.dni ?? "—"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      Solicitado el {fechaHora(solicitud.fechaSolicitud)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Boton
                      cargando={resolviendo === solicitud.id}
                      onClick={() => void aprobar(solicitud)}
                    >
                      Aprobar
                    </Boton>
                    <Boton variante="peligro" onClick={() => setRechazando(solicitud)}>
                      Rechazar
                    </Boton>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Monto", money(solicitud.monto)],
                    ["Plazo", `${solicitud.plazoMeses} cuotas`],
                    ["Cuota", money(solicitud.cuota)],
                    ["TNA", percent(solicitud.tna)],
                  ].map(([etiqueta, valor]) => (
                    <div key={etiqueta} className="rounded-lg bg-ink-50 px-3 py-2">
                      <dt className="text-[11px] text-ink-500">{etiqueta}</dt>
                      <dd className="tabular text-sm font-semibold text-ink-900">{valor}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3">
                  <p className="text-xs font-semibold text-warning-700">
                    Motivo de la revisión
                  </p>
                  <p className="mt-0.5 text-sm text-ink-700">
                    {solicitud.motivoRevision ?? "Sin motivo registrado"}
                  </p>
                </div>

                <InformeDelCentral informe={solicitud.informeCentral} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ModalRechazar
        solicitud={rechazando}
        onCerrar={() => setRechazando(null)}
        onHecho={async () => {
          setRechazando(null);
          await cargar();
        }}
      />
    </>
  );
}

/** Lo que respondió la central de deudores cuando se pidió el préstamo. */
function InformeDelCentral({
  informe,
}: {
  informe: SolicitudPrestamo["informeCentral"];
}) {
  if (!informe) {
    return (
      <p className="mt-3 text-xs text-ink-500">
        No se pudo consultar la central de deudores al momento de la solicitud.
      </p>
    );
  }

  const situacion = SITUACIONES[informe.situacion] ?? {
    texto: `Situación ${informe.situacion}`,
    tono: "neutro" as const,
  };

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-ink-200">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50 px-4 py-2.5">
        <p className="text-xs font-semibold text-ink-700">
          Respuesta del Banco Central
        </p>
        <Badge tono={situacion.tono}>
          Situación {informe.situacion} · {situacion.texto}
        </Badge>
      </div>

      {informe.deudas.length === 0 ? (
        <p className="px-4 py-3 text-sm text-ink-500">
          Sin deudas informadas por ninguna entidad.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left">
              {["Entidad", "Monto", "Situación"].map((c) => (
                <th
                  key={c}
                  className="px-4 py-2 text-[11px] font-medium tracking-wide text-ink-500 uppercase"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {informe.deudas.map((deuda, indice) => (
              <tr key={`${deuda.entidad}-${indice}`}>
                <td className="px-4 py-2 text-ink-900">{deuda.entidad}</td>
                <td className="tabular px-4 py-2 font-medium text-ink-900">
                  {money(deuda.monto)}
                </td>
                <td className="px-4 py-2">
                  <Badge tono={SITUACIONES[deuda.situacion]?.tono ?? "neutro"}>
                    {deuda.situacion} · {SITUACIONES[deuda.situacion]?.texto ?? "—"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ModalRechazar({
  solicitud,
  onCerrar,
  onHecho,
}: {
  solicitud: SolicitudPrestamo | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!solicitud) return;
    setError(null);
    setEnviando(true);
    try {
      await api.rechazarSolicitud(solicitud.id, motivo.trim() || undefined);
      avisar("info", `Solicitud de ${solicitud.cliente.nombre} rechazada.`);
      setMotivo("");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={solicitud !== null}
      onCerrar={onCerrar}
      titulo="Rechazar solicitud"
      descripcion={
        solicitud
          ? `${solicitud.cliente.nombre} · ${money(solicitud.monto)}`
          : undefined
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo
          etiqueta="Motivo del rechazo"
          ayuda="Queda registrado en la solicitud. Si lo dejás vacío se usa uno genérico."
        >
          <Input
            autoFocus
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Deuda vigente en otra entidad"
            maxLength={120}
          />
        </Campo>

        <Aviso tono="neutro">
          El cliente no recibe el dinero y la solicitud queda cerrada. Puede volver a
          pedir cuando regularice su situación.
        </Aviso>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" variante="peligro" cargando={enviando}>
            Rechazar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
