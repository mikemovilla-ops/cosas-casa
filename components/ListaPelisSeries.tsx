"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  actualizarItem,
  crearItem,
  eliminarItem,
  fetchItems,
  guardarResena,
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
import PlataformaIndicador from "./PlataformaIndicador";
import ComentarioEditable from "./ComentarioEditable";
import NombreEditable from "./NombreEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";
import ColumnaDesplegable from "./ColumnaDesplegable";
import MenuAccionesItem from "./MenuAccionesItem";

// Tailwind necesita las clases completas y estáticas en el código para
// detectarlas al compilar — de ahí el mapa en vez de construir el nombre
// de la clase dinámicamente con un template string.
const COLUMNAS: { estado: EstadoItem; label: string; textClass: string }[] = [
  { estado: "PENDIENTE", label: "Pendiente", textClass: "text-sagedark" },
  { estado: "EN_CURSO", label: "En curso", textClass: "text-mustard" },
  { estado: "HECHO", label: "Vista ✓", textClass: "text-emerald-600" },
];

function nombreCorto(usuarios: Usuario[], userId: string) {
  const u = usuarios.find((u) => u.id === userId);
  return u?.name?.split(" ")[0] ?? u?.email ?? "Alguien";
}

export default function ListaPelisSeries({ usuarios }: { usuarios: Usuario[] }) {
  const { data: session } = useSession();
  const miUserId = session?.user?.id;
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

  // Guarda TU reseña (nota y/o comentario) sobre una peli/serie vista —
  // nunca la de la otra persona. Actualiza en local la tuya dentro de
  // item.resenas (sustituyéndola si ya existía) para que la media se
  // refleje al momento.
  async function cambiarResena(item: Item, cambios: { nota?: number | null; comentario?: string | null }) {
    if (!miUserId) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i;
        const mia = i.resenas.find((r) => r.userId === miUserId);
        const actualizada = { userId: miUserId, nota: mia?.nota ?? null, comentario: mia?.comentario ?? null, ...cambios };
        return { ...i, resenas: [...i.resenas.filter((r) => r.userId !== miUserId), actualizada] };
      })
    );
    await guardarResena(item.id, cambios);
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
          // "Vista" va alfabética (y sin arrastre manual) igual que en
          // Compra/Casa — encontrar un título importa más que el orden en
          // que se fue viendo.
          const itemsColumna = vista
            ? items
                .filter((i) => i.estado === cat.estado)
                .sort((a, b) => a.texto.localeCompare(b.texto, "es", { sensitivity: "base" }))
            : items.filter((i) => i.estado === cat.estado).sort((a, b) => a.orden - b.orden);

          const fila = (item: Item, asaProps?: React.HTMLAttributes<HTMLElement>) => {
            const notas = item.resenas.filter((r) => r.nota != null).map((r) => r.nota as number);
            const media = notas.length ? notas.reduce((s, n) => s + n, 0) / notas.length : null;
            const miResena = miUserId ? item.resenas.find((r) => r.userId === miUserId) : undefined;
            const comentarios = item.resenas.filter((r) => r.comentario);

            return (
            <div className="flex flex-wrap items-center gap-2">
              {asaProps && <AsaArrastre asaProps={asaProps} />}
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
                  <span className={`flex-1 ${vista ? "line-through text-emerald-600/70" : ""}`}>{texto}</span>
                )}
              </NombreEditable>
              {item.plataforma && <PlataformaIndicador plataforma={item.plataforma} />}
              {vista && media !== null && (
                <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border border-mustard/40 text-mustard bg-mustard/10">
                  ⭐ {media.toFixed(1)}/10
                </span>
              )}
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

                      <p className="text-xs text-ink/40 px-1.5 pb-1">Plataforma</p>
                      <div className="px-1.5 pb-2">
                        <PlataformaEditable
                          plataforma={item.plataforma}
                          onChange={(p) => cambiarPlataforma(item, p)}
                        />
                      </div>

                      {vista && (
                        <>
                          <p className="text-xs text-ink/40 px-1.5 pb-1">Tu nota</p>
                          <select
                            value={miResena?.nota ?? ""}
                            onChange={(e) =>
                              cambiarResena(item, { nota: e.target.value ? Number(e.target.value) : null })
                            }
                            className="w-full mb-2 text-sm rounded border border-sand px-1.5 py-1 bg-white focus:border-sage outline-none"
                          >
                            <option value="">Sin nota</option>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}/10
                              </option>
                            ))}
                          </select>

                          <p className="text-xs text-ink/40 px-1.5 pb-1">Tu comentario</p>
                          <div className="px-1.5 pb-2">
                            <ComentarioEditable
                              comentario={miResena?.comentario ?? null}
                              onGuardar={(c) => cambiarResena(item, { comentario: c })}
                            />
                          </div>

                          {comentarios.length > 0 && (
                            <>
                              <div className="border-t border-sand my-1" />
                              <p className="text-xs text-ink/40 px-1.5 pb-1">Comentarios</p>
                              <div className="px-1.5 pb-1 space-y-1.5">
                                {comentarios.map((r) => (
                                  <p key={r.userId} className="text-xs text-ink/70">
                                    <span className="font-medium text-ink">{nombreCorto(usuarios, r.userId)}</span>
                                    {r.nota && <span className="text-mustard"> ({r.nota}/10)</span>}: {r.comentario}
                                  </p>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      )}

                      <div className="border-t border-sand my-1" />
                      <p className="text-xs text-ink/40 px-1.5 pb-1">Mover a</p>
                      {COLUMNAS.filter((c) => c.estado !== item.estado).map((c) => (
                        <button
                          key={c.estado}
                          onClick={() => {
                            mover(item, c.estado);
                            cerrar();
                          }}
                          className={`w-full text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition ${
                            c.estado === "HECHO" ? "text-emerald-600" : "text-ink"
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
            );
          };

          return (
            <ColumnaDesplegable key={cat.estado} titulo={cat.label} count={itemsColumna.length} colorClass={cat.textClass}>
              {itemsColumna.length === 0 ? (
                <p className="text-ink/40 text-sm italic">Nada por aquí</p>
              ) : vista ? (
                <ul className="card divide-y divide-sand">
                  {itemsColumna.map((item) => (
                    <li key={item.id} className="px-3 py-2">
                      {fila(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <ListaOrdenable items={itemsColumna} onReordenar={reordenar} className="card divide-y divide-sand">
                  {(item) => (
                    <FilaOrdenable key={item.id} id={item.id} className="px-3 py-2">
                      {({ asaProps }) => fila(item, asaProps)}
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
