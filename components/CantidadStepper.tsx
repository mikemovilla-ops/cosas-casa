"use client";

export default function CantidadStepper({
  cantidad,
  onChange,
}: {
  cantidad: number;
  onChange: (cantidad: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, cantidad - 1))}
        aria-label="Quitar una unidad"
        className="w-6 h-6 rounded border border-sand text-ink/50 hover:border-sage hover:text-sagedark transition leading-none"
      >
        −
      </button>
      <span className="w-5 text-center text-sm tabular-nums">{cantidad}</span>
      <button
        type="button"
        onClick={() => onChange(cantidad + 1)}
        aria-label="Añadir una unidad"
        className="w-6 h-6 rounded border border-sand text-ink/50 hover:border-sage hover:text-sagedark transition leading-none"
      >
        +
      </button>
    </div>
  );
}
