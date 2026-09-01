"use client";

import { useState } from "react";

export default function EnlaceCasa({
  enlace,
  onChange,
}: {
  enlace: string | null;
  onChange: (enlace: string | null) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(enlace ?? "");

  function abrirEdicion() {
    setValor(enlace ?? "");
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = valor.trim();
    if (!limpio) {
      setEditando(false);
      return;
    }
    onChange(limpio.startsWith("http") ? limpio : `https://${limpio}`);
    setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="flex items-center gap-1 shrink-0">
        <input
          type="url"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="https://..."
          className="w-32 text-xs rounded border border-sand px-1.5 py-0.5 bg-white focus:border-sage outline-none"
        />
        <button type="submit" aria-label="Guardar enlace" className="text-sage hover:text-sagedark px-0.5">
          ✓
        </button>
        {enlace && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setEditando(false);
            }}
            aria-label="Quitar enlace"
            className="text-ink/30 hover:text-clay px-0.5"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={() => setEditando(false)}
          aria-label="Cancelar"
          className="text-ink/30 hover:text-ink/60 px-0.5"
        >
          ×
        </button>
      </form>
    );
  }

  if (enlace) {
    return (
      <div className="flex items-center gap-0.5 shrink-0">
        <a
          href={enlace}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir enlace"
          aria-label="Abrir enlace de compra"
          className="text-sage hover:text-sagedark px-0.5"
        >
          🔗
        </a>
        <button
          onClick={abrirEdicion}
          aria-label="Editar enlace"
          className="text-[10px] text-ink/30 hover:text-clay px-0.5"
        >
          ✎
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={abrirEdicion}
      title="Añadir enlace a la tienda"
      aria-label="Añadir enlace a la tienda"
      className="shrink-0 text-ink/25 hover:text-sage px-0.5"
    >
      🔗
    </button>
  );
}
