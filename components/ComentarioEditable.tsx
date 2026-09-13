"use client";

import { useState } from "react";

// Textarea de tu propio comentario sobre un restaurante, dentro del menú
// "⋯" (a diferencia de PlataformaEditable/TipoCocinaEditable no hace falta
// un paso de "click para editar": al estar ya dentro de un menú desplegado,
// se muestra directamente editable).
export default function ComentarioEditable({
  comentario,
  onGuardar,
}: {
  comentario: string | null;
  onGuardar: (comentario: string | null) => void;
}) {
  const [valor, setValor] = useState(comentario ?? "");

  function guardar() {
    const limpio = valor.trim();
    if (limpio !== (comentario ?? "")) onGuardar(limpio || null);
  }

  return (
    <textarea
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      onBlur={guardar}
      onClick={(e) => e.stopPropagation()}
      placeholder="¿Qué tal la experiencia?"
      rows={2}
      className="w-full text-sm rounded border border-sand px-1.5 py-1 bg-white focus:border-sage outline-none resize-none"
    />
  );
}
