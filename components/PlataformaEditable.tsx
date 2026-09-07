"use client";

import { useState } from "react";

// Campo de texto corto opcional con edición inline — como FechaEditable
// pero para texto libre (la plataforma donde ver algo).
export default function PlataformaEditable({
  plataforma,
  onChange,
}: {
  plataforma: string | null;
  onChange: (plataforma: string | null) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(plataforma ?? "");

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setValor(plataforma ?? "");
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    onChange(valor.trim() || null);
    setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardar}
          placeholder="Netflix, HBO..."
          className="w-24 text-xs rounded border border-sand px-1.5 py-0.5 bg-white focus:border-sage outline-none"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      title="Editar plataforma"
      aria-label="Editar plataforma"
      className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border ${
        plataforma
          ? "border-sage/40 text-sagedark bg-sage/10 hover:bg-sage/20"
          : "border-sand text-ink/30 hover:text-sage"
      }`}
    >
      {plataforma ?? "+ plataforma"}
    </button>
  );
}
