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
import NombreEditable from "./NombreEditable";
import NotaEditable from "./NotaEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";
import ColumnaDesplegable from "./ColumnaDesplegable";

export default function ListaRestaurantes({ usuarios }: { usuarios: Usuario[] }) {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("RESTAURANTE"));
  const [texto, setTexto] = useState("");
  const [asignadoAId, setAsignadoAId] = useState("");
  const [enviando, setEnviando] = useState(false);

  const pendientes = items.filter((i) => i.estado === "PENDIENTE").sort((a, b) => a.orden - b.orden);
  const idos = items.filter((i) => i.estado === "HECHO").sort((a, b) => a.orden - b.orden);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("RESTAURANTE", valor, { asignadoAId: asignadoAId || null });
      setItems((prev) => [...prev, nuevo]);
    } finally {
      setEnviando(false);
    }
  }

  async function toggle(item: Item) {
    const nuevoEstado = item.estado === "PENDIENTE" ? "HECHO" : "PENDIENTE";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, estado: nuevoEstado } : i)));
    await actualizarItem(item.id, { estado: nuevoEstado });
    reload();
  }

  async function renombrar(item: Item, nuevoTexto: string) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, texto: nuevoTexto } : i)));
    await actualizarItem(item.id, { texto: nuevoTexto });
    reload();
  }

  async function asignar(item: Item, nuevoAsignadoAId: string | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, asignadoAId: nuevoAsignadoAId } : i)));
    await actualizarItem(item.id, { asignadoAId: nuevoAsignadoAId });
    reload();
  }

  async function cambiarNota(item: Item, nuevaNota: number | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, nota: nuevaNota } : i)));
    await actualizarItem(item.id, { nota: nuevaNota });
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
          placeholder="¿Qué restaurante?"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
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
          titulo="Nos gustaría ir"
          items={pendientes}
          vacio="Nada por aquí todavía"
          usuarios={usuarios}
          vista={false}
          onToggle={toggle}
          onAsignar={asignar}
          onRenombrar={renombrar}
          onNota={cambiarNota}
          onEliminar={eliminar}
          onReordenar={reordenar}
        />
        <Columna
          titulo="Hemos ido ✓"
          items={idos}
          vacio="Todavía no hemos ido a ninguno"
          usuarios={usuarios}
          vista
          onToggle={toggle}
          onAsignar={asignar}
          onRenombrar={renombrar}
          onNota={cambiarNota}
          onEliminar={eliminar}
          onReordenar={reordenar}
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
  vista,
  onToggle,
  onAsignar,
  onRenombrar,
  onNota,
  onEliminar,
  onReordenar,
}: {
  titulo: string;
  items: Item[];
  vacio: string;
  usuarios: Usuario[];
  vista: boolean;
  onToggle: (item: Item) => void;
  onAsignar: (item: Item, asignadoAId: string | null) => void;
  onRenombrar: (item: Item, texto: string) => void;
  onNota: (item: Item, nota: number | null) => void;
  onEliminar: (id: string) => void;
  onReordenar: (itemsReordenados: Item[]) => void;
}) {
  return (
    <ColumnaDesplegable
      titulo={titulo}
      count={items.length}
      colorClass={vista ? "text-emerald-600" : "text-sagedark"}
    >
      {items.length === 0 ? (
        <p className="text-ink/40 text-sm italic">{vacio}</p>
      ) : (
        <ListaOrdenable items={items} onReordenar={onReordenar} className="card divide-y divide-sand">
          {(item) => (
            <FilaOrdenable key={item.id} id={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
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
                        className={`flex-1 text-left ${vista ? "line-through text-emerald-600/70" : "text-ink"}`}
                      >
                        {texto}
                      </button>
                    )}
                  </NombreEditable>
                  {vista && <NotaEditable nota={item.nota} onChange={(n) => onNota(item, n)} />}
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
    </ColumnaDesplegable>
  );
}
