"use client";

// Insignia circular para marcar/desmarcar un item como urgente (Compra y
// Tareas). Es un círculo con "!" y no el emoji ❗ porque el emoji se pinta
// siempre en rojo en muchos móviles (ignora el color CSS), y entonces
// urgente y no urgente se veían igual.
export default function BotonUrgente({
  urgente,
  onChange,
}: {
  urgente: boolean;
  onChange: (urgente: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!urgente)}
      aria-label={urgente ? "Quitar de urgente" : "Marcar como urgente"}
      title={urgente ? "Urgente — tocar para quitar" : "Marcar como urgente"}
      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold leading-none transition ${
        urgente ? "bg-clay text-white" : "bg-ink/10 text-ink/40 hover:bg-clay/30 hover:text-clay"
      }`}
    >
      !
    </button>
  );
}
