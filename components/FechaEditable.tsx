"use client";

import { useState } from "react";

function formatoCorto(fechaISO: string) {
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export default function FechaEditable({
  fecha,
  onChange,
}: {
  fecha: string;
  onChange: (fecha: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(fecha.slice(0, 10));

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setValor(fecha.slice(0, 10));
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (valor) onChange(valor);
    setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="date"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardar}
          className="text-xs rounded border border-sand px-1 py-0.5 bg-white focus:border-sage outline-none"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      title="Editar fecha"
      aria-label="Editar fecha de la deuda"
      className="shrink-0 text-[11px] text-ink/35 hover:text-sage px-0.5"
    >
      {formatoCorto(fecha)}
    </button>
  );
}
