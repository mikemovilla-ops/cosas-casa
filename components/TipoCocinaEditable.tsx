"use client";

import { useState } from "react";

// Campo de texto corto opcional con edición inline — como PlataformaEditable
// pero para el tipo de cocina de un restaurante.
export default function TipoCocinaEditable({
  tipoCocina,
  onChange,
}: {
  tipoCocina: string | null;
  onChange: (tipoCocina: string | null) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(tipoCocina ?? "");

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setValor(tipoCocina ?? "");
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
          placeholder="Chino, japonés..."
          className="w-28 text-xs rounded border border-sand px-1.5 py-0.5 bg-white focus:border-sage outline-none"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      title="Editar tipo de cocina"
      aria-label="Editar tipo de cocina"
      className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border ${
        tipoCocina
          ? "border-sage/40 text-sagedark bg-sage/10 hover:bg-sage/20"
          : "border-sand text-ink/30 hover:text-sage"
      }`}
    >
      {tipoCocina ?? "+ cocina"}
    </button>
  );
}
