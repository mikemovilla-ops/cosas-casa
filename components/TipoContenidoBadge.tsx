"use client";

import type { TipoContenido } from "@/lib/api-client";

const INFO: Record<TipoContenido, { emoji: string; label: string }> = {
  PELICULA: { emoji: "🎬", label: "Película" },
  SERIE: { emoji: "📺", label: "Serie" },
};

export default function TipoContenidoBadge({
  tipo,
  onChange,
}: {
  tipo: TipoContenido;
  onChange: (tipo: TipoContenido) => void;
}) {
  function alternar() {
    onChange(tipo === "PELICULA" ? "SERIE" : "PELICULA");
  }

  return (
    <button
      type="button"
      onClick={alternar}
      title={`${INFO[tipo].label} — tocar para cambiar`}
      aria-label={`Tipo: ${INFO[tipo].label}. Tocar para cambiar.`}
      className="shrink-0 text-base leading-none px-0.5"
    >
      {INFO[tipo].emoji}
    </button>
  );
}
