"use client";

import { useState } from "react";

function formatoCorto(fechaISO: string) {
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export default function FechaEditable({
  fecha,
  onChange,
  etiquetaVacio = "+ fecha",
  permitirBorrar = true,
}: {
  fecha: string | null;
  onChange: (fecha: string | null) => void;
  etiquetaVacio?: string;
  permitirBorrar?: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(fecha?.slice(0, 10) ?? "");

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setValor(fecha?.slice(0, 10) ?? "");
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    onChange(valor || null);
    setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="date"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardar}
          className="text-xs rounded border border-sand px-1 py-0.5 bg-white focus:border-sage outline-none"
        />
        {fecha && permitirBorrar && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setEditando(false);
            }}
            aria-label="Quitar fecha"
            className="text-ink/30 hover:text-clay px-0.5"
          >
            ✕
          </button>
        )}
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      title="Editar fecha"
      aria-label="Editar fecha"
      className={`shrink-0 text-[11px] px-0.5 ${fecha ? "text-ink/35 hover:text-sage" : "text-ink/25 hover:text-sage"}`}
    >
      {fecha ? formatoCorto(fecha) : etiquetaVacio}
    </button>
  );
}
