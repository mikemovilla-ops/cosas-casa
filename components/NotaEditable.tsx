"use client";

import { useState } from "react";

export default function NotaEditable({
  nota,
  onChange,
}: {
  nota: number | null;
  onChange: (nota: number | null) => void;
}) {
  const [editando, setEditando] = useState(false);

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setEditando(true);
  }

  if (editando) {
    return (
      <select
        autoFocus
        value={nota ?? ""}
        onChange={(e) => {
          onChange(e.target.value ? Number(e.target.value) : null);
          setEditando(false);
        }}
        onBlur={() => setEditando(false)}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 text-xs rounded border border-sand px-1 py-0.5 bg-white focus:border-sage outline-none"
      >
        <option value="">Sin nota</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}/10
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      title="Poner nota"
      aria-label="Poner nota"
      className={`shrink-0 text-[11px] px-1.5 py-0.5 rounded-full border ${
        nota
          ? "border-mustard/40 text-mustard bg-mustard/10 hover:bg-mustard/20"
          : "border-sand text-ink/30 hover:text-mustard"
      }`}
    >
      {nota ? `⭐ ${nota}/10` : "+ nota"}
    </button>
  );
}
