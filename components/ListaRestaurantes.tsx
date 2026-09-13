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
  type Item,
  type Usuario,
} from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import AsignadoBadge from "./AsignadoBadge";
import NombreEditable from "./NombreEditable";
import TipoCocinaEditable from "./TipoCocinaEditable";
import ComentarioEditable from "./ComentarioEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";
import ColumnaDesplegable from "./ColumnaDesplegable";
import MenuAccionesItem from "./MenuAccionesItem";

export default function ListaRestaurantes({ usuarios }: { usuarios: Usuario[] }) {
  const { data: session } = useSession();
  const miUserId = session?.user?.id;
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("RESTAURANTE"));
  const [texto, setTexto] = useState("");
  const [tipoCocina, setTipoCocina] = useState("");
  const [asignadoAId, setAsignadoAId] = useState("");
  const [enviando, setEnviando] = useState(false);

  const pendientes = items.filter((i) => i.estado === "PENDIENTE").sort((a, b) => a.orden - b.orden);
  // "Hemos ido" va alfabético (y sin arrastre manual) igual que en
  // Compra/Casa/Pelis.
  const idos = items
    .filter((i) => i.estado === "HECHO")
    .sort((a, b) => a.texto.localeCompare(b.texto, "es", { sensitivity: "base" }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("RESTAURANTE", valor, {
        tipoCocina: tipoCocina.trim() || undefined,
        asignadoAId: asignadoAId || null,
      });
      setItems((prev) => [...prev, nuevo]);
      setTipoCocina("");
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

  async function cambiarTipoCocina(item: Item, nuevoTipoCocina: string | null) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, tipoCocina: nuevoTipoCocina } : i)));
    await actualizarItem(item.id, { tipoCocina: nuevoTipoCocina });
    reload();
  }

  // Guarda TU reseña (nota y/o comentario) sobre un restaurante — nunca la
  // de la otra persona. Actualiza en local la tuya dentro de item.resenas
  // (sustituyéndola si ya existía) para que la media se refleje al momento.
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
          placeholder="¿Qué restaurante?"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
        <input
          value={tipoCocina}
          onChange={(e) => setTipoCocina(e.target.value)}
          placeholder="Tipo de cocina (opcional)"
          className="w-44 rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
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
          miUserId={miUserId}
          vista={false}
          onToggle={toggle}
          onAsignar={asignar}
          onRenombrar={renombrar}
          onTipoCocina={cambiarTipoCocina}
          onResena={cambiarResena}
          onEliminar={eliminar}
          onReordenar={reordenar}
        />
        <Columna
          titulo="Hemos ido ✓"
          items={idos}
          vacio="Todavía no hemos ido a ninguno"
          usuarios={usuarios}
          miUserId={miUserId}
          vista
          onToggle={toggle}
          onAsignar={asignar}
          onRenombrar={renombrar}
          onTipoCocina={cambiarTipoCocina}
          onResena={cambiarResena}
          onEliminar={eliminar}
          onReordenar={reordenar}
          ordenable={false}
        />
      </div>
    </div>
  );
}

function nombreCorto(usuarios: Usuario[], userId: string) {
  const u = usuarios.find((u) => u.id === userId);
  return u?.name?.split(" ")[0] ?? u?.email ?? "Alguien";
}

function Columna({
  titulo,
  items,
  vacio,
  usuarios,
  miUserId,
  vista,
  onToggle,
  onAsignar,
  onRenombrar,
  onTipoCocina,
  onResena,
  onEliminar,
  onReordenar,
  ordenable = true,
}: {
  titulo: string;
  items: Item[];
  vacio: string;
  usuarios: Usuario[];
  miUserId: string | undefined;
  vista: boolean;
  onToggle: (item: Item) => void;
  onAsignar: (item: Item, asignadoAId: string | null) => void;
  onRenombrar: (item: Item, texto: string) => void;
  onTipoCocina: (item: Item, tipoCocina: string | null) => void;
  onResena: (item: Item, cambios: { nota?: number | null; comentario?: string | null }) => void;
  onEliminar: (id: string) => void;
  onReordenar: (itemsReordenados: Item[]) => void;
  // false para columnas con orden fijo (p. ej. "Hemos ido", alfabético)
  // donde arrastrar para reordenar no tendría ningún efecto visible.
  ordenable?: boolean;
}) {
  function fila(item: Item, asaProps?: React.HTMLAttributes<HTMLElement>) {
    const notas = item.resenas.filter((r) => r.nota != null).map((r) => r.nota as number);
    const media = notas.length ? notas.reduce((s, n) => s + n, 0) / notas.length : null;
    const miResena = miUserId ? item.resenas.find((r) => r.userId === miUserId) : undefined;
    const comentarios = item.resenas.filter((r) => r.comentario);

    return (
      <>
        {asaProps && <AsaArrastre asaProps={asaProps} />}
        <AsignadoBadge usuarios={usuarios} asignadoAId={item.asignadoAId} onChange={(id) => onAsignar(item, id)} />
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
        <TipoCocinaEditable tipoCocina={item.tipoCocina} onChange={(t) => onTipoCocina(item, t)} />
        {vista && media !== null && (
          <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border border-mustard/40 text-mustard bg-mustard/10">
            ⭐ {media.toFixed(1)}/10
          </span>
        )}
        {vista && (
          <MenuAccionesItem>
            {() => (
              <>
                <p className="text-xs text-ink/40 px-1.5 pb-1">Tu nota</p>
                <select
                  value={miResena?.nota ?? ""}
                  onChange={(e) => onResena(item, { nota: e.target.value ? Number(e.target.value) : null })}
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
                    onGuardar={(c) => onResena(item, { comentario: c })}
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
          </MenuAccionesItem>
        )}
        <button
          onClick={() => onEliminar(item.id)}
          aria-label="Eliminar"
          className="text-ink/30 hover:text-clay transition px-1"
        >
          ✕
        </button>
      </>
    );
  }

  return (
    <ColumnaDesplegable
      titulo={titulo}
      count={items.length}
      colorClass={vista ? "text-emerald-600" : "text-sagedark"}
    >
      {items.length === 0 ? (
        <p className="text-ink/40 text-sm italic">{vacio}</p>
      ) : ordenable ? (
        <ListaOrdenable items={items} onReordenar={onReordenar} className="card divide-y divide-sand">
          {(item) => (
            <FilaOrdenable key={item.id} id={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              {({ asaProps }) => fila(item, asaProps)}
            </FilaOrdenable>
          )}
        </ListaOrdenable>
      ) : (
        <ul className="card divide-y divide-sand">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              {fila(item)}
            </li>
          ))}
        </ul>
      )}
    </ColumnaDesplegable>
  );
}
