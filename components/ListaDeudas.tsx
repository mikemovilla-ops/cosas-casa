"use client";

import { useState } from "react";
import { actualizarItem, calcularOrden, crearItem, eliminarItem, fetchItems, type Item } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import NombreEditable from "./NombreEditable";
import FechaEditable from "./FechaEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";

function euros(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

// Lista personal de deudas (solo la ve quien la crea). "Me deben" y "Debo"
// son dos columnas separadas por la dirección de la deuda; dentro de cada
// una, tocar el item marca la deuda como pagada (se tacha) sin necesidad de
// borrarla, y el total de arriba solo suma lo pendiente.
export default function ListaDeudas() {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("DEUDA"));
  const [texto, setTexto] = useState("");
  const [importe, setImporte] = useState("");
  const [meDeben, setMeDeben] = useState(true);
  const [fecha, setFecha] = useState(hoy());
  const [enviando, setEnviando] = useState(false);

  const meDebenItems = items.filter((i) => i.meDeben === true).sort((a, b) => a.orden - b.orden);
  const deboItems = items.filter((i) => i.meDeben === false).sort((a, b) => a.orden - b.orden);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valorTexto = texto.trim();
    const valorImporte = Number(importe.replace(",", "."));
    if (!valorTexto || !Number.isFinite(valorImporte) || valorImporte <= 0 || enviando) return;
    setEnviando(true);
    setTexto("");
    setImporte("");
    try {
      const nuevo = await crearItem("DEUDA", valorTexto, { importe: valorImporte, meDeben, fecha });
      setItems((prev) => [...prev, nuevo]);
      setFecha(hoy());
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarFecha(item: Item, nuevaFecha: string) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, fecha: nuevaFecha } : i)));
    await actualizarItem(item.id, { fecha: nuevaFecha });
    reload();
  }

  async function togglePagada(item: Item) {
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

  async function reordenar(id: string, antes: Item | null, despues: Item | null) {
    const nuevoOrden = calcularOrden(antes, despues);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, orden: nuevoOrden } : i)));
    await actualizarItem(id, { orden: nuevoOrden });
    reload();
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 mb-6">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Quién / por qué?"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
          placeholder="€"
          aria-label="Importe"
          className="w-24 rounded-md border border-sand px-2 py-2 bg-white focus:border-sage outline-none"
        />
        <select
          value={meDeben ? "si" : "no"}
          onChange={(e) => setMeDeben(e.target.value === "si")}
          className="rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        >
          <option value="si">Me deben</option>
          <option value="no">Debo</option>
        </select>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          aria-label="Fecha"
          className="rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim() || !importe || enviando}
          className="bg-sage text-white font-medium px-4 py-2 rounded-md hover:bg-sagedark transition disabled:opacity-40"
        >
          Añadir
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-6">
        <Columna
          titulo="Me deben"
          items={meDebenItems}
          vacio="Nadie te debe nada por aquí"
          onTogglePagada={togglePagada}
          onRenombrar={renombrar}
          onCambiarFecha={cambiarFecha}
          onEliminar={eliminar}
          onReordenar={reordenar}
        />
        <Columna
          titulo="Debo"
          items={deboItems}
          vacio="No debes nada por aquí"
          onTogglePagada={togglePagada}
          onRenombrar={renombrar}
          onCambiarFecha={cambiarFecha}
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
  onTogglePagada,
  onRenombrar,
  onCambiarFecha,
  onEliminar,
  onReordenar,
}: {
  titulo: string;
  items: Item[];
  vacio: string;
  onTogglePagada: (item: Item) => void;
  onRenombrar: (item: Item, texto: string) => void;
  onCambiarFecha: (item: Item, fecha: string) => void;
  onEliminar: (id: string) => void;
  onReordenar: (id: string, antes: Item | null, despues: Item | null) => void;
}) {
  const totalPendiente = items
    .filter((i) => i.estado === "PENDIENTE")
    .reduce((suma, i) => suma + (i.importe ?? 0), 0);

  return (
    <div>
      <h2 className="font-semibold text-sagedark mb-2">
        {titulo} <span className="text-ink/40 font-normal">({items.length})</span>
      </h2>
      {items.length > 0 && (
        <p className="text-sm text-ink/60 mb-2">
          Total pendiente: <span className="font-semibold text-ink">{euros(totalPendiente)}</span>
        </p>
      )}
      {items.length === 0 ? (
        <p className="text-ink/40 text-sm italic">{vacio}</p>
      ) : (
        <ListaOrdenable items={items} onReordenar={onReordenar} className="card divide-y divide-sand">
          {(item) => {
            const pagada = item.estado === "HECHO";
            return (
              <FilaOrdenable key={item.id} id={item.id} className="flex items-center gap-2 px-3 py-2">
                {({ asaProps }) => (
                  <>
                    <AsaArrastre asaProps={asaProps} />
                    <NombreEditable texto={item.texto} onGuardar={(t) => onRenombrar(item, t)}>
                      {(texto) => (
                        <button
                          onClick={() => onTogglePagada(item)}
                          className={`flex-1 text-left ${pagada ? "line-through text-emerald-600/70" : "text-ink"}`}
                        >
                          {texto}
                          <span className={`ml-1.5 text-sm ${pagada ? "" : "font-semibold text-clay"}`}>
                            {euros(item.importe ?? 0)}
                          </span>
                        </button>
                      )}
                    </NombreEditable>
                    <FechaEditable fecha={item.fecha ?? item.createdAt} onChange={(f) => onCambiarFecha(item, f)} />
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
            );
          }}
        </ListaOrdenable>
      )}
    </div>
  );
}
