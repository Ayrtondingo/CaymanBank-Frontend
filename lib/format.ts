import type { Moneda } from "./api";

/**
 * Formateo en es-AR. Se cachean los Intl.NumberFormat porque construirlos
 * es caro y en una tabla de movimientos se llamarían cientos de veces.
 */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(moneda: Moneda, decimales: number) {
  const key = `${moneda}-${decimales}`;
  let formatter = currencyFormatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
    currencyFormatters.set(key, formatter);
  }

  return formatter;
}

export function money(monto: number, moneda: Moneda = "ARS", decimales = 2) {
  return currencyFormatter(moneda, decimales).format(Number(monto ?? 0));
}

/** Importe sin símbolo, para cuando la moneda ya se muestra aparte. */
export function amount(monto: number, decimales = 2) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number(monto ?? 0));
}

export function percent(valor: number, decimales = 2) {
  return `${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Number(valor ?? 0))}%`;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Las fechas YYYY-MM-DD se parsean a mediodía UTC para que el huso no las corra un día. */
function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`);
  return new Date(value);
}

export function fecha(value?: string | Date | null) {
  if (!value) return "—";
  return dateFormatter.format(toDate(value));
}

export function fechaHora(value?: string | Date | null) {
  if (!value) return "—";
  return dateTimeFormatter.format(toDate(value));
}

export function fechaLarga(value?: string | Date | null) {
  if (!value) return "—";
  return longDateFormatter.format(toDate(value));
}

/** "hace 5 minutos", "ayer". Para timestamps recientes. */
export function relativo(value?: string | Date | null) {
  if (!value) return "—";

  const date = toDate(value);
  const segundos = Math.round((Date.now() - date.getTime()) / 1000);

  if (segundos < 60) return "recién";
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)} h`;
  if (segundos < 172800) return "ayer";

  return fecha(date);
}

/** CBU agrupado de a 4 para que se pueda leer y dictar. */
export function cbuLegible(cbu?: string | null) {
  if (!cbu) return "—";
  return cbu.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/** Últimos 4 dígitos, para listados donde el CBU completo no entra. */
export function cbuCorto(cbu?: string | null) {
  if (!cbu) return "—";
  return `···${cbu.slice(-4)}`;
}

export function inicialesDe(nombre?: string | null) {
  if (!nombre) return "?";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

/** "cambio_divisas" -> "Cambio divisas" */
export function titulo(valor?: string | null) {
  if (!valor) return "—";
  const limpio = valor.replace(/_/g, " ").toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export const esCbu = (valor: string) => /^\d{22}$/.test(valor.trim());

/** Periodo YYYY-MM en texto: "agosto 2026". */
export function periodoLegible(periodo: string) {
  const [year, month] = periodo.split("-").map(Number);
  if (!year || !month) return periodo;
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}
