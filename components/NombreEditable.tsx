"use client";

import { useState } from "react";

// Devuelve el texto de visualización (children) más un lápiz para entrar en
// modo edición, o un input en su lugar mientras se edita. El elemento de
// visualización lo decide cada lista (en Compra es un botón que además
// alterna A comprar/Comprado; en Casa es un simple <span>), por eso se pasa
// como render prop en vez de fijarlo aquí.
export default function NombreEditable({
  texto,
  onGuardar,
  children,
}: {
  texto: string;
  onGuardar: (texto: string) => void;
  children: (texto: string) => React.ReactNode;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(texto);

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setValor(texto);
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = valor.trim();
    if (limpio && limpio !== texto) onGuardar(limpio);
    setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="flex-1 min-w-[8rem]" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardar}
          onKeyDown={(e) => e.key === "Escape" && setEditando(false)}
          className="w-full text-sm rounded border border-sand px-1.5 py-0.5 bg-white focus:border-sage outline-none"
        />
      </form>
    );
  }

  return (
    <>
      {children(texto)}
      <button
        type="button"
        onClick={abrir}
        aria-label="Editar nombre"
        className="shrink-0 text-ink/25 hover:text-sage text-[11px] px-0.5"
      >
        ✎
      </button>
    </>
  );
}
