"use client";

import { useState } from "react";
import { actualizarItem, crearItem, eliminarItem, fetchItems, reordenarColumna, type Item } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import NombreEditable from "./NombreEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";

// Lista personal (solo la ve quien la crea) — sin asignar a nadie, sin
// enlace, sin cantidad: es una lista de tareas propias, no algo a comprar.
export default function ListaTareas() {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("TAREA"));
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const pendientes = items.filter((i) => i.estado === "PENDIENTE").sort((a, b) => a.orden - b.orden);
  const hechas = items.filter((i) => i.estado === "HECHO").sort((a, b) => a.orden - b.orden);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("TAREA", valor);
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
          placeholder="¿Qué tienes pendiente?"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
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
          titulo="Pendiente"
          items={pendientes}
          vacio="No hay nada pendiente 🎉"
          onToggle={toggle}
          onRenombrar={renombrar}
          onEliminar={eliminar}
          onReordenar={reordenar}
          tachado={false}
        />
        <Columna
          titulo="Hecho ✓"
          items={hechas}
          vacio="Nada hecho todavía"
          onToggle={toggle}
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
  onToggle,
  onRenombrar,
  onEliminar,
  onReordenar,
  tachado,
}: {
  titulo: string;
  items: Item[];
  vacio: string;
  onToggle: (item: Item) => void;
  onRenombrar: (item: Item, texto: string) => void;
  onEliminar: (id: string) => void;
  onReordenar: (itemsReordenados: Item[]) => void;
  tachado: boolean;
}) {
  return (
    <div>
      <h2 className={`font-semibold mb-2 ${tachado ? "text-emerald-600" : "text-sagedark"}`}>
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
                  <NombreEditable texto={item.texto} onGuardar={(t) => onRenombrar(item, t)}>
                    {(texto) => (
                      <button
                        onClick={() => onToggle(item)}
                        className={`flex-1 text-left ${tachado ? "line-through text-emerald-600/70" : "text-ink"}`}
                      >
                        {texto}
                      </button>
                    )}
                  </NombreEditable>
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
