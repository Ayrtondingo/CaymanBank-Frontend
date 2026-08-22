"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Boton,
  Campo,
  Card,
  CardHeader,
  EstadoBadge,
  EstadoVacio,
  Input,
  Select,
  Skeleton,
} from "../../components/ui";
import { fechaHora, money } from "@/lib/format";

interface Recarga {
  id: number;
  fecha: string;
  operadora: string;
  numero: string;
  monto: number;
  estado: string;
  motivo: string | null;
}

const MONTOS = [500, 1000, 2000, 5000];

export default function RecargasPage() {
  const { api, refrescar, avisar } = useBank();

  const [operadoras, setOperadoras] = useState<{ id: string; nombre: string }[]>([]);
  const [operadora, setOperadora] = useState("");
  const [numero, setNumero] = useState("");
  const [monto, setMonto] = useState("1000");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<Recarga[] | null>(null);

  const cargarHistorial = useCallback(async () => {
    try {
      setHistorial((await api.recargas()) as Recarga[]);
    } catch {
      setHistorial([]);
    }
  }, [api]);

  useEffect(() => {
    api
      .operadoras()
      .then((lista) => {
        setOperadoras(lista);
        if (lista[0]) setOperadora(lista[0].id);
      })
      .catch(() => setOperadoras([]));
    void cargarHistorial();
  }, [api, cargarHistorial]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!/^\d{10}$/.test(numero)) {
      setError("El número tiene que tener 10 dígitos, sin 0 ni 15.");
      return;
    }

    setEnviando(true);
    try {
      const resultado = await api.recargar({
        operadora,
        numero,
        monto: Number(monto),
      });

      // Un rechazo del backend no es un error HTTP: viene con estado y motivo.
      if (resultado.estado === "rechazada") {
        setError(resultado.motivo ?? "La recarga fue rechazada.");
      } else {
        avisar("exito", `Recargaste ${money(Number(monto))} en ${numero}.`);
        setNumero("");
        await refrescar();
      }
      await cargarHistorial();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Recarga de celular
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Cargá saldo prepago en cualquier línea, desde tu caja de ahorro en pesos.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader titulo="Nueva recarga" />
          <form onSubmit={enviar} className="space-y-4 p-5">
            <Campo etiqueta="Operadora">
              <Select value={operadora} onChange={(e) => setOperadora(e.target.value)}>
                {operadoras.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </Select>
            </Campo>

            <Campo etiqueta="Número" ayuda="10 dígitos con código de área, sin 0 ni 15.">
              <Input
                inputMode="numeric"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="1145678901"
              />
            </Campo>

            <Campo etiqueta="Importe">
              <div className="mb-2 grid grid-cols-4 gap-2">
                {MONTOS.map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setMonto(String(valor))}
                    className={[
                      "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                      monto === String(valor)
                        ? "border-brand-900 bg-brand-900 text-white"
                        : "border-ink-200 text-ink-700 hover:border-ink-300",
                    ].join(" ")}
                  >
                    ${valor}
                  </button>
                ))}
              </div>
              <Input
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))}
              />
            </Campo>

            {error && <Aviso tono="negativo">{error}</Aviso>}

            <Boton type="submit" cargando={enviando} className="w-full">
              Recargar
            </Boton>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader titulo="Historial" />
          {historial === null ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : historial.length === 0 ? (
            <EstadoVacio titulo="Sin recargas" descripcion="Tus recargas van a aparecer acá." />
          ) : (
            <ul className="divide-y divide-ink-100">
              {historial.map((recarga) => (
                <li key={recarga.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900">
                        <span className="capitalize">{recarga.operadora}</span> · {recarga.numero}
                      </p>
                      <p className="text-xs text-ink-500">{fechaHora(recarga.fecha)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="tabular text-sm font-semibold text-ink-900">
                        {money(recarga.monto)}
                      </span>
                      <EstadoBadge estado={recarga.estado} />
                    </div>
                  </div>
                  {recarga.motivo && (
                    <p className="mt-1 text-xs text-negative-700">{recarga.motivo}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
