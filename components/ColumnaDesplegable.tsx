"use client";

import { useState } from "react";

// Envuelve el título+contador de cada columna (A comprar, Comprado...) para
// que se pueda plegar/desplegar tocándolo. Abierta por defecto: no cambia
// el comportamiento habitual, solo añade la opción de ocultarla.
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
  const [abierta, setAbierta] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className={`w-full flex items-center justify-between gap-2 mb-2 text-left font-semibold ${colorClass}`}
      >
        <span>
          {titulo} <span className="text-ink/40 font-normal">({count})</span>
        </span>
        <span className={`text-ink/30 text-xs transition-transform ${abierta ? "" : "-rotate-90"}`}>▾</span>
      </button>
      {extra}
      {abierta && children}
    </div>
  );
}
