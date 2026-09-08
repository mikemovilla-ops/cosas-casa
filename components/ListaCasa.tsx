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
  type Usuario,
} from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import AsignadoBadge from "./AsignadoBadge";
import CantidadStepper from "./CantidadStepper";
import EnlaceCasa from "./EnlaceCasa";
import NombreEditable from "./NombreEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";
import ColumnaDesplegable from "./ColumnaDesplegable";
import MenuAccionesItem from "./MenuAccionesItem";

// Tailwind necesita las clases completas y estáticas en el código para
// detectarlas al compilar — de ahí el mapa en vez de construir el nombre
// de la clase dinámicamente con un template string.
const CATEGORIAS: { estado: EstadoItem; label: string; textClass: string }[] = [
  { estado: "URGENTE", label: "Urgente", textClass: "text-clay" },
  { estado: "MEDIO", label: "Medio plazo", textClass: "text-mustard" },
  { estado: "LARGO", label: "Largo plazo", textClass: "text-sagedark" },
];

// Al añadir un item solo tiene sentido elegir una urgencia — "Comprado" es
// un estado al que se llega marcándolo, no de alta. Pero sí se muestra como
// columna y como destino al mover, para poder pasar cualquier urgencia
// directamente a comprado (y deshacerlo si hace falta).
const COLUMNAS = [
  ...CATEGORIAS,
  { estado: "COMPRADO" as EstadoItem, label: "Comprado/Hecho ✓", textClass: "text-emerald-600" },
];

export default function ListaCasa({ usuarios }: { usuarios: Usuario[] }) {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("CASA"));
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<EstadoItem>("MEDIO");
  const [cantidad, setCantidad] = useState(1);
  const [asignadoAId, setAsignadoAId] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("CASA", valor, {
        estado: categoria,
        cantidad,
        asignadoAId: asignadoAId || null,
      });
      setItems((prev) => [...prev, nuevo]);
      setCantidad(1);
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

  async function cambiarCantidad(item: Item, nuevaCantidad: number) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i)));
    await actualizarItem(item.id, { cantidad: nuevaCantidad });
    reload();
  }

  async function asignar(item: Item, nuevoAsignadoAId: string | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, asignadoAId: nuevoAsignadoAId } : i)));
    await actualizarItem(item.id, { asignadoAId: nuevoAsignadoAId });
    reload();
  }

  async function renombrar(item: Item, nuevoTexto: string) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, texto: nuevoTexto } : i)));
    await actualizarItem(item.id, { texto: nuevoTexto });
    reload();
  }

  async function cambiarEnlace(item: Item, enlace: string | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, enlace } : i)));
    await actualizarItem(item.id, { enlace });
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
          placeholder="¿Qué necesitamos para la casa?"
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
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as EstadoItem)}
          className="rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.estado} value={c.estado}>
              {c.label}
            </option>
          ))}
        </select>
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNAS.map((cat) => {
          const comprado = cat.estado === "COMPRADO";
          const itemsColumna = items
            .filter((i) => i.estado === cat.estado)
            .sort((a, b) => a.orden - b.orden);
          return (
            <ColumnaDesplegable key={cat.estado} titulo={cat.label} count={itemsColumna.length} colorClass={cat.textClass}>
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
                            <NombreEditable texto={item.texto} onGuardar={(t) => renombrar(item, t)}>
                              {(texto) => (
                                <span className={`flex-1 ${comprado ? "line-through text-emerald-600/70" : ""}`}>
                                  {texto}
                                </span>
                              )}
                            </NombreEditable>
                            <CantidadStepper cantidad={item.cantidad} onChange={(n) => cambiarCantidad(item, n)} />
                            <EnlaceCasa enlace={item.enlace} onChange={(url) => cambiarEnlace(item, url)} />
                            <MenuAccionesItem>
                              {(cerrar) => {
                                const creador = usuarios.find((u) => u.id === item.creadoPorId);
                                return (
                                  <>
                                    {creador && (
                                      <p className="text-[11px] text-ink/40 px-1.5 pb-1.5">
                                        Añadido por {creador.name?.split(" ")[0] ?? creador.email}
                                      </p>
                                    )}
                                    <p className="text-xs text-ink/40 px-1.5 pb-1">Mover a</p>
                                    {COLUMNAS.filter((c) => c.estado !== item.estado).map((c) => (
                                      <button
                                        key={c.estado}
                                        onClick={() => {
                                          mover(item, c.estado);
                                          cerrar();
                                        }}
                                        className={`w-full text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition ${
                                          c.estado === "COMPRADO" ? "text-emerald-600" : "text-ink"
                                        }`}
                                      >
                                        → {c.label}
                                      </button>
                                    ))}
                                  </>
                                );
                              }}
                            </MenuAccionesItem>
                            <button
                              onClick={() => eliminar(item.id)}
                              aria-label="Eliminar"
                              className="text-ink/30 hover:text-clay transition px-1"
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      )}
                    </FilaOrdenable>
                  )}
                </ListaOrdenable>
              )}
            </ColumnaDesplegable>
          );
        })}
      </div>
    </div>
  );
}
