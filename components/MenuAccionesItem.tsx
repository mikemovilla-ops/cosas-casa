"use client";

import { useState } from "react";

// Menú "⋯" genérico por item, para meter dentro lo secundario (quién lo
// añadió, mover a otra categoría...) sin tenerlo siempre visible en la fila.
// `children` recibe una función `cerrar` para que cada opción pueda cerrar
// el menú después de actuar.
export default function MenuAccionesItem({
  children,
}: {
  children: (cerrar: () => void) => React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        aria-label="Más opciones"
        aria-expanded={abierto}
        className="text-ink/30 hover:text-sage px-1.5 leading-none"
      >
        ⋯
      </button>
      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div
            className="absolute right-0 mt-1 w-48 max-w-[calc(100vw-2rem)] card z-40 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {children(() => setAbierto(false))}
          </div>
        </>
      )}
    </div>
  );
}
