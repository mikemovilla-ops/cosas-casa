"use client";

import { useState } from "react";

// Editor del enlace pensado para vivir dentro del menú "⋯" (filas de texto,
// no un control suelto en la fila) — el indicador de solo lectura que sí va
// en la fila es EnlaceIndicador, y solo aparece si ya hay enlace.
export default function EnlaceCasa({
  enlace,
  onChange,
  cerrar,
}: {
  enlace: string | null;
  onChange: (enlace: string | null) => void;
  cerrar: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(enlace ?? "");

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = valor.trim();
    if (!limpio) {
      setEditando(false);
      return;
    }
    onChange(limpio.startsWith("http") ? limpio : `https://${limpio}`);
    setEditando(false);
    cerrar();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="px-1.5 py-1 flex flex-col gap-1.5">
        <input
          type="url"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="https://..."
          className="w-full text-sm campo rounded px-1.5 py-1"
        />
        <div className="flex gap-1">
          <button
            type="submit"
            className="flex-1 text-xs bg-acento text-fondooscuro rounded px-2 py-1 hover:bg-acentovivo transition"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="text-xs text-tinta/40 hover:text-tinta/70 px-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setValor(enlace ?? "");
          setEditando(true);
        }}
        className="w-full text-left text-sm px-1.5 py-1.5 rounded hover:bg-borde/40 transition text-tinta"
      >
        {enlace ? "✎ Editar enlace" : "+ Añadir enlace"}
      </button>
      {enlace && (
        <button
          onClick={() => {
            onChange(null);
            cerrar();
          }}
          className="w-full text-left text-sm px-1.5 py-1.5 rounded hover:bg-borde/40 transition text-coral"
        >
          ✕ Quitar enlace
        </button>
      )}
    </>
  );
}
