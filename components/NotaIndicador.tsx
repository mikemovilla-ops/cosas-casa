"use client";

// Igual que EnlaceIndicador (ver ese componente): solo lectura, solo ocupa
// sitio en la fila si ya hay nota puesta. Poner/cambiar la nota se hace
// desde el menú "⋯" (NotaEditable), no tocando este badge.
export default function NotaIndicador({ nota }: { nota: number }) {
  return (
    <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border border-mustard/40 text-mustard bg-mustard/10">
      ⭐ {nota}/10
    </span>
  );
}
