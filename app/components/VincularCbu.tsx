"use client";

import { FormEvent, useState } from "react";
import { useBank } from "./BankProvider";
import { Aviso, Boton, Campo, Input, Modal } from "./ui";

/**
 * Aviso + alta en el Banco Central.
 *
 * Hasta que la persona no está registrada allá no tiene CBU, y sin CBU no puede
 * transferir ni recibir plata: por eso esto bloquea visualmente el inicio.
 */
export function VincularCbu() {
  const { api, refrescar, avisar } = useBank();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState({ nombre: "", apellido: "", dni: "", alias: "" });

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!/^\d{7,8}$/.test(datos.dni.trim())) {
      setError("El DNI tiene que tener 7 u 8 dígitos, sin puntos.");
      return;
    }

    setEnviando(true);
    try {
      await api.sincronizarCbu({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        dni: datos.dni.trim(),
        alias: datos.alias.trim() || undefined,
      });
      await refrescar();
      avisar("exito", "Tu cuenta quedó activa. Ya podés operar.");
      setAbierto(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-warning-500/30 bg-warning-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-warning-700">Activá tu cuenta</p>
          <p className="mt-0.5 text-sm text-ink-600">
            Todavía no tenés CBU. Registrate en el Banco Central para poder transferir y
            recibir dinero.
          </p>
        </div>
        <Boton onClick={() => setAbierto(true)} className="shrink-0">
          Activar ahora
        </Boton>
      </div>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Activar cuenta"
        descripcion="Tus datos se registran en el Banco Central, que asigna el CBU."
      >
        <form onSubmit={enviar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre">
              <Input
                required
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                placeholder="Juan"
                autoComplete="given-name"
              />
            </Campo>
            <Campo etiqueta="Apellido">
              <Input
                required
                value={datos.apellido}
                onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
                placeholder="Pérez"
                autoComplete="family-name"
              />
            </Campo>
          </div>

          <Campo etiqueta="DNI" ayuda="Sin puntos ni espacios.">
            <Input
              required
              inputMode="numeric"
              value={datos.dni}
              onChange={(e) => setDatos({ ...datos, dni: e.target.value.replace(/\D/g, "") })}
              placeholder="30123456"
              maxLength={8}
            />
          </Campo>

          <Campo
            etiqueta="Alias (opcional)"
            ayuda="Letras, números, puntos y guiones. Tiene que ser único en todo el sistema."
          >
            <Input
              value={datos.alias}
              onChange={(e) => setDatos({ ...datos, alias: e.target.value })}
              placeholder="juan.perez.cayman"
            />
          </Campo>

          {error && <Aviso tono="negativo">{error}</Aviso>}

          <div className="flex justify-end gap-2 pt-2">
            <Boton type="button" variante="secundario" onClick={() => setAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" cargando={enviando}>
              Activar cuenta
            </Boton>
          </div>
        </form>
      </Modal>
    </>
  );
}
