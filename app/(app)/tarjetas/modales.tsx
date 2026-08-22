"use client";

import { FormEvent, useEffect, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Boton,
  Campo,
  Input,
  Modal,
  Select,
  Skeleton,
} from "../../components/ui";
import type { DatosTarjeta, Tarjeta } from "@/lib/api";
import { money } from "@/lib/format";

/**
 * Datos completos de la tarjeta.
 *
 * Arrancan tapados y se revelan con un clic: si alguien mira la pantalla de
 * reojo no se lleva el número. El pedido al backend se hace igual al abrir,
 * así "mostrar" es instantáneo.
 */
export function ModalDatos({
  tarjeta,
  onCerrar,
}: {
  tarjeta: Tarjeta | null;
  onCerrar: () => void;
}) {
  const { api, perfil, avisar } = useBank();
  const [datos, setDatos] = useState<DatosTarjeta | null>(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tarjeta) {
      setDatos(null);
      setVisible(false);
      setError(null);
      return;
    }
    api
      .datosTarjeta(tarjeta.id)
      .then(setDatos)
      .catch((e) => setError((e as Error).message));
  }, [tarjeta, api]);

  function copiar(valor: string, etiqueta: string) {
    void navigator.clipboard.writeText(valor);
    avisar("info", `${etiqueta} copiado`);
  }

  return (
    <Modal
      abierto={tarjeta !== null}
      onCerrar={onCerrar}
      titulo="Datos de la tarjeta"
      descripcion="Son los que necesitás para pagar en un comercio online."
    >
      {error ? (
        <Aviso tono="negativo">{error}</Aviso>
      ) : !datos ? (
        <div className="space-y-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-11" />
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={[
              "rounded-xl p-5 text-white",
              datos.tipo === "credito"
                ? "bg-gradient-to-br from-brand-800 to-brand-950"
                : "bg-gradient-to-br from-accent-600 to-brand-900",
            ].join(" ")}
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-80">
              Cayman Shadow Bank
            </p>

            <p className="tabular mt-6 text-xl font-medium tracking-[0.12em]">
              {visible ? datos.numero : "•••• •••• •••• ••••"}
            </p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] tracking-wider uppercase opacity-70">Titular</p>
                <p className="truncate text-xs font-medium">
                  {(perfil?.fullName ?? "").toUpperCase()}
                </p>
              </div>
              <div className="flex shrink-0 gap-5 text-right">
                <div>
                  <p className="text-[9px] tracking-wider uppercase opacity-70">Vence</p>
                  <p className="tabular text-xs font-medium">{datos.vencimiento}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-wider uppercase opacity-70">CVV</p>
                  <p className="tabular text-xs font-medium">
                    {visible ? datos.cvv : "•••"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Boton variante="secundario" onClick={() => setVisible((v) => !v)} className="w-full">
            {visible ? "Ocultar datos" : "Mostrar datos"}
          </Boton>

          {visible && (
            <div className="space-y-2">
              {[
                { etiqueta: "Número", copiar: datos.numeroPlano, mostrar: datos.numero },
                { etiqueta: "Vencimiento", copiar: datos.vencimiento, mostrar: datos.vencimiento },
                { etiqueta: "CVV", copiar: datos.cvv, mostrar: datos.cvv },
              ].map((fila) => (
                <div
                  key={fila.etiqueta}
                  className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 px-4 py-2.5"
                >
                  <span className="text-xs text-ink-500">{fila.etiqueta}</span>
                  <div className="flex items-center gap-3">
                    <span className="tabular text-sm font-medium text-ink-900">
                      {fila.mostrar}
                    </span>
                    <button
                      onClick={() => copiar(fila.copiar, fila.etiqueta)}
                      className="text-xs font-semibold text-accent-600 hover:text-accent-700"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Aviso tono="advertencia">
            No compartas estos datos con nadie. El banco nunca te los va a pedir por
            teléfono ni por mail.
          </Aviso>
        </div>
      )}
    </Modal>
  );
}

/** Simula un consumo: es lo que haría un comercio al cobrarte. */
export function ModalPagar({
  tarjeta,
  onCerrar,
  onHecho,
}: {
  tarjeta: Tarjeta | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, refrescar, avisar } = useBank();
  const [comercio, setComercio] = useState("");
  const [monto, setMonto] = useState("");
  const [cuotas, setCuotas] = useState("1");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const credito = tarjeta?.tipo === "credito";

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!tarjeta) return;
    setError(null);

    const valor = Number(monto);

    if (!comercio.trim()) {
      setError("Ingresá el nombre del comercio.");
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("El importe debe ser mayor a cero.");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await api.autorizarConsumo(tarjeta.id, {
        comercio: comercio.trim(),
        monto: valor,
        cuotas: credito ? Number(cuotas) : 1,
      });

      // Un rechazo no llega como error HTTP: viene con estado y motivo.
      if (resultado.estado === "rechazada") {
        setError(resultado.motivo ?? "El consumo fue rechazado.");
      } else {
        avisar("exito", `Pago de ${money(valor)} aprobado en ${comercio.trim()}.`);
        setComercio("");
        setMonto("");
        await refrescar();
        onHecho();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={tarjeta !== null}
      onCerrar={onCerrar}
      titulo="Pagar con la tarjeta"
      descripcion={
        credito
          ? `Se descuenta del límite disponible · ${money(tarjeta?.limiteDisponible ?? 0)}`
          : "Se descuenta de tu caja de ahorro"
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Comercio">
          <Input
            autoFocus
            value={comercio}
            onChange={(e) => setComercio(e.target.value)}
            placeholder="Supermercado, farmacia, tienda online…"
          />
        </Campo>

        <Campo etiqueta="Importe">
          <Input
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0,00"
          />
        </Campo>

        {credito && (
          <Campo etiqueta="Cuotas">
            <Select value={cuotas} onChange={(e) => setCuotas(e.target.value)}>
              {[1, 3, 6, 12, 18].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 pago" : `${n} cuotas`}
                </option>
              ))}
            </Select>
          </Campo>
        )}

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Autorizar pago
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
