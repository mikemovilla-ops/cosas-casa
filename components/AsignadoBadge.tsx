"use client";

import type { Usuario } from "@/lib/api-client";

// Colores por posición (orden de alta en la app), no por id — así el primero
// en entrar siempre es "personaA" y el segundo "personaB", consistente para
// los dos aunque cambien de dispositivo.
const COLORES = ["bg-personaA", "bg-personaB"];

function inicial(usuario: Usuario) {
  return (usuario.name ?? usuario.email ?? "?").trim().charAt(0).toUpperCase();
}

function nombreCorto(usuario: Usuario) {
  return usuario.name?.split(" ")[0] ?? usuario.email ?? "?";
}

export default function AsignadoBadge({
  usuarios,
  asignadoAId,
  onChange,
}: {
  usuarios: Usuario[];
  asignadoAId: string | null;
  onChange: (id: string | null) => void;
}) {
  const opciones: (string | null)[] = [null, ...usuarios.map((u) => u.id)];

  function siguiente() {
    const actual = opciones.indexOf(asignadoAId);
    const proximo = opciones[(actual + 1) % opciones.length];
    onChange(proximo ?? null);
  }

  const usuario = usuarios.find((u) => u.id === asignadoAId);
  const indice = usuario ? usuarios.indexOf(usuario) : -1;

  return (
    <button
      type="button"
      onClick={siguiente}
      title={usuario ? nombreCorto(usuario) : "Los dos"}
      aria-label={`Asignado a: ${usuario ? nombreCorto(usuario) : "Los dos"}. Tocar para cambiar.`}
      className={`shrink-0 w-6 h-6 rounded-full text-[11px] font-semibold text-white flex items-center justify-center transition ${
        usuario ? COLORES[indice] ?? "bg-ink/30" : "bg-ink/20 hover:bg-ink/30"
      }`}
    >
      {usuario ? inicial(usuario) : "2"}
    </button>
  );
}
