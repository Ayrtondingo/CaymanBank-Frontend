"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useBank } from "../../components/BankProvider";
import {
  Aviso,
  Badge,
  Boton,
  Campo,
  Card,
  CardHeader,
  EstadoBadge,
  EstadoVacio,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabla,
} from "../../components/ui";
import type { Cedear, PlazoFijo, Portafolio } from "@/lib/api";
import { amount, fecha, money, percent } from "@/lib/format";

type Solapa = "plazos" | "cedears";

export default function InversionesPage() {
  const [solapa, setSolapa] = useState<Solapa>("plazos");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Inversiones</h1>
        <p className="mt-1 text-sm text-ink-500">
          Plazos fijos con tasas del mercado y CEDEARs con cotización en vivo.
        </p>
      </header>

      <div className="flex gap-1 rounded-lg bg-ink-100 p-1 sm:w-fit">
        {([
          ["plazos", "Plazos fijos"],
          ["cedears", "CEDEARs"],
        ] as const).map(([valor, etiqueta]) => (
          <button
            key={valor}
            onClick={() => setSolapa(valor)}
            className={[
              "flex-1 rounded-md px-5 py-2 text-sm font-semibold transition-colors sm:flex-none",
              solapa === valor
                ? "bg-white text-brand-900 shadow-[var(--shadow-card)]"
                : "text-ink-600 hover:text-ink-800",
            ].join(" ")}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {solapa === "plazos" ? <PlazosFijos /> : <Cedears />}
    </div>
  );
}

/* ------------------------------------------------------------- Plazos fijos */

function PlazosFijos() {
  const { api, refrescar, avisar } = useBank();
  const [plazos, setPlazos] = useState<PlazoFijo[] | null>(null);
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setPlazos(await api.plazosFijos());
    } catch {
      setPlazos([]);
    }
  }, [api]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function acreditar(plazo: PlazoFijo) {
    try {
      await api.acreditarPlazoFijo(plazo.id);
      avisar("exito", "Capital e intereses acreditados.");
      await Promise.all([cargar(), refrescar()]);
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          titulo="Mis plazos fijos"
          accion={<Boton onClick={() => setAbierto(true)}>Constituir</Boton>}
        />
        {plazos === null ? (
          <div className="space-y-2 p-5">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : plazos.length === 0 ? (
          <EstadoVacio
            titulo="No tenés plazos fijos"
            descripcion="Constituí uno tradicional o ajustado por UVA."
            accion={<Boton onClick={() => setAbierto(true)}>Constituir plazo fijo</Boton>}
          />
        ) : (
          <Tabla columnas={["Capital", "Tipo", "TNA", "Vencimiento", "Al vencer", "Estado", ""]}>
            {plazos.map((plazo) => (
              <tr key={plazo.id} className="hover:bg-ink-50">
                <td className="tabular px-5 py-3 font-medium text-ink-900">
                  {money(plazo.capital)}
                </td>
                <td className="px-5 py-3">
                  <Badge tono={plazo.tipo === "uva" ? "marca" : "neutro"}>
                    {plazo.tipo === "uva" ? "UVA" : "Tradicional"}
                  </Badge>
                </td>
                <td className="tabular px-5 py-3 text-ink-700">{percent(plazo.tna)}</td>
                <td className="px-5 py-3 whitespace-nowrap text-ink-600">
                  {fecha(plazo.fechaVencimiento)}
                </td>
                <td className="tabular px-5 py-3 font-semibold text-positive-700">
                  {money(plazo.totalAlVencimiento)}
                </td>
                <td className="px-5 py-3">
                  <EstadoBadge estado={plazo.estado} />
                </td>
                <td className="px-5 py-3 text-right">
                  {plazo.estado === "vencido" && (
                    <Boton variante="secundario" onClick={() => void acreditar(plazo)}>
                      Acreditar
                    </Boton>
                  )}
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Card>

      <ModalPlazoFijo
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        onHecho={async () => {
          setAbierto(false);
          await Promise.all([cargar(), refrescar()]);
        }}
      />
    </>
  );
}

function ModalPlazoFijo({
  abierto,
  onCerrar,
  onHecho,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [capital, setCapital] = useState("100000");
  const [dias, setDias] = useState("90");
  const [tipo, setTipo] = useState("tradicional");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await api.crearPlazoFijo({
        capital: Number(capital),
        plazoDias: Number(dias),
        tipo,
      });
      avisar("exito", "Plazo fijo constituido.");
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Constituir plazo fijo">
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Capital" ayuda="Mínimo $1.000. Se debita de tu caja en pesos.">
          <Input
            inputMode="numeric"
            value={capital}
            onChange={(e) => setCapital(e.target.value.replace(/\D/g, ""))}
          />
        </Campo>

        <Campo etiqueta="Plazo en días" ayuda="Mínimo 30 días.">
          <Select value={dias} onChange={(e) => setDias(e.target.value)}>
            {[30, 60, 90, 180, 365].map((d) => (
              <option key={d} value={d}>
                {d} días
              </option>
            ))}
          </Select>
        </Campo>

        <Campo
          etiqueta="Tipo"
          ayuda={
            tipo === "uva"
              ? "El capital se ajusta por la variación del índice UVA y después se aplica la tasa."
              : "Interés simple sobre el capital."
          }
        >
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="tradicional">Tradicional</option>
            <option value="uva">Ajustado por UVA</option>
          </Select>
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Constituir
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ CEDEARs */

function Cedears() {
  const { api, refrescar } = useBank();
  const [cedears, setCedears] = useState<Cedear[] | null>(null);
  const [portafolio, setPortafolio] = useState<Portafolio | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [operando, setOperando] = useState<Cedear | null>(null);

  const cargar = useCallback(async () => {
    const [lista, cartera] = await Promise.allSettled([api.cedears(), api.portafolio()]);
    setCedears(lista.status === "fulfilled" ? lista.value : []);
    setPortafolio(cartera.status === "fulfilled" ? cartera.value : null);
  }, [api]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Son ~950 papeles: sin filtro la tabla es inusable, así que se muestran 30
  // y el buscador es la vía principal para llegar a un ticker.
  const visibles = useMemo(() => {
    if (!cedears) return [];
    const termino = busqueda.trim().toUpperCase();
    const filtrados = termino
      ? cedears.filter((cedear) => cedear.ticker.includes(termino))
      : cedears;
    return filtrados.slice(0, 30);
  }, [cedears, busqueda]);

  return (
    <>
      {portafolio && portafolio.posiciones.length > 0 && (
        <Card className="mb-6">
          <CardHeader
            titulo="Mi portafolio"
            descripcion={`Valuación total ${money(portafolio.valuacionTotal)}`}
          />
          <Tabla columnas={["Ticker", "Cantidad", "Precio prom.", "Precio actual", "Resultado"]}>
            {portafolio.posiciones.map((posicion) => (
              <tr key={posicion.ticker}>
                <td className="px-5 py-3 font-semibold text-ink-900">{posicion.ticker}</td>
                <td className="tabular px-5 py-3 text-ink-700">{posicion.cantidad}</td>
                <td className="tabular px-5 py-3 text-ink-700">
                  {money(posicion.precioPromedio)}
                </td>
                <td className="tabular px-5 py-3 text-ink-700">{money(posicion.precioActual)}</td>
                <td
                  className={[
                    "tabular px-5 py-3 text-right font-semibold",
                    posicion.resultado >= 0 ? "text-positive-700" : "text-negative-700",
                  ].join(" ")}
                >
                  {posicion.resultado >= 0 ? "+" : ""}
                  {money(posicion.resultado)} ({percent(posicion.resultadoPct)})
                </td>
              </tr>
            ))}
          </Tabla>
        </Card>
      )}

      <Card>
        <CardHeader
          titulo="Cotizaciones"
          descripcion={cedears ? `${cedears.length} CEDEARs con cotización` : undefined}
          accion={
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar ticker…"
              className="w-40"
            />
          }
        />
        {cedears === null ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <EstadoVacio titulo="Sin resultados" descripcion="Probá con otro ticker." />
        ) : (
          <Tabla columnas={["Ticker", "Compra", "Venta", "Variación", ""]}>
            {visibles.map((cedear) => (
              <tr key={cedear.ticker} className="hover:bg-ink-50">
                <td className="px-5 py-2.5 font-semibold text-ink-900">{cedear.ticker}</td>
                <td className="tabular px-5 py-2.5 text-ink-700">{money(cedear.compra)}</td>
                <td className="tabular px-5 py-2.5 text-ink-700">{money(cedear.venta)}</td>
                <td
                  className={[
                    "tabular px-5 py-2.5 font-medium",
                    cedear.variacion >= 0 ? "text-positive-700" : "text-negative-700",
                  ].join(" ")}
                >
                  {cedear.variacion >= 0 ? "+" : ""}
                  {amount(cedear.variacion)}%
                </td>
                <td className="px-5 py-2.5 text-right">
                  <Boton variante="secundario" onClick={() => setOperando(cedear)}>
                    Operar
                  </Boton>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Card>

      <ModalOrden
        cedear={operando}
        onCerrar={() => setOperando(null)}
        onHecho={async () => {
          setOperando(null);
          await Promise.all([cargar(), refrescar()]);
        }}
      />
    </>
  );
}

function ModalOrden({
  cedear,
  onCerrar,
  onHecho,
}: {
  cedear: Cedear | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [tipo, setTipo] = useState<"compra" | "venta">("compra");
  const [cantidad, setCantidad] = useState("1");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const precio = tipo === "compra" ? cedear?.venta : cedear?.compra;
  const total = precio && Number(cantidad) ? precio * Number(cantidad) : 0;

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!cedear) return;
    setError(null);
    setEnviando(true);
    try {
      await api.operarCedear({ ticker: cedear.ticker, cantidad: Number(cantidad), tipo });
      avisar("exito", `Orden de ${tipo} ejecutada.`);
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={cedear !== null}
      onCerrar={onCerrar}
      titulo={`Operar ${cedear?.ticker ?? ""}`}
      descripcion="La orden se ejecuta al precio de mercado del momento."
    >
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-100 p-1">
          {(["compra", "venta"] as const).map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => setTipo(opcion)}
              className={[
                "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                tipo === opcion
                  ? "bg-white text-brand-900 shadow-[var(--shadow-card)]"
                  : "text-ink-600 hover:text-ink-800",
              ].join(" ")}
            >
              {opcion === "compra" ? "Comprar" : "Vender"}
            </button>
          ))}
        </div>

        <Campo etiqueta="Cantidad" ayuda={precio ? `Precio unitario ${money(precio)}` : undefined}>
          <Input
            autoFocus
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ""))}
          />
        </Campo>

        <div className="rounded-lg bg-brand-50 px-4 py-3">
          <p className="text-xs text-brand-700">
            {tipo === "compra" ? "Total a pagar" : "Total a recibir"}
          </p>
          <p className="tabular mt-0.5 text-xl font-semibold text-brand-900">{money(total)}</p>
        </div>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Confirmar orden
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
