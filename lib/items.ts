import type { EstadoItem, TipoLista } from "@prisma/client";

// Qué estados son válidos para cada tipo de lista — evita que, por ejemplo,
// un item de COMPRA acabe con estado URGENTE por un body manipulado a mano.
const ESTADOS_POR_TIPO: Record<TipoLista, EstadoItem[]> = {
  COMPRA: ["A_COMPRAR", "COMPRADO"],
  CASA: ["URGENTE", "MEDIO", "LARGO"],
};

export const ESTADO_INICIAL: Record<TipoLista, EstadoItem> = {
  COMPRA: "A_COMPRAR",
  CASA: "MEDIO",
};

export function estadoValidoParaTipo(tipo: TipoLista, estado: string): estado is EstadoItem {
  return (ESTADOS_POR_TIPO[tipo] as string[]).includes(estado);
}
