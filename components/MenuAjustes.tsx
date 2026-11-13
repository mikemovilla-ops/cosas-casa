"use client";

import { useEffect, useState } from "react";
import { useNavegacion } from "@/contexts/NavegacionContext";

const CLAVE_LOCALSTORAGE = "nuestra-casa-tema";

// Paleta curada de temas oscuros — no es un selector de color libre para
// mantener la coherencia visual del resto de la app. Cada tema trae su fondo,
// sus superficies/bordes (un poco más claros que el fondo) y su acento, que
// se vuelcan en las variables CSS de app/globals.css. El primero es el que
// hay ahí por defecto.
const TEMAS = [
  {
    id: "bosque",
    label: "Bosque (por defecto)",
    colores: { fondo: "#0F1A17", fondooscuro: "#0A120F", superficie: "#16231F", borde: "#2A3B35", acento: "#6FCF97", acentovivo: "#8FE3B0" },
  },
  {
    id: "noche",
    label: "Noche",
    colores: { fondo: "#0E1428", fondooscuro: "#090D1C", superficie: "#151D36", borde: "#283353", acento: "#6EA8FF", acentovivo: "#93BFFF" },
  },
  {
    id: "oceano",
    label: "Océano",
    colores: { fondo: "#0C1A1F", fondooscuro: "#071114", superficie: "#12252B", borde: "#23404A", acento: "#4FD1C5", acentovivo: "#7EE3DA" },
  },
  {
    id: "ciruela",
    label: "Ciruela",
    colores: { fondo: "#1A1020", fondooscuro: "#110A15", superficie: "#23172B", borde: "#3A2A45", acento: "#D58BF0", acentovivo: "#E5ADF7" },
  },
  {
    id: "grafito",
    label: "Grafito",
    colores: { fondo: "#141414", fondooscuro: "#0C0C0C", superficie: "#1D1D1D", borde: "#333333", acento: "#E8C268", acentovivo: "#F2D58E" },
  },
];

type Tema = (typeof TEMAS)[number];

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function aplicarTema(tema: Tema) {
  for (const [nombre, hex] of Object.entries(tema.colores)) {
    document.documentElement.style.setProperty(`--color-${nombre}`, rgb(hex));
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tema.colores.fondo);
}

function temaGuardado(): Tema | null {
  try {
    return TEMAS.find((t) => t.id === localStorage.getItem(CLAVE_LOCALSTORAGE)) ?? null;
  } catch {
    // localStorage puede fallar en navegación privada — se queda el tema por defecto.
    return null;
  }
}

// Aplica el tema guardado al cargar la app. Va en Navbar (siempre montado),
// no dentro de los ajustes, que solo se montan al abrir el menú.
export function useAplicarTemaGuardado() {
  useEffect(() => {
    const tema = temaGuardado();
    if (tema) aplicarTema(tema);
  }, []);
}

function useTemaColor() {
  const [temaActual, setTemaActual] = useState<string>(TEMAS[0].id);

  useEffect(() => {
    const tema = temaGuardado();
    if (tema) setTemaActual(tema.id);
  }, []);

  function elegirTema(tema: Tema) {
    setTemaActual(tema.id);
    aplicarTema(tema);
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, tema.id);
    } catch {
      // Ver arriba: si falla, el tema se aplica igual, solo no se recuerda al recargar.
    }
  }

  return { temaActual, elegirTema };
}

// Contenido de los ajustes personales: tema de color (solo local, por
// dispositivo) y mostrar/ocultar las pestañas privadas de Tareas, Deudas y Gym
// (guardado en el servidor, ver NavegacionContext). Se reutiliza tanto
// dentro del desplegable de escritorio como en el menú "Tú" de móvil,
// para no duplicar esta lógica dos veces.
export function ContenidoAjustes({ onAccion }: { onAccion?: () => void }) {
  const { temaActual, elegirTema } = useTemaColor();
  const { tareasDeudasActivado, activarTareasDeudas, desactivarTareasDeudas } = useNavegacion();

  return (
    <div>
      <p className="etiqueta px-1.5 pb-1.5">Tema (solo tú)</p>
      {TEMAS.map((t) => (
        <button
          key={t.id}
          onClick={() => elegirTema(t)}
          className={`w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded-lg hover:bg-white/5 transition ${
            temaActual === t.id ? "font-semibold text-acentovivo" : "text-tinta/80"
          }`}
        >
          <span
            className="inline-flex w-4 h-4 rounded-full border border-white/20 shrink-0 overflow-hidden"
            style={{ backgroundColor: t.colores.fondo }}
          >
            <span className="w-1/2 ml-auto" style={{ backgroundColor: t.colores.acento }} />
          </span>
          {t.label}
          {temaActual === t.id && <span className="ml-auto text-acento">✓</span>}
        </button>
      ))}

      <div className="border-t border-borde mt-2 pt-2">
        <p className="etiqueta px-1.5 pb-1.5">Pestañas privadas (solo tú)</p>
        <button
          onClick={() => {
            if (tareasDeudasActivado) desactivarTareasDeudas();
            else activarTareasDeudas();
            onAccion?.();
          }}
          className="w-full text-left text-sm px-1.5 py-1.5 rounded-lg hover:bg-white/5 transition text-tinta/80"
        >
          {tareasDeudasActivado ? "Ocultar Tareas, Deudas y Gym" : "Activar Tareas, Deudas y Gym"}
        </button>
      </div>
    </div>
  );
}

// Botón de engranaje + desplegable con ContenidoAjustes. Pensado para la
// barra de escritorio; en móvil los mismos ajustes viven en el menú "Tú" de
// la barra inferior (ver Navbar).
export default function MenuAjustes({ align = "right" }: { align?: "left" | "right" }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        title="Ajustes"
        aria-label="Ajustes"
        aria-expanded={abierto}
        className={`p-1 transition ${abierto ? "text-acento" : "text-tinta/60 hover:text-tinta"}`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
          <circle cx="12" cy="12" r="6.5" />
        </svg>
      </button>
      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar ajustes"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div
            className={`absolute mt-2 w-60 max-w-[calc(100vw-2rem)] card bg-superficie shadow-xl shadow-black/40 z-40 p-2 ${
              align === "left" ? "left-0" : "right-0"
            }`}
          >
            <ContenidoAjustes onAccion={() => setAbierto(false)} />
          </div>
        </>
      )}
    </div>
  );
}
