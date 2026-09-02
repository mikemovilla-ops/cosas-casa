import type { EstadoItem, TipoLista } from "@prisma/client";

// Qué estados son válidos para cada tipo de lista — evita que, por ejemplo,
// un item de COMPRA acabe con estado URGENTE por un body manipulado a mano.
const ESTADOS_POR_TIPO: Record<TipoLista, EstadoItem[]> = {
  COMPRA: ["A_COMPRAR", "COMPRADO"],
  CASA: ["URGENTE", "MEDIO", "LARGO", "COMPRADO"],
  TAREA: ["PENDIENTE", "HECHO"],
  DEUDA: ["PENDIENTE", "HECHO"],
};

export const ESTADO_INICIAL: Record<TipoLista, EstadoItem> = {
  COMPRA: "A_COMPRAR",
  CASA: "MEDIO",
  TAREA: "PENDIENTE",
  DEUDA: "PENDIENTE",
};

// TAREA y DEUDA son personales: solo las ve/gestiona quien las creó. COMPRA
// y CASA son compartidas entre los dos usuarios.
export const TIPOS_PERSONALES: TipoLista[] = ["TAREA", "DEUDA"];

export function estadoValidoParaTipo(tipo: TipoLista, estado: string): estado is EstadoItem {
  return (ESTADOS_POR_TIPO[tipo] as string[]).includes(estado);
}

// Entero positivo o 1 por defecto — nunca se deja una cantidad <= 0, para
// eso está el botón de borrar el item.
export function normalizarCantidad(valor: unknown): number {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function enlaceValido(valor: string): boolean {
  return /^https?:\/\/.+/i.test(valor.trim());
}

// Importe en euros: positivo y con como mucho 2 decimales de precisión
// real (evita que llegue basura tipo NaN o negativos desde un body manual).
export function importeValido(valor: unknown): number | null {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

// Acepta "YYYY-MM-DD" (lo que da un <input type="date">) o cualquier ISO
// completo; null si no viene o no es una fecha real.
export function fechaValida(valor: unknown): Date | null {
  if (typeof valor !== "string" || !valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function ordenValido(valor: unknown): number | null {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}
