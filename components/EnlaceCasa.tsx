"use client";

import { useState } from "react";

// Un SVG (no el emoji 🔗) porque los emoji se pintan a todo color en los
// móviles y el navegador ignora el color de texto que le pongamos por CSS
// — así no había forma de distinguir "sin enlace" (gris) de "con enlace"
// (verde) fuera del escritorio.
function IconoEnlace({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function EnlaceCasa({
  enlace,
  onChange,
}: {
  enlace: string | null;
  onChange: (enlace: string | null) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(enlace ?? "");

  function abrirEdicion() {
    setValor(enlace ?? "");
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = valor.trim();
    if (!limpio) {
      setEditando(false);
      return;
    }
    onChange(limpio.startsWith("http") ? limpio : `https://${limpio}`);
    setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="flex items-center gap-1 shrink-0">
        <input
          type="url"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="https://..."
          className="w-32 text-xs rounded border border-sand px-1.5 py-0.5 bg-white focus:border-sage outline-none"
        />
        <button type="submit" aria-label="Guardar enlace" className="text-sage hover:text-sagedark px-0.5">
          ✓
        </button>
        {enlace && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setEditando(false);
            }}
            aria-label="Quitar enlace"
            className="text-ink/30 hover:text-clay px-0.5"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={() => setEditando(false)}
          aria-label="Cancelar"
          className="text-ink/30 hover:text-ink/60 px-0.5"
        >
          ×
        </button>
      </form>
    );
  }

  if (enlace) {
    return (
      <div className="flex items-center gap-1 shrink-0 bg-sage/10 rounded-full pl-1.5 pr-1 py-0.5">
        <a
          href={enlace}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir enlace"
          aria-label="Abrir enlace de compra"
          className="text-sage hover:text-sagedark"
        >
          <IconoEnlace className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={abrirEdicion}
          aria-label="Editar enlace"
          className="text-[10px] text-sage/50 hover:text-clay leading-none"
        >
          ✎
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={abrirEdicion}
      title="Añadir enlace a la tienda"
      aria-label="Añadir enlace a la tienda"
      className="shrink-0 text-ink/25 hover:text-sage px-0.5"
    >
      <IconoEnlace className="w-3.5 h-3.5" />
    </button>
  );
}
