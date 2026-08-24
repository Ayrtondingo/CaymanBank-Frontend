"use client";

import { FormEvent, useState } from "react";
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
import type { Contacto, Moneda } from "@/lib/api";
import { cbuCorto, inicialesDe, relativo } from "@/lib/format";

export function Contactos({
  contactos,
  moneda,
  onElegir,
  onCambio,
}: {
  contactos: Contacto[] | null;
  /** Solo se ofrecen los de la misma moneda: el Central no permite mezclarlas. */
  moneda: Moneda;
  onElegir: (contacto: Contacto) => void;
  onCambio: () => void;
}) {
  const { api, avisar } = useBank();
  const [editando, setEditando] = useState<Contacto | null>(null);
  const [borrando, setBorrando] = useState<number | null>(null);

  async function borrar(contacto: Contacto) {
    setBorrando(contacto.id);
    try {
      await api.borrarContacto(contacto.id);
      avisar("info", "Contacto eliminado de la agenda.");
      onCambio();
    } catch (e) {
      avisar("error", (e as Error).message);
    } finally {
      setBorrando(null);
    }
  }

  const visibles = (contactos ?? []).filter((c) => c.moneda === moneda);

  return (
    <>
      <Card>
        <CardHeader
          titulo="Contactos"
          descripcion={`Destinatarios en ${moneda === "ARS" ? "pesos" : "dólares"}. Se guardan solos al transferir.`}
        />

        {contactos === null ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no tenés contactos"
            descripcion="Cuando completes una transferencia, el destinatario queda guardado acá para la próxima."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {visibles.map((contacto) => (
              <li
                key={contacto.id}
                className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50"
              >
                <button
                  onClick={() => onElegir(contacto)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                    {inicialesDe(contacto.nombre ?? contacto.alias ?? "?")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">
                      {contacto.nombre ?? contacto.alias ?? cbuCorto(contacto.cbu)}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {contacto.alias ?? cbuCorto(contacto.cbu)}
                      {contacto.bankCode ? ` · entidad ${contacto.bankCode}` : ""}
                      {contacto.ultimoUso ? ` · ${relativo(contacto.ultimoUso)}` : ""}
                    </span>
                  </span>

                  {contacto.vecesUsado > 1 && (
                    <Badge>{contacto.vecesUsado} envíos</Badge>
                  )}
                </button>

                {/* Acciones: aparecen al pasar el mouse, para no cargar la fila. */}
                <span className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    onClick={() => setEditando(contacto)}
                    aria-label="Renombrar contacto"
                    className="rounded px-2 py-1 text-xs font-semibold text-accent-600 hover:bg-accent-50"
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => void borrar(contacto)}
                    disabled={borrando === contacto.id}
                    aria-label="Eliminar contacto"
                    className="rounded px-2 py-1 text-xs font-semibold text-ink-400 hover:bg-negative-50 hover:text-negative-700 disabled:opacity-50"
                  >
                    Quitar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ModalRenombrar
        contacto={editando}
        onCerrar={() => setEditando(null)}
        onHecho={() => {
          setEditando(null);
          onCambio();
        }}
      />
    </>
  );
}

function ModalRenombrar({
  contacto,
  onCerrar,
  onHecho,
}: {
  contacto: Contacto | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [apodo, setApodo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!contacto) return;
    setError(null);
    setEnviando(true);
    try {
      await api.renombrarContacto(contacto.id, apodo.trim());
      avisar("exito", "Contacto renombrado.");
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
      abierto={contacto !== null}
      onCerrar={onCerrar}
      titulo="Renombrar contacto"
      descripcion={contacto?.nombreTitular ?? contacto?.cbu}
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo
          etiqueta="Cómo querés que aparezca"
          ayuda="Dejalo vacío para volver al nombre que informa el Banco Central."
        >
          <Input
            autoFocus
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            placeholder={contacto?.nombreTitular ?? "Mamá, Alquiler, Juan del trabajo…"}
            maxLength={40}
          />
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Guardar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
