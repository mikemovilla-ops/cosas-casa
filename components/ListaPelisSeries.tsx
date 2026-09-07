"use client";

import { useState } from "react";
import {
  actualizarItem,
  crearItem,
  eliminarItem,
  fetchItems,
  reordenarColumna,
  type EstadoItem,
  type Item,
  type TipoContenido,
  type Usuario,
} from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import AsignadoBadge from "./AsignadoBadge";
import TipoContenidoBadge from "./TipoContenidoBadge";
import PlataformaEditable from "./PlataformaEditable";
import NotaEditable from "./NotaEditable";
import NombreEditable from "./NombreEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";

// Tailwind necesita las clases completas y estáticas en el código para
// detectarlas al compilar — de ahí el mapa en vez de construir el nombre
// de la clase dinámicamente con un template string.
const COLUMNAS: { estado: EstadoItem; label: string; textClass: string }[] = [
  { estado: "PENDIENTE", label: "Pendiente", textClass: "text-sagedark" },
  { estado: "EN_CURSO", label: "En curso", textClass: "text-mustard" },
  { estado: "HECHO", label: "Vista ✓", textClass: "text-emerald-600" },
];

export default function ListaPelisSeries({ usuarios }: { usuarios: Usuario[] }) {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("PELISERIE"));
  const [texto, setTexto] = useState("");
  const [tipoContenido, setTipoContenido] = useState<TipoContenido>("PELICULA");
  const [plataforma, setPlataforma] = useState("");
  const [asignadoAId, setAsignadoAId] = useState("");
  const [enviando, setEnviando] = useState(false);

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

  async function mover(item: Item, estado: EstadoItem) {
    if (item.estado === estado) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, estado } : i)));
    await actualizarItem(item.id, { estado });
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

      <div className="grid sm:grid-cols-3 gap-6">
        {COLUMNAS.map((cat) => {
          const vista = cat.estado === "HECHO";
          const itemsColumna = items.filter((i) => i.estado === cat.estado).sort((a, b) => a.orden - b.orden);
          return (
            <div key={cat.estado}>
              <h2 className={`font-semibold mb-2 ${cat.textClass}`}>
                {cat.label} <span className="text-ink/40 font-normal">({itemsColumna.length})</span>
              </h2>
              {itemsColumna.length === 0 ? (
                <p className="text-ink/40 text-sm italic">Nada por aquí</p>
              ) : (
                <ListaOrdenable items={itemsColumna} onReordenar={reordenar} className="card divide-y divide-sand">
                  {(item) => (
                    <FilaOrdenable key={item.id} id={item.id} className="px-3 py-2">
                      {({ asaProps }) => (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <AsaArrastre asaProps={asaProps} />
                            <AsignadoBadge
                              usuarios={usuarios}
                              asignadoAId={item.asignadoAId}
                              onChange={(id) => asignar(item, id)}
                            />
                            <TipoContenidoBadge
                              tipo={item.tipoContenido ?? "PELICULA"}
                              onChange={(t) => cambiarTipoContenido(item, t)}
                            />
                            <NombreEditable texto={item.texto} onGuardar={(t) => renombrar(item, t)}>
                              {(texto) => (
                                <span className={`flex-1 ${vista ? "line-through text-emerald-600/70" : ""}`}>
                                  {texto}
                                </span>
                              )}
                            </NombreEditable>
                            <PlataformaEditable
                              plataforma={item.plataforma}
                              onChange={(p) => cambiarPlataforma(item, p)}
                            />
                            {vista && (
                              <NotaEditable nota={item.nota} onChange={(n) => cambiarNota(item, n)} />
                            )}
                            <button
                              onClick={() => eliminar(item.id)}
                              aria-label="Eliminar"
                              className="text-ink/30 hover:text-clay transition px-1"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {COLUMNAS.filter((c) => c.estado !== item.estado).map((c) => (
                              <button
                                key={c.estado}
                                onClick={() => mover(item, c.estado)}
                                className="text-xs text-ink/50 border border-sand rounded px-1.5 py-0.5 hover:border-sage hover:text-sagedark transition"
                              >
                                → {c.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </FilaOrdenable>
                  )}
                </ListaOrdenable>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
