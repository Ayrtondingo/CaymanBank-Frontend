"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useBank } from "../../components/BankProvider";
import { Aviso, Boton, Card, Input, Modal, Campo } from "../../components/ui";
import { titulo } from "@/lib/format";

interface Burbuja {
  rol: "user" | "assistant";
  texto: string;
  pendientes?: { accion: string; parametros: unknown; motivo: string }[];
}

const SUGERENCIAS = [
  "¿Cuánto tengo en mis cuentas?",
  "¿En qué gasté este mes?",
  "Mostrame mis últimos movimientos",
  "Bloqueá mi tarjeta, la perdí",
];

export default function AsistentePage() {
  const { api, refrescar, avisar } = useBank();

  const [mensajes, setMensajes] = useState<Burbuja[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escalando, setEscalando] = useState(false);
  const [pendientes, setPendientes] = useState<Burbuja["pendientes"]>();

  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .historialChat()
      .then((historial) =>
        setMensajes(
          historial.map((m) => ({ rol: m.rol as "user" | "assistant", texto: m.texto })),
        ),
      )
      .catch(() => setMensajes([]));
  }, [api]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, pensando]);

  async function enviar(mensaje: string, confirmar = false) {
    const limpio = mensaje.trim();
    if (!limpio || pensando) return;

    setError(null);
    setTexto("");
    setPendientes(undefined);
    setMensajes((previos) => [...previos, { rol: "user", texto: limpio }]);
    setPensando(true);

    try {
      const respuesta = await api.enviarMensaje(limpio, confirmar);

      setMensajes((previos) => [
        ...previos,
        {
          rol: "assistant",
          texto: respuesta.respuesta,
          pendientes: respuesta.accionesPendientes,
        },
      ]);

      if (respuesta.accionesPendientes.length > 0) {
        setPendientes(respuesta.accionesPendientes);
      }

      // Si el asistente ejecutó algo, los saldos de la barra pueden haber cambiado.
      if (respuesta.accionesEjecutadas.length > 0) await refrescar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPensando(false);
    }
  }

  async function confirmarAcciones() {
    // Se reenvía el último mensaje del cliente, ahora con la autorización.
    const ultimo = [...mensajes].reverse().find((m) => m.rol === "user");
    if (ultimo) await enviar(ultimo.texto, true);
  }

  async function limpiar() {
    try {
      await api.limpiarChat();
      setMensajes([]);
      setPendientes(undefined);
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Asistente</h1>
          <p className="mt-1 text-sm text-ink-500">
            Consultá tus productos y resolvé gestiones simples.
          </p>
        </div>
        <div className="flex gap-2">
          <Boton variante="secundario" onClick={() => setEscalando(true)}>
            Hablar con una persona
          </Boton>
          {mensajes.length > 0 && (
            <Boton variante="fantasma" onClick={() => void limpiar()}>
              Limpiar
            </Boton>
          )}
        </div>
      </header>

      <Card className="flex h-[min(70vh,640px)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {mensajes.length === 0 && !pensando && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M21 12a8 8 0 1 1-3.2-6.4M21 4v5h-5" />
                </svg>
              </span>
              <p className="mt-3 text-sm font-semibold text-ink-800">
                ¿En qué te puedo ayudar?
              </p>
              <p className="mt-1 max-w-sm text-sm text-ink-500">
                Puedo consultar tus saldos, movimientos, tarjetas y préstamos.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGERENCIAS.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    onClick={() => void enviar(sugerencia)}
                    className="rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-700 transition-colors hover:border-accent-500 hover:text-accent-700"
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((mensaje, indice) => (
            <div
              key={indice}
              className={mensaje.rol === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={[
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                  mensaje.rol === "user"
                    ? "rounded-br-sm bg-brand-900 text-white"
                    : "rounded-bl-sm bg-ink-100 text-ink-800",
                ].join(" ")}
              >
                {mensaje.texto}
              </div>
            </div>
          ))}

          {pensando && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl rounded-bl-sm bg-ink-100 px-4 py-3">
                {[0, 150, 300].map((retraso) => (
                  <span
                    key={retraso}
                    className="size-1.5 animate-bounce rounded-full bg-ink-400"
                    style={{ animationDelay: `${retraso}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={finRef} />
        </div>

        {/* Confirmación de acciones: el asistente no cambia nada sin este paso. */}
        {pendientes && pendientes.length > 0 && (
          <div className="border-t border-warning-500/30 bg-warning-50 px-5 py-3">
            <p className="text-xs font-semibold text-warning-700">
              El asistente necesita tu confirmación
            </p>
            <ul className="mt-1 space-y-0.5">
              {pendientes.map((pendiente, indice) => (
                <li key={indice} className="text-xs text-ink-700">
                  {titulo(pendiente.accion)} — {JSON.stringify(pendiente.parametros)}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <Boton onClick={() => void confirmarAcciones()}>Confirmar</Boton>
              <Boton variante="secundario" onClick={() => setPendientes(undefined)}>
                Cancelar
              </Boton>
            </div>
          </div>
        )}

        {error && (
          <div className="border-t border-ink-100 px-5 py-3">
            <Aviso tono="negativo">{error}</Aviso>
          </div>
        )}

        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void enviar(texto);
          }}
          className="flex gap-2 border-t border-ink-100 p-4"
        >
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí tu consulta…"
            disabled={pensando}
          />
          <Boton type="submit" cargando={pensando} disabled={!texto.trim()}>
            Enviar
          </Boton>
        </form>
      </Card>

      <ModalEscalar abierto={escalando} onCerrar={() => setEscalando(false)} />
    </div>
  );
}

function ModalEscalar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { api, avisar } = useBank();
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const resultado = await api.escalar(motivo.trim());
      avisar("exito", `Tu consulta #${resultado.id} fue derivada a un representante.`);
      setMotivo("");
      onCerrar();
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
      titulo="Hablar con una persona"
      descripcion="Un representante va a retomar tu consulta."
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Motivo">
          <textarea
            required
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Contanos qué necesitás resolver…"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500"
          />
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Derivar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
