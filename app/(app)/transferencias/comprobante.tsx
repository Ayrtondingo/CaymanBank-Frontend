"use client";

import type { MovimientoRed } from "@/lib/api";
import { Boton, Modal } from "../../components/ui";
import { fechaHora, money } from "@/lib/format";

/**
 * Comprobante de una transferencia, enviada o recibida.
 *
 * "Descargar PDF" usa la impresion del navegador (Guardar como PDF): no suma
 * dependencias ni carga al servidor. Las reglas de `.comprobante-imprimible`
 * en globals.css hacen que se imprima solo el comprobante, siempre en claro.
 */
export function Comprobante({
  movimiento,
  titular,
  onCerrar,
}: {
  movimiento: MovimientoRed | null;
  /** Nombre del cliente logueado: es el origen si envió, el destino si recibió. */
  titular: string;
  onCerrar: () => void;
}) {
  if (!movimiento) return null;

  const entrante = movimiento.type === "IN";
  const aprobada = movimiento.status === "aprobada";
  const moneda = movimiento.currency ?? "ARS";
  const contraparte = {
    nombre: movimiento.counterpartyName ?? "—",
    cbu: (entrante ? movimiento.from : movimiento.to) ?? "—",
  };
  const propio = { nombre: titular, cbu: movimiento.ownCbu };
  const origen = entrante ? contraparte : propio;
  const destino = entrante ? propio : contraparte;

  function descargar() {
    // El nombre del PDF sale del titulo de la pagina.
    const tituloPrevio = document.title;
    document.title = `Comprobante-${movimiento!.id}`;
    window.print();
    document.title = tituloPrevio;
  }

  return (
    <Modal abierto onCerrar={onCerrar} titulo="Comprobante de transferencia">
      <div className="comprobante-imprimible space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-900">Cayman Bank</p>
            <p className="text-xs text-ink-500">Entidad N.º 19</p>
          </div>
          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              aprobada ? "bg-positive-50 text-positive-700" : "bg-negative-50 text-negative-700",
            ].join(" ")}
          >
            {aprobada ? "Aprobada" : "Rechazada"}
          </span>
        </div>

        <div className="rounded-xl bg-ink-50 px-4 py-4 text-center">
          <p className="text-xs text-ink-500">
            {entrante ? "Transferencia recibida" : "Transferencia enviada"}
          </p>
          <p className="tabular mt-1 text-3xl font-semibold text-ink-900">
            {money(movimiento.amount, moneda)}
          </p>
          <p className="mt-1 text-xs text-ink-500">{fechaHora(movimiento.date)}</p>
        </div>

        <dl className="divide-y divide-ink-100 text-sm">
          <Fila etiqueta="Origen" valor={origen.nombre} detalle={`CBU ${origen.cbu}`} />
          <Fila etiqueta="Destino" valor={destino.nombre} detalle={`CBU ${destino.cbu}`} />
          <Fila etiqueta="Moneda" valor={moneda === "USD" ? "Dólares (USD)" : "Pesos (ARS)"} />
          {movimiento.description && !entrante && (
            <Fila
              etiqueta={aprobada ? "Concepto" : "Motivo del rechazo"}
              valor={movimiento.description}
            />
          )}
          <Fila etiqueta="N.º de operación" valor={String(movimiento.id)} mono />
        </dl>

        <p className="text-[11px] text-ink-400">
          Proyecto académico. Cayman Bank no es una entidad financiera real.
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4 print:hidden">
        <Boton variante="secundario" onClick={onCerrar}>
          Cerrar
        </Boton>
        <Boton onClick={descargar}>Descargar PDF</Boton>
      </div>
    </Modal>
  );
}

function Fila({
  etiqueta,
  valor,
  detalle,
  mono = false,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-ink-500">{etiqueta}</dt>
      <dd className="min-w-0 text-right">
        <p className={["break-all text-ink-900", mono ? "font-mono text-xs" : "font-medium"].join(" ")}>
          {valor}
        </p>
        {detalle && <p className="font-mono text-xs text-ink-500">{detalle}</p>}
      </dd>
    </div>
  );
}
