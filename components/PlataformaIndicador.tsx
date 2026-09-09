"use client";

// Igual que EnlaceIndicador (ver ese componente): solo lectura, solo ocupa
// sitio en la fila si ya hay plataforma. Editar la plataforma se hace desde
// el menú "⋯" (PlataformaEditable), no tocando este badge.
export default function PlataformaIndicador({ plataforma }: { plataforma: string }) {
  return (
    <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border border-sage/40 text-sagedark bg-sage/10">
      {plataforma}
    </span>
  );
}
