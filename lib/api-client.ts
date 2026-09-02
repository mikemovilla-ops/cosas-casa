export type TipoLista = "COMPRA" | "CASA" | "TAREA" | "DEUDA";
export type EstadoItem = "A_COMPRAR" | "COMPRADO" | "URGENTE" | "MEDIO" | "LARGO" | "PENDIENTE" | "HECHO";

export type Item = {
  id: string;
  tipo: TipoLista;
  estado: EstadoItem;
  texto: string;
  cantidad: number;
  enlace: string | null;
  importe: number | null;
  meDeben: boolean | null;
  fecha: string | null;
  orden: number;
  createdAt: string;
  updatedAt: string;
  asignadoAId: string | null;
  creadoPorId: string | null;
};

export type Usuario = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function fetchItems(tipo: TipoLista): Promise<Item[]> {
  const res = await fetch(`/api/items?tipo=${tipo}`);
  if (!res.ok) throw new Error("Error al cargar la lista");
  return res.json();
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const res = await fetch("/api/usuarios");
  if (!res.ok) throw new Error("Error al cargar los usuarios");
  return res.json();
}

export async function fetchPerfil(): Promise<{ tareasDeudasActivado: boolean }> {
  const res = await fetch("/api/perfil");
  if (!res.ok) throw new Error("Error al cargar el perfil");
  return res.json();
}

export async function actualizarPerfil(cambios: {
  tareasDeudasActivado: boolean;
}): Promise<{ tareasDeudasActivado: boolean }> {
  const res = await fetch("/api/perfil", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });
  if (!res.ok) throw new Error("Error al actualizar el perfil");
  return res.json();
}

export async function crearItem(
  tipo: TipoLista,
  texto: string,
  opciones?: {
    estado?: EstadoItem;
    asignadoAId?: string | null;
    cantidad?: number;
    importe?: number;
    meDeben?: boolean;
    fecha?: string;
  }
): Promise<Item> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, texto, ...opciones }),
  });
  if (!res.ok) throw new Error("Error al añadir el item");
  return res.json();
}

export async function actualizarItem(
  id: string,
  cambios: {
    texto?: string;
    estado?: EstadoItem;
    asignadoAId?: string | null;
    cantidad?: number;
    enlace?: string | null;
    importe?: number;
    meDeben?: boolean;
    fecha?: string;
    orden?: number;
  }
): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });
  if (!res.ok) throw new Error("Error al actualizar el item");
  return res.json();
}

export async function eliminarItem(id: string): Promise<void> {
  await fetch(`/api/items/${id}`, { method: "DELETE" });
}

// Al soltar un item entre "antes" y "despues" (ya reordenados en el array
// local), calcula un valor de orden intermedio — así solo hace falta
// escribir el item que se movió, no reindexar toda la columna.
export function calcularOrden(antes: Item | null, despues: Item | null): number {
  if (!antes && !despues) return Date.now();
  if (!antes) return despues!.orden - 1000;
  if (!despues) return antes.orden + 1000;
  return (antes.orden + despues.orden) / 2;
}
