export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type Moneda = "ARS" | "USD";

export interface Cuenta {
  id: number;
  cbu: string | null;
  alias: string | null;
  currency: Moneda;
  balance: number;
}

export interface Movimiento {
  id: number;
  fecha: string;
  tipo: string;
  monto: number;
  signo: "debito" | "credito";
  moneda: Moneda;
  descripcion: string;
  estado: string;
  saldo: number;
}

export interface Perfil {
  fullName: string;
  role: "user" | "admin" | "gerente";
  dni: string | null;
  balance: number;
  cbu: string | null;
  alias: string | null;
  accounts: Cuenta[];
  transactions: MovimientoRed[];
}

export interface MovimientoRed {
  id: string | number;
  date: string;
  to?: string;
  from?: string;
  counterpartyName?: string;
  type: "IN" | "OUT";
  amount: number;
  status: string;
  ownCbu: string;
}

export interface Tarjeta {
  id: number;
  tipo: "debito" | "credito";
  numeroEnmascarado: string;
  cbuAsociado: string | null;
  limite: number | null;
  limiteDisponible?: number;
  estado: "activa" | "bloqueada";
  vencimiento: string;
}

export interface ResumenTarjeta {
  periodo: string;
  vencimiento: string;
  totalAPagar: number;
  pagoMinimo: number;
  tna: number;
  cft: number;
  limite: number;
  limiteDisponible: number;
  consumos: {
    id: number;
    fecha: string;
    comercio: string;
    monto: number;
    cuotas: number;
  }[];
}

export interface CuotaPrestamo {
  numero: number;
  capital: number;
  interes: number;
  cuota: number;
  saldo: number;
  vencimiento: string;
  estado: "pendiente" | "pagada";
  pagadaEl: string | null;
}

export interface Prestamo {
  id: number;
  monto: number;
  plazoMeses: number;
  tna: number;
  cuota: number;
  estado: "vigente" | "cancelado";
  cbu: string;
  fechaAlta: string;
  cuotasPagadas: number;
  capitalAdeudado: number;
  proximoVencimiento: string | null;
  cuotas: CuotaPrestamo[];
}

export interface SimulacionPrestamo {
  monto: number;
  plazoMeses: number;
  cuota: number;
  tna: number;
  tea: number;
  cft: number;
  totalPagado: number;
  totalIntereses: number;
  tasaDeReferencia: boolean;
  tabla: {
    numero: number;
    capital: number;
    interes: number;
    cuota: number;
    saldo: number;
  }[];
}

export interface PlazoFijo {
  id: number;
  capital: number;
  capitalAjustado: number;
  coeficienteUva: number | null;
  tna: number;
  plazoDias: number;
  interes: number;
  totalAlVencimiento: number;
  tipo: "tradicional" | "uva";
  fechaAlta: string;
  fechaVencimiento: string;
  estado: "vigente" | "vencido" | "acreditado";
  cbu: string;
}

export interface Cedear {
  ticker: string;
  precioARS: number;
  compra: number;
  venta: number;
  variacion: number;
}

export interface Portafolio {
  posiciones: {
    ticker: string;
    cantidad: number;
    precioPromedio: number;
    precioActual: number;
    valuacion: number;
    resultado: number;
    resultadoPct: number;
  }[];
  valuacionTotal: number;
}

export interface CotizacionDolar {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface EmpresaServicio {
  id: number;
  nombre: string;
  rubro: string;
}

export interface DeudaServicio {
  empresa: string;
  numeroCliente: string;
  totalAdeudado: number;
  facturas: {
    id: number;
    importe: number;
    vencimiento: string;
    estado: string;
    vencida: boolean;
  }[];
}

export interface ProductoSeguro {
  id: number;
  nombre: string;
  tipo: string;
  tasaBase: number;
}

export interface Poliza {
  id: number;
  productoId: number;
  producto: string;
  sumaAsegurada: number;
  prima: number;
  edadAlContratar: number;
  beneficiarios: { nombre: string; dni: string; porcentaje: number }[];
  estado: string;
  fechaAlta: string;
}

export interface ResumenGastos {
  periodo: string;
  cbu: string;
  moneda: Moneda;
  totalGastado: number;
  totalIngresado: number;
  cantidadMovimientos: number;
  categorias: {
    categoria: string;
    total: number;
    cantidad: number;
    porcentaje: number;
  }[];
}

export interface RespuestaChat {
  respuesta: string;
  accionesEjecutadas: { accion: string; parametros: unknown; resultado: unknown }[];
  accionesPendientes: { accion: string; parametros: unknown; motivo: string }[];
  requiereHumano: boolean;
}

export interface UsuarioAdmin {
  id: string;
  fullName: string;
  email: string;
  dni: string | null;
  role: "user" | "admin" | "gerente";
  balance: number;
  cbu: string | null;
  accountNumber: string | null;
  alias: string | null;
  accounts: { cbu: string | null; alias: string | null; currency: Moneda; balance: number }[];
}

/** Error de la API con el status, para poder distinguir un 401 de un 400. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Cliente de la API del banco.
 *
 * Se construye con el `getToken` de Clerk en vez de con un token ya resuelto:
 * los tokens de Clerk son de vida corta, así que hay que pedir uno nuevo en
 * cada request y no cachearlo en un componente.
 */
export function createApi(getToken: () => Promise<string | null>) {
  async function request<T>(
    path: string,
    options: { method?: Metodo; body?: unknown; query?: Record<string, string | number | undefined> } = {},
  ): Promise<T> {
    const token = await getToken();

    const url = new URL(`${API_URL}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });

    if (!response.ok) {
      // El backend responde {message} en los errores de Nest; si no, se usa el status.
      let message = `Error ${response.status}`;
      try {
        const data = await response.json();
        if (typeof data?.message === "string") message = data.message;
        else if (Array.isArray(data?.message)) message = data.message.join(", ");
      } catch {
        /* respuesta sin cuerpo JSON */
      }
      throw new ApiError(message, response.status);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  return {
    request,

    // ------------------------------------------------------------ Perfil
    perfil: () => request<Perfil>("/users/me"),
    actualizarAlias: (alias: string) =>
      request<{ alias: string }>("/users/alias", { method: "POST", body: { alias } }),
    sincronizarCbu: (data: { nombre: string; apellido: string; dni: string; alias?: string }) =>
      request<{ cbu: string; alias: string }>("/users/sync-cbu", { method: "POST", body: data }),
    situacionCrediticia: () => request<unknown>("/users/me/situacion-crediticia"),

    // ----------------------------------------------------------- Cuentas
    cuentas: () => request<Cuenta[]>("/accounts"),
    abrirCuenta: (moneda: Moneda) =>
      request<Cuenta>("/accounts", { method: "POST", body: { moneda } }),
    movimientos: (cbu: string) => request<Movimiento[]>(`/accounts/${cbu}/movimientos`),
    depositar: (cbu: string, monto: number) =>
      request<Movimiento>(`/accounts/${cbu}/depositos`, { method: "POST", body: { monto } }),
    extraer: (cbu: string, monto: number) =>
      request<Movimiento>(`/accounts/${cbu}/extracciones`, { method: "POST", body: { monto } }),
    cambiarDivisas: (operacion: "compra" | "venta", monto: number) =>
      request<{
        operacion: string;
        montoOrigen: number;
        monedaOrigen: Moneda;
        montoDestino: number;
        monedaDestino: Moneda;
        cotizacionUsada: number;
      }>("/accounts/cambio", { method: "POST", body: { operacion, monto } }),

    // --------------------------------------------------- Transferencias
    transferir: (destinatario: string, amount: number, reason?: string) =>
      request<unknown>("/transactions/transfer", {
        method: "POST",
        body: { destinatario, amount, reason },
      }),
    historial: () => request<MovimientoRed[]>("/transactions/history"),

    // ---------------------------------------------------------- Tarjetas
    tarjetas: () => request<Tarjeta[]>("/tarjetas"),
    emitirTarjeta: (body: { tipo: string; cbuAsociado?: string; limite?: number }) =>
      request<Tarjeta>("/tarjetas", { method: "POST", body }),
    bloquearTarjeta: (id: number, accion: "bloquear" | "desbloquear") =>
      request<Tarjeta>(`/tarjetas/${id}/bloqueo`, { method: "POST", body: { accion } }),
    resumenTarjeta: (id: number) => request<ResumenTarjeta>(`/tarjetas/${id}/resumen`),
    autorizarConsumo: (id: number, body: { comercio: string; monto: number; cuotas?: number }) =>
      request<{ id: number; estado: string; motivo: string | null }>(
        `/tarjetas/${id}/autorizaciones`,
        { method: "POST", body },
      ),

    // --------------------------------------------------------- Préstamos
    prestamos: () => request<Prestamo[]>("/prestamos"),
    simularPrestamo: (body: { monto: number; plazoMeses: number; tna?: number }) =>
      request<SimulacionPrestamo>("/prestamos/simulaciones", { method: "POST", body }),
    solicitarPrestamo: (body: { monto: number; plazoMeses: number; tna?: number }) =>
      request<Prestamo>("/prestamos", { method: "POST", body }),
    pagarCuota: (id: number) => request<unknown>(`/prestamos/${id}/pagos`, { method: "POST" }),
    precancelar: (id: number) =>
      request<unknown>(`/prestamos/${id}/precancelacion`, { method: "POST" }),

    // ------------------------------------------------------- Inversiones
    plazosFijos: () => request<PlazoFijo[]>("/plazos-fijos"),
    crearPlazoFijo: (body: { capital: number; plazoDias: number; tna?: number; tipo?: string }) =>
      request<PlazoFijo>("/plazos-fijos", { method: "POST", body }),
    acreditarPlazoFijo: (id: number) =>
      request<unknown>(`/plazos-fijos/${id}/acreditacion`, { method: "POST" }),
    cedears: () => request<Cedear[]>("/inversiones/cedears"),
    portafolio: () => request<Portafolio>("/inversiones/portafolio-cedears"),
    operarCedear: (body: { ticker: string; cantidad: number; tipo: "compra" | "venta" }) =>
      request<unknown>("/inversiones/cedears/ordenes", { method: "POST", body }),

    // ----------------------------------------------------------- Mercado
    dolar: () => request<CotizacionDolar>("/market/dolar"),
    dolares: () => request<CotizacionDolar[]>("/market/dolares"),
    uva: () => request<{ fecha: string; valor: number } | null>("/market/uva"),

    // ---------------------------------------------------------- Servicios
    empresas: () => request<EmpresaServicio[]>("/servicios/empresas"),
    deudaServicio: (id: number, numeroCliente: string) =>
      request<DeudaServicio>(`/servicios/empresas/${id}/deuda`, { query: { numeroCliente } }),
    pagarServicio: (id: number, body: { numeroCliente: string; importe: number }) =>
      request<unknown>(`/servicios/empresas/${id}/pagos`, { method: "POST", body }),

    // ----------------------------------------------------------- Recargas
    operadoras: () => request<{ id: string; nombre: string }[]>("/recargas/operadoras"),
    recargar: (body: { operadora: string; numero: string; monto: number }) =>
      request<{ id: number; estado: string; motivo: string | null }>("/recargas", {
        method: "POST",
        body,
      }),
    recargas: () => request<unknown[]>("/recargas"),

    // ------------------------------------------------------------ Seguros
    productosSeguro: () => request<ProductoSeguro[]>("/seguros/productos"),
    cotizarSeguro: (productoId: number, sumaAsegurada: number, edad: number) =>
      request<{ prima: number; primaAnual: number; factorEdad: number }>("/seguros/primas", {
        query: { productoId, sumaAsegurada, edad },
      }),
    polizas: () => request<Poliza[]>("/seguros/polizas"),
    contratarPoliza: (body: {
      productoId: number;
      sumaAsegurada: number;
      edad?: number;
      beneficiarios: { nombre: string; dni: string; porcentaje: number }[];
    }) => request<Poliza>("/seguros/polizas", { method: "POST", body }),
    denunciarSiniestro: (polizaId: number, descripcion: string) =>
      request<unknown>(`/seguros/polizas/${polizaId}/siniestros`, {
        method: "POST",
        body: { descripcion },
      }),

    // ----------------------------------------------------------- Reportes
    resumenGastos: (cbu: string, periodo?: string) =>
      request<ResumenGastos>(`/accounts/${cbu}/resumen-gastos`, { query: { periodo } }),
    urlExportar: (cbu: string, formato: "csv" | "json") =>
      `${API_URL}/accounts/${cbu}/movimientos/exportar?formato=${formato}`,

    // --------------------------------------------------------------- Chat
    enviarMensaje: (texto: string, confirmar = false) =>
      request<RespuestaChat>("/chat/mensajes", { method: "POST", body: { texto, confirmar } }),
    historialChat: () =>
      request<{ id: number; rol: string; texto: string; fecha: string }[]>("/chat/mensajes"),
    limpiarChat: () => request<unknown>("/chat/mensajes", { method: "DELETE" }),
    escalar: (motivo: string) =>
      request<{ id: number; estado: string }>("/chat/escalamientos", {
        method: "POST",
        body: { motivo },
      }),

    // -------------------------------------------------------------- Admin
    usuarios: () => request<UsuarioAdmin[]>("/admin/users"),
    ajustarSaldo: (id: string, amount: number) =>
      request<unknown>(`/admin/users/${id}/balance`, { method: "PATCH", body: { amount } }),
    cambiarRol: (id: string, role: string) =>
      request<unknown>(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
    darAcceso: (id: string, data: { nombre: string; apellido: string; dni: string }) =>
      request<unknown>(`/admin/users/${id}/sync-cbu`, { method: "POST", body: data }),
    bancos: () => request<{ bankCode: string; name: string }[]>("/central-bank/banks"),
    escalamientos: () => request<unknown[]>("/chat/escalamientos"),
  };
}

export type Api = ReturnType<typeof createApi>;
