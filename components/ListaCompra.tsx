"use client";

import { useState } from "react";
import { actualizarEstado, crearItem, eliminarItem, fetchItems, type Item } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";

export default function ListaCompra() {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("COMPRA"));
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const aComprar = items.filter((i) => i.estado === "A_COMPRAR");
  const comprado = items.filter((i) => i.estado === "COMPRADO");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("COMPRA", valor);
      setItems((prev) => [...prev, nuevo]);
    } finally {
      setEnviando(false);
    }
  }

  async function toggle(item: Item) {
    const nuevoEstado = item.estado === "A_COMPRAR" ? "COMPRADO" : "A_COMPRAR";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, estado: nuevoEstado } : i)));
    await actualizarEstado(item.id, nuevoEstado);
    reload();
  }

  async function eliminar(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await eliminarItem(id);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex gap-2 mb-6">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué necesitamos comprar?"
          className="flex-1 rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
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
          titulo="A comprar"
          items={aComprar}
          vacio="No hay nada pendiente 🎉"
          onToggle={toggle}
          onEliminar={eliminar}
          tachado={false}
        />
        <Columna
          titulo="Comprado"
          items={comprado}
          vacio="Nada comprado todavía"
          onToggle={toggle}
          onEliminar={eliminar}
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
  onEliminar,
  tachado,
}: {
  titulo: string;
  items: Item[];
  vacio: string;
  onToggle: (item: Item) => void;
  onEliminar: (id: string) => void;
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
        <ul className="card divide-y divide-sand">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 px-3 py-2">
              <button
                onClick={() => onToggle(item)}
                className={`flex-1 text-left ${tachado ? "line-through text-ink/40" : "text-ink"}`}
              >
                {item.texto}
              </button>
              <button
                onClick={() => onEliminar(item.id)}
                aria-label="Eliminar"
                className="text-ink/30 hover:text-clay transition px-1"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
