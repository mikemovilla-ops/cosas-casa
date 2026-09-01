export type TipoLista = "COMPRA" | "CASA";
export type EstadoItem = "A_COMPRAR" | "COMPRADO" | "URGENTE" | "MEDIO" | "LARGO";

export type Item = {
  id: string;
  tipo: TipoLista;
  estado: EstadoItem;
  texto: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchItems(tipo: TipoLista): Promise<Item[]> {
  const res = await fetch(`/api/items?tipo=${tipo}`);
  if (!res.ok) throw new Error("Error al cargar la lista");
  return res.json();
}

export async function crearItem(tipo: TipoLista, texto: string, estado?: EstadoItem): Promise<Item> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, texto, estado }),
  });
  if (!res.ok) throw new Error("Error al añadir el item");
  return res.json();
}

export async function actualizarEstado(id: string, estado: EstadoItem): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar el item");
  return res.json();
}

export async function eliminarItem(id: string): Promise<void> {
  await fetch(`/api/items/${id}`, { method: "DELETE" });
}
