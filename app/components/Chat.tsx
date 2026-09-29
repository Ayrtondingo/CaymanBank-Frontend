"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Aviso, Boton, Input } from "./ui";
import { MensajeChat, preguntarAsistente } from "@/lib/api";

/**
 * Globo del asistente, abajo a la izquierda de la landing.
 *
 * Responde preguntas generales sobre el banco y no ve ninguna cuenta, así que
 * funciona sin iniciar sesión. La conversación vive solo en esta pestaña.
 */

const SUGERENCIAS = [
  "¿Qué productos ofrecen?",
  "¿Cómo abro una cuenta?",
  "¿Qué es un plazo fijo?",
  "¿Qué diferencia hay entre CBU y alias?",
];

export function ChatFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, pensando]);

  async function enviar(mensaje: string) {
    const limpio = mensaje.trim();
    if (!limpio || pensando) return;

    const historial = mensajes;
    setError(null);
    setTexto("");
    setMensajes([...historial, { role: "user", content: limpio }]);
    setPensando(true);

    try {
      const respuesta = await preguntarAsistente(limpio, historial);
      setMensajes((previos) => [...previos, { role: "assistant", content: respuesta }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPensando(false);
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-40">
      {abierto && (
        <div
          role="dialog"
          aria-label="Asistente"
          className="animate-fade-up absolute bottom-16 left-0 flex h-[min(560px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 bg-brand-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Asistente de Cayman Bank</p>
              <p className="text-xs text-brand-100">Consultas generales sobre el banco</p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
              className="rounded-lg p-1 text-brand-100 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {mensajes.length === 0 && !pensando && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <IconoChat className="size-6" />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink-800">¿En qué te puedo ayudar?</p>
                <p className="mt-1 max-w-sm text-sm text-ink-500">
                  Respondo dudas sobre nuestros productos. Para ver datos de tu cuenta, ingresá al
                  homebanking.
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
                className={mensaje.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    mensaje.role === "user"
                      ? "rounded-br-sm bg-brand-900 text-white"
                      : "rounded-bl-sm bg-ink-100 text-ink-800",
                  ].join(" ")}
                >
                  {mensaje.content}
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
              maxLength={500}
              disabled={pensando}
            />
            <Boton type="submit" cargando={pensando} disabled={!texto.trim()}>
              Enviar
            </Boton>
          </form>
        </div>
      )}

      <button
        onClick={() => setAbierto((valor) => !valor)}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
        aria-expanded={abierto}
        className="flex size-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
      >
        <IconoChat className="size-6" />
      </button>
    </div>
  );
}

function IconoChat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}
