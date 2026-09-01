"use client";

import { useState } from "react";
import { actualizarEstado, crearItem, eliminarItem, fetchItems, type EstadoItem, type Item } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";

// Tailwind necesita las clases completas y estáticas en el código para
// detectarlas al compilar — de ahí el mapa en vez de construir el nombre
// de la clase dinámicamente con un template string.
const CATEGORIAS: { estado: EstadoItem; label: string; textClass: string }[] = [
  { estado: "URGENTE", label: "Urgente", textClass: "text-clay" },
  { estado: "MEDIO", label: "Medio plazo", textClass: "text-mustard" },
  { estado: "LARGO", label: "Largo plazo", textClass: "text-sagedark" },
];

export default function ListaCasa() {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("CASA"));
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<EstadoItem>("MEDIO");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = texto.trim();
    if (!valor || enviando) return;
    setEnviando(true);
    setTexto("");
    try {
      const nuevo = await crearItem("CASA", valor, categoria);
      setItems((prev) => [...prev, nuevo]);
    } finally {
      setEnviando(false);
    }
  }

  async function mover(item: Item, estado: EstadoItem) {
    if (item.estado === estado) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, estado } : i)));
    await actualizarEstado(item.id, estado);
    reload();
  }

  async function eliminar(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await eliminarItem(id);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué necesitamos para la casa?"
          className="flex-1 rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
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
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="bg-sage text-white font-medium px-4 py-2 rounded-md hover:bg-sagedark transition disabled:opacity-40"
        >
          Añadir
        </button>
      </form>

      <div className="grid sm:grid-cols-3 gap-6">
        {CATEGORIAS.map((cat) => (
          <div key={cat.estado}>
            <h2 className={`font-semibold mb-2 ${cat.textClass}`}>
              {cat.label}{" "}
              <span className="text-ink/40 font-normal">
                ({items.filter((i) => i.estado === cat.estado).length})
              </span>
            </h2>
            {items.filter((i) => i.estado === cat.estado).length === 0 ? (
              <p className="text-ink/40 text-sm italic">Nada por aquí</p>
            ) : (
              <ul className="card divide-y divide-sand">
                {items
                  .filter((i) => i.estado === cat.estado)
                  .map((item) => (
                    <li key={item.id} className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex-1">{item.texto}</span>
                        <button
                          onClick={() => eliminar(item.id)}
                          aria-label="Eliminar"
                          className="text-ink/30 hover:text-clay transition px-1"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {CATEGORIAS.filter((c) => c.estado !== item.estado).map((c) => (
                          <button
                            key={c.estado}
                            onClick={() => mover(item, c.estado)}
                            className="text-xs text-ink/50 border border-sand rounded px-1.5 py-0.5 hover:border-sage hover:text-sagedark transition"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
