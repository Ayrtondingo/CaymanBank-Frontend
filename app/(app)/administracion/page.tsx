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
  Select,
  Skeleton,
  Tabla,
} from "../../components/ui";
import type { Moneda, UsuarioAdmin } from "@/lib/api";
import { SolicitudesPrestamo } from "./solicitudes";
import { cbuCorto, inicialesDe, money } from "@/lib/format";

const ROLES = [
  { valor: "user", etiqueta: "Cliente" },
  { valor: "admin", etiqueta: "Empleado" },
  { valor: "gerente", etiqueta: "Gerente" },
];

export default function AdministracionPage() {
  const { api, perfil, avisar } = useBank();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [ajustando, setAjustando] = useState<UsuarioAdmin | null>(null);
  const [activando, setActivando] = useState<UsuarioAdmin | null>(null);

  const esGerente = perfil?.role === "gerente";

  const cargar = useCallback(async () => {
    try {
      setUsuarios(await api.usuarios());
    } catch (e) {
      avisar("error", (e as Error).message);
      setUsuarios([]);
    }
  }, [api, avisar]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function cambiarRol(usuario: UsuarioAdmin, rol: string) {
    try {
      await api.cambiarRol(usuario.id, rol);
      avisar("exito", `${usuario.fullName} ahora es ${rol}.`);
      await cargar();
    } catch (e) {
      avisar("error", (e as Error).message);
    }
  }

  const visibles = (usuarios ?? []).filter((usuario) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      usuario.fullName?.toLowerCase().includes(termino) ||
      usuario.email?.toLowerCase().includes(termino) ||
      usuario.dni?.includes(termino)
    );
  });

  const sinActivar = (usuarios ?? []).filter(
    (usuario) => usuario.role === "user" && !usuario.cbu,
  ).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Administración</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gestión de clientes del banco.{" "}
          {esGerente
            ? "Perfil gerente: podés cambiar roles y ajustar saldos."
            : "Perfil empleado: solo consulta y activación de clientes."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-ink-500">Clientes</p>
          <p className="tabular mt-1 text-2xl font-semibold text-ink-900">
            {usuarios?.length ?? "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-500">Sin activar</p>
          <p className="tabular mt-1 text-2xl font-semibold text-warning-700">{sinActivar}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-500">Depósitos totales</p>
          <p className="tabular mt-1 text-2xl font-semibold text-ink-900">
            {money((usuarios ?? []).reduce((sum, u) => sum + Number(u.balance ?? 0), 0))}
          </p>
        </Card>
      </div>

      <SolicitudesPrestamo esGerente={esGerente} />

      <Card>
        <CardHeader
          titulo="Clientes"
          accion={
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o DNI…"
              className="w-56"
            />
          }
        />

        {usuarios === null ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <EstadoVacio titulo="Sin resultados" />
        ) : (
          <Tabla columnas={["Cliente", "DNI", "CBU", "Saldo", "Perfil", "Acciones"]}>
            {visibles.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-ink-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                      {inicialesDe(usuario.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {usuario.fullName}
                      </p>
                      <p className="truncate text-xs text-ink-500">{usuario.email}</p>
                    </div>
                  </div>
                </td>
                <td className="tabular px-5 py-3 text-ink-600">{usuario.dni ?? "—"}</td>
                <td className="px-5 py-3">
                  {usuario.cbu ? (
                    <span className="tabular text-ink-600">{cbuCorto(usuario.cbu)}</span>
                  ) : (
                    <Badge tono="advertencia">sin activar</Badge>
                  )}
                </td>
                <td className="tabular px-5 py-3 font-medium text-ink-900">
                  {money(usuario.balance)}
                </td>
                <td className="px-5 py-3">
                  {esGerente ? (
                    <Select
                      value={usuario.role}
                      onChange={(e) => void cambiarRol(usuario, e.target.value)}
                      className="w-32 py-1.5 text-xs"
                    >
                      {ROLES.map((rol) => (
                        <option key={rol.valor} value={rol.valor}>
                          {rol.etiqueta}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge tono={usuario.role === "gerente" ? "marca" : "neutro"}>
                      {ROLES.find((r) => r.valor === usuario.role)?.etiqueta ?? usuario.role}
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {esGerente && (
                      <Boton variante="secundario" onClick={() => setAjustando(usuario)}>
                        Saldo
                      </Boton>
                    )}
                    {esGerente && !usuario.cbu && (
                      <Boton onClick={() => setActivando(usuario)}>Activar</Boton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </Card>

      <ModalSaldo
        usuario={ajustando}
        onCerrar={() => setAjustando(null)}
        onHecho={async () => {
          setAjustando(null);
          await cargar();
        }}
      />

      <ModalActivar
        usuario={activando}
        onCerrar={() => setActivando(null)}
        onHecho={async () => {
          setActivando(null);
          await cargar();
        }}
      />
    </div>
  );
}

function ModalSaldo({
  usuario,
  onCerrar,
  onHecho,
}: {
  usuario: UsuarioAdmin | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, refrescar, avisar } = useBank();
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!usuario) return;
    setError(null);

    const valor = Number(monto);
    if (!Number.isFinite(valor) || valor === 0) {
      setError("Ingresá un importe distinto de cero. Puede ser negativo para debitar.");
      return;
    }

    setEnviando(true);
    try {
      const r = await api.ajustarSaldo(usuario.id, valor, moneda, motivo.trim() || undefined);
      avisar("exito", `${r.cliente}: ${money(r.saldoPrevio, moneda)} → ${money(r.balance, moneda)}`);
      setMonto("");
      setMotivo("");
      // El gerente puede ajustarse a si mismo: hay que refrescar su propio saldo.
      await refrescar();
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={usuario !== null}
      onCerrar={onCerrar}
      titulo="Ajustar saldo"
      descripcion={usuario ? `${usuario.fullName} · ${money(usuario.balance)}` : ""}
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo etiqueta="Moneda">
          <Select value={moneda} onChange={(e) => setMoneda(e.target.value as Moneda)}>
            <option value="ARS">Pesos</option>
            <option value="USD">Dólares</option>
          </Select>
        </Campo>

        <Campo
          etiqueta="Importe del ajuste"
          ayuda="Positivo acredita, negativo debita."
        >
          <Input
            autoFocus
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="10000 o -5000"
          />
        </Campo>

        <Campo etiqueta="Motivo (opcional)" ayuda="Queda registrado en el movimiento.">
          <Input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Corrección por error de carga"
            maxLength={80}
          />
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Aplicar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

function ModalActivar({
  usuario,
  onCerrar,
  onHecho,
}: {
  usuario: UsuarioAdmin | null;
  onCerrar: () => void;
  onHecho: () => void;
}) {
  const { api, avisar } = useBank();
  const [datos, setDatos] = useState({ nombre: "", apellido: "", dni: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const partes = (usuario.fullName ?? "").trim().split(/\s+/);
    setDatos({
      nombre: partes[0] ?? "",
      apellido: partes.slice(1).join(" "),
      dni: usuario.dni ?? "",
    });
  }, [usuario]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    if (!usuario) return;
    setError(null);
    setEnviando(true);
    try {
      await api.darAcceso(usuario.id, datos);
      avisar("exito", `${usuario.fullName} quedó activado con CBU.`);
      onHecho();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto={usuario !== null}
      onCerrar={onCerrar}
      titulo="Activar cliente"
      descripcion="Se registra en el Banco Central y se le asigna un CBU."
    >
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <Input
              required
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Apellido">
            <Input
              required
              value={datos.apellido}
              onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
            />
          </Campo>
        </div>

        <Campo etiqueta="DNI">
          <Input
            required
            inputMode="numeric"
            value={datos.dni}
            onChange={(e) => setDatos({ ...datos, dni: e.target.value.replace(/\D/g, "") })}
            maxLength={8}
          />
        </Campo>

        {error && <Aviso tono="negativo">{error}</Aviso>}

        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={enviando}>
            Activar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
