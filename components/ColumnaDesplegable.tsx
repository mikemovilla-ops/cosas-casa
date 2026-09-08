"use client";

import { useState } from "react";

// Envuelve el título+contador de cada columna (A comprar, Comprado...) para
// que se pueda plegar/desplegar tocándolo. Encogida por defecto.
export default function ColumnaDesplegable({
  titulo,
  count,
  colorClass = "text-sagedark",
  extra,
  children,
}: {
  titulo: string;
  count: number;
  colorClass?: string;
  // Contenido siempre visible bajo el título, aunque la columna esté
  // plegada (p. ej. el total pendiente de Deudas).
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [abierta, setAbierta] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className={`w-full flex items-center justify-between gap-2 mb-2 -mx-2 px-2 py-1 rounded-md text-left font-semibold hover:bg-sand/30 transition ${colorClass}`}
      >
        <span>
          {titulo} <span className="text-ink/40 font-normal">({count})</span>
        </span>
        <span
          className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-sand bg-white text-sage text-sm transition-transform ${
            abierta ? "" : "-rotate-90"
          }`}
        >
          ▾
        </span>
      </button>
      {extra}
      {abierta && children}
    </div>
  );
}
