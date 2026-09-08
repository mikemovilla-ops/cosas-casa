"use client";

// Icono de solo lectura para la fila: se muestra únicamente cuando el item
// ya tiene un enlace (si no lo tiene, no ocupa sitio en la fila — añadirlo
// se hace desde el menú "⋯", ver EnlaceCasa). Un SVG, no el emoji 🔗: los
// emoji se pintan a todo color en el móvil e ignoran el color de texto CSS.
export default function EnlaceIndicador({ enlace }: { enlace: string }) {
  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir enlace"
      aria-label="Abrir enlace de compra"
      className="shrink-0 text-sage hover:text-sagedark px-0.5"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    </a>
  );
}
