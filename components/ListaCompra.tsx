"use client";

import { useState } from "react";
import {
  actualizarItem,
  crearItem,
  eliminarItem,
  fetchItems,
  reordenarColumna,
  type Item,
  type Usuario,
} from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import AsignadoBadge from "./AsignadoBadge";
import CantidadStepper from "./CantidadStepper";
import NombreEditable from "./NombreEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";

export default function ListaCompra({ usuarios }: { usuarios: Usuario[] }) {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("COMPRA"));
  const [texto, setTexto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [asignadoAId, setAsignadoAId] = useState("");
  const [enviando, setEnviando] = useState(false);

  const aComprar = items.filter((i) => i.estado === "A_COMPRAR").sort((a, b) => a.orden - b.orden);
  const comprado = items.filter((i) => i.estado === "COMPRADO").sort((a, b) => a.orden - b.orden);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("COMPRA", valor, { cantidad, asignadoAId: asignadoAId || null });
      setItems((prev) => [...prev, nuevo]);
      setCantidad(1);
    } finally {
      setEnviando(false);
    }
  }

  async function renombrar(item: Item, nuevoTexto: string) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, texto: nuevoTexto } : i)));
    await actualizarItem(item.id, { texto: nuevoTexto });
    reload();
  }

  async function cambiarCantidad(item: Item, nuevaCantidad: number) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i)));
    await actualizarItem(item.id, { cantidad: nuevaCantidad });
    reload();
  }

  async function toggle(item: Item) {
    const nuevoEstado = item.estado === "A_COMPRAR" ? "COMPRADO" : "A_COMPRAR";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, estado: nuevoEstado } : i)));
    await actualizarItem(item.id, { estado: nuevoEstado });
    reload();
  }

  async function asignar(item: Item, nuevoAsignadoAId: string | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, asignadoAId: nuevoAsignadoAId } : i)));
    await actualizarItem(item.id, { asignadoAId: nuevoAsignadoAId });
    reload();
  }

  async function eliminar(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await eliminarItem(id);
  }

  async function reordenar(itemsReordenados: Item[]) {
    await reordenarColumna(itemsReordenados, (id, orden) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, orden } : i)));
    });
    reload();
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 mb-6">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué necesitamos comprar?"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
          aria-label="Cantidad"
          className="w-16 rounded-md border border-sand px-2 py-2 bg-white focus:border-sage outline-none"
        />
        <select
          value={asignadoAId}
          onChange={(e) => setAsignadoAId(e.target.value)}
          className="rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        >
          <option value="">Los dos</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name?.split(" ")[0] ?? u.email}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="bg-sage text-white font-medium px-4 py-2 rounded-md hover:bg-sagedark transition disabled:opacity-40"
        >
          Añadir
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-6">
        <Columna
          titulo="A comprar"
          items={aComprar}
          vacio="No hay nada pendiente 🎉"
          usuarios={usuarios}
          onToggle={toggle}
          onAsignar={asignar}
          onCantidad={cambiarCantidad}
          onRenombrar={renombrar}
          onEliminar={eliminar}
          onReordenar={reordenar}
          tachado={false}
        />
        <Columna
          titulo="Comprado"
          items={comprado}
          vacio="Nada comprado todavía"
          usuarios={usuarios}
          onToggle={toggle}
          onAsignar={asignar}
          onCantidad={cambiarCantidad}
          onRenombrar={renombrar}
          onEliminar={eliminar}
          onReordenar={reordenar}
          tachado
        />
      </div>
    </div>
  );
}

function Columna({
  titulo,
  items,
  vacio,
  usuarios,
  onToggle,
  onAsignar,
  onCantidad,
  onRenombrar,
  onEliminar,
  onReordenar,
  tachado,
}: {
  titulo: string;
  items: Item[];
  vacio: string;
  usuarios: Usuario[];
  onToggle: (item: Item) => void;
  onAsignar: (item: Item, asignadoAId: string | null) => void;
  onCantidad: (item: Item, cantidad: number) => void;
  onRenombrar: (item: Item, texto: string) => void;
  onEliminar: (id: string) => void;
  onReordenar: (itemsReordenados: Item[]) => void;
  tachado: boolean;
}) {
  return (
    <div>
      <h2 className="font-semibold text-sagedark mb-2">
        {titulo} <span className="text-ink/40 font-normal">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-ink/40 text-sm italic">{vacio}</p>
      ) : (
        <ListaOrdenable items={items} onReordenar={onReordenar} className="card divide-y divide-sand">
          {(item) => (
            <FilaOrdenable key={item.id} id={item.id} className="flex items-center gap-2 px-3 py-2">
              {({ asaProps }) => (
                <>
                  <AsaArrastre asaProps={asaProps} />
                  <AsignadoBadge
                    usuarios={usuarios}
                    asignadoAId={item.asignadoAId}
                    onChange={(id) => onAsignar(item, id)}
                  />
                  <NombreEditable texto={item.texto} onGuardar={(t) => onRenombrar(item, t)}>
                    {(texto) => (
                      <button
                        onClick={() => onToggle(item)}
                        className={`flex-1 text-left ${tachado ? "line-through text-ink/40" : "text-ink"}`}
                      >
                        {texto}
                      </button>
                    )}
                  </NombreEditable>
                  <CantidadStepper cantidad={item.cantidad} onChange={(n) => onCantidad(item, n)} />
                  <button
                    onClick={() => onEliminar(item.id)}
                    aria-label="Eliminar"
                    className="text-ink/30 hover:text-clay transition px-1"
                  >
                    ✕
                  </button>
                </>
              )}
            </FilaOrdenable>
          )}
        </ListaOrdenable>
      )}
    </div>
  );
}
