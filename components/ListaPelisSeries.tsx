"use client";

import { useState } from "react";
import {
  actualizarItem,
  crearItem,
  eliminarItem,
  fetchItems,
  reordenarColumna,
  type Item,
  type TipoContenido,
  type Usuario,
} from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import AsignadoBadge from "./AsignadoBadge";
import TipoContenidoBadge from "./TipoContenidoBadge";
import PlataformaEditable from "./PlataformaEditable";
import NombreEditable from "./NombreEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";

export default function ListaPelisSeries({ usuarios }: { usuarios: Usuario[] }) {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("PELISERIE"));
  const [texto, setTexto] = useState("");
  const [tipoContenido, setTipoContenido] = useState<TipoContenido>("PELICULA");
  const [plataforma, setPlataforma] = useState("");
  const [asignadoAId, setAsignadoAId] = useState("");
  const [enviando, setEnviando] = useState(false);

  const pendientes = items.filter((i) => i.estado === "PENDIENTE").sort((a, b) => a.orden - b.orden);
  const vistas = items.filter((i) => i.estado === "HECHO").sort((a, b) => a.orden - b.orden);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("PELISERIE", valor, {
        tipoContenido,
        plataforma: plataforma.trim() || undefined,
        asignadoAId: asignadoAId || null,
      });
      setItems((prev) => [...prev, nuevo]);
      setPlataforma("");
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

  async function cambiarTipoContenido(item: Item, nuevoTipo: TipoContenido) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, tipoContenido: nuevoTipo } : i)));
    await actualizarItem(item.id, { tipoContenido: nuevoTipo });
    reload();
  }

  async function cambiarPlataforma(item: Item, nuevaPlataforma: string | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, plataforma: nuevaPlataforma } : i)));
    await actualizarItem(item.id, { plataforma: nuevaPlataforma });
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
          placeholder="¿Qué peli o serie?"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
        <select
          value={tipoContenido}
          onChange={(e) => setTipoContenido(e.target.value as TipoContenido)}
          className="rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        >
          <option value="PELICULA">🎬 Película</option>
          <option value="SERIE">📺 Serie</option>
        </select>
        <input
          value={plataforma}
          onChange={(e) => setPlataforma(e.target.value)}
          placeholder="Plataforma (opcional)"
          className="w-40 rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
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
          titulo="Pendiente"
          items={pendientes}
          vacio="No hay nada pendiente por ver 🍿"
          usuarios={usuarios}
          onToggle={toggle}
          onAsignar={asignar}
          onRenombrar={renombrar}
          onCambiarTipoContenido={cambiarTipoContenido}
          onCambiarPlataforma={cambiarPlataforma}
          onEliminar={eliminar}
          onReordenar={reordenar}
          tachado={false}
        />
        <Columna
          titulo="Vista ✓"
          items={vistas}
          vacio="Nada visto todavía"
          usuarios={usuarios}
          onToggle={toggle}
          onAsignar={asignar}
          onRenombrar={renombrar}
          onCambiarTipoContenido={cambiarTipoContenido}
          onCambiarPlataforma={cambiarPlataforma}
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
  onRenombrar,
  onCambiarTipoContenido,
  onCambiarPlataforma,
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
  onRenombrar: (item: Item, texto: string) => void;
  onCambiarTipoContenido: (item: Item, tipo: TipoContenido) => void;
  onCambiarPlataforma: (item: Item, plataforma: string | null) => void;
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
            <FilaOrdenable key={item.id} id={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              {({ asaProps }) => (
                <>
                  <AsaArrastre asaProps={asaProps} />
                  <AsignadoBadge
                    usuarios={usuarios}
                    asignadoAId={item.asignadoAId}
                    onChange={(id) => onAsignar(item, id)}
                  />
                  <TipoContenidoBadge
                    tipo={item.tipoContenido ?? "PELICULA"}
                    onChange={(t) => onCambiarTipoContenido(item, t)}
                  />
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
                  <PlataformaEditable
                    plataforma={item.plataforma}
                    onChange={(p) => onCambiarPlataforma(item, p)}
                  />
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
