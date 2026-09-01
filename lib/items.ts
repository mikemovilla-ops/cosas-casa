import type { EstadoItem, TipoLista } from "@prisma/client";

// Qué estados son válidos para cada tipo de lista — evita que, por ejemplo,
// un item de COMPRA acabe con estado URGENTE por un body manipulado a mano.
const ESTADOS_POR_TIPO: Record<TipoLista, EstadoItem[]> = {
  COMPRA: ["A_COMPRAR", "COMPRADO"],
  CASA: ["URGENTE", "MEDIO", "LARGO", "COMPRADO"],
};

export const ESTADO_INICIAL: Record<TipoLista, EstadoItem> = {
  COMPRA: "A_COMPRAR",
  CASA: "MEDIO",
};

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
