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
  Modal,
  Skeleton,
} from "../../components/ui";
import type { Poliza, ProductoSeguro } from "@/lib/api";
import { fecha, money } from "@/lib/format";

interface Beneficiario {
  nombre: string;
  dni: string;
  porcentaje: number;
}

export default function SegurosPage() {
  const { api, refrescar, avisar } = useBank();

  const [productos, setProductos] = useState<ProductoSeguro[] | null>(null);
  const [polizas, setPolizas] = useState<Poliza[] | null>(null);
  const [contratando, setContratando] = useState<ProductoSeguro | null>(null);
  const [denunciando, setDenunciando] = useState<Poliza | null>(null);

  const cargar = useCallback(async () => {
    const [prods, pols] = await Promise.allSettled([api.productosSeguro(), api.polizas()]);
    setProductos(prods.status === "fulfilled" ? prods.value : []);
    setPolizas(pols.status === "fulfilled" ? pols.value : []);
  }, [api]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Seguros</h1>
        <p className="mt-1 text-sm text-ink-500">
          Cotizá y contratá coberturas. La prima se cobra de tu caja de ahorro en pesos.
        </p>
      </header>

      <Card>
        <CardHeader titulo="Mis pólizas" />
        {polizas === null ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-14" />
          </div>
        ) : polizas.length === 0 ? (
          <EstadoVacio
            titulo="No tenés pólizas"
            descripcion="Elegí una cobertura del catálogo de abajo."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {polizas.map((poliza) => (
              <li
                key={poliza.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{poliza.producto}</p>
                    <EstadoBadge estado={poliza.estado} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">
                    Suma asegurada {money(poliza.sumaAsegurada)} · prima{" "}
                    {money(poliza.prima)}/mes · desde {fecha(poliza.fechaAlta)}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    Beneficiarios:{" "}
                    {poliza.beneficiarios
                      .map((b) => `${b.nombre} (${b.porcentaje}%)`)
                      .join(", ")}
                  </p>
                </div>
                <Boton variante="secundario" onClick={() => setDenunciando(poliza)}>
                  Denunciar siniestro
                </Boton>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">Coberturas disponibles</h2>
        {productos === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-32 rounded-[var(--radius-card)]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {productos.map((producto) => (
              <Card key={producto.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3 4.5 6v6c0 4.5 3.2 7.9 7.5 9 4.3-1.1 7.5-4.5 7.5-9V6z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{producto.nombre}</p>
                    <p className="mt-0.5 text-xs text-ink-500 capitalize">{producto.tipo}</p>
                  </div>
                </div>
                <Boton
                  variante="secundario"
                  onClick={() => setContratando(producto)}
                  className="mt-4 w-full"
                >
                  Cotizar y contratar
                </Boton>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ModalContratar
        producto={contratando}
        onCerrar={() => setContratando(null)}
        onHecho={async () => {
          setContratando(null);
          await Promise.all([cargar(), refrescar()]);
        }}
      />

      <ModalSiniestro
        poliza={denunciando}
        onCerrar={() => setDenunciando(null)}
        onHecho={() => {
          setDenunciando(null);
          avisar("exito", "Tu denuncia quedó registrada y está en análisis.");
        }}
      />
    </div>
  );
}

function ModalContratar({
  producto,
  onCerrar,
  onHecho,
}: {
  producto: ProductoSeguro | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [suma, setSuma] = useState("5000000");
  const [edad, setEdad] = useState("35");
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([
    { nombre: "", dni: "", porcentaje: 100 },
  ]);
  const [prima, setPrima] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La prima se recotiza sola al cambiar suma o edad, con un debounce corto
  // para no pegarle a la API en cada tecla.
  useEffect(() => {
    if (!producto) return;
    const id = setTimeout(() => {
      api
        .cotizarSeguro(producto.id, Number(suma), Number(edad))
        .then((r) => setPrima(r.prima))
        .catch(() => setPrima(null));
    }, 350);
    return () => clearTimeout(id);
  }, [producto, suma, edad, api]);

  const total = beneficiarios.reduce((sum, b) => sum + Number(b.porcentaje || 0), 0);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!producto) return;
    setError(null);

    if (Math.abs(total - 100) > 0.01) {
      setError(`Los beneficiarios tienen que sumar 100%. Ahora suman ${total}%.`);
      return;
    }

    setEnviando(true);
    try {
      await api.contratarPoliza({
        productoId: producto.id,
        sumaAsegurada: Number(suma),
        edad: Number(edad),
        beneficiarios: beneficiarios.map((b) => ({ ...b, porcentaje: Number(b.porcentaje) })),
      });
      avisar("exito", "Póliza contratada.");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  function actualizar(indice: number, campo: keyof Beneficiario, valor: string) {
    setBeneficiarios((previos) =>
      previos.map((b, i) =>
        i === indice ? { ...b, [campo]: campo === "porcentaje" ? Number(valor) : valor } : b,
      ),
    );
  }

  return (
    <Modal
      abierto={producto !== null}
      onCerrar={onCerrar}
      titulo={producto?.nombre ?? ""}
      descripcion="La prima depende de la suma asegurada y de tu edad."
      ancho="max-w-xl"
    >
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Suma asegurada">
            <Input
              inputMode="numeric"
              value={suma}
              onChange={(e) => setSuma(e.target.value.replace(/\D/g, ""))}
            />
          </Campo>
          <Campo etiqueta="Edad" ayuda="Entre 18 y 75 años.">
            <Input
              inputMode="numeric"
              value={edad}
              onChange={(e) => setEdad(e.target.value.replace(/\D/g, ""))}
            />
          </Campo>
        </div>

        {prima !== null && (
          <div className="rounded-lg bg-brand-900 px-4 py-3 text-white">
            <p className="text-xs text-brand-200">Prima mensual</p>
            <p className="tabular mt-0.5 text-2xl font-semibold">{money(prima)}</p>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-ink-700">Beneficiarios</span>
            <span
              className={[
                "text-xs font-semibold",
                Math.abs(total - 100) < 0.01 ? "text-positive-700" : "text-negative-700",
              ].join(" ")}
            >
              Suman {total}%
            </span>
          </div>

          <div className="space-y-2">
            {beneficiarios.map((beneficiario, indice) => (
              <div key={indice} className="flex gap-2">
                <Input
                  placeholder="Nombre"
                  value={beneficiario.nombre}
                  onChange={(e) => actualizar(indice, "nombre", e.target.value)}
                />
                <Input
                  placeholder="DNI"
                  inputMode="numeric"
                  className="w-32"
                  value={beneficiario.dni}
                  onChange={(e) => actualizar(indice, "dni", e.target.value.replace(/\D/g, ""))}
                />
                <Input
                  inputMode="numeric"
                  className="w-20"
                  value={String(beneficiario.porcentaje)}
                  onChange={(e) =>
                    actualizar(indice, "porcentaje", e.target.value.replace(/\D/g, "") || "0")
                  }
                />
                {beneficiarios.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setBeneficiarios((previos) => previos.filter((_, i) => i !== indice))
                    }
                    aria-label="Quitar beneficiario"
                    className="shrink-0 rounded-lg px-2 text-ink-400 hover:bg-ink-100 hover:text-negative-500"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setBeneficiarios((previos) => [...previos, { nombre: "", dni: "", porcentaje: 0 }])
            }
            className="mt-2 text-xs font-semibold text-accent-600 hover:text-accent-700"
          >
            + Agregar beneficiario
          </button>
        </div>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Contratar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

function ModalSiniestro({
  poliza,
  onCerrar,
  onHecho,
}: {
  poliza: Poliza | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api } = useBank();
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!poliza) return;
    setError(null);
    setEnviando(true);
    try {
      await api.denunciarSiniestro(poliza.id, descripcion.trim());
      setDescripcion("");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={poliza !== null}
      onCerrar={onCerrar}
      titulo="Denunciar siniestro"
      descripcion={poliza?.producto}
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="¿Qué pasó?" ayuda="Contanos con el mayor detalle posible.">
          <textarea
            required
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Fecha, lugar y descripción de lo ocurrido…"
            className="w-full rounded-lg border border-ink-200 bg-surface px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500"
          />
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Enviar denuncia
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
