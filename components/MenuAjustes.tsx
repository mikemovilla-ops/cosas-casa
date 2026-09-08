"use client";

import { useEffect, useState } from "react";
import { useNavegacion } from "@/contexts/NavegacionContext";

const CLAVE_LOCALSTORAGE = "nuestra-casa-tema";
const CLAVE_LOCALSTORAGE_ANTIGUA = "nuestra-casa-color-fondo";

// Paleta curada de temas — no es un selector de color libre para mantener
// la coherencia visual del resto de la app (tarjetas blancas...). Cada tema
// trae su propio color de fondo Y su propio acento (antes el verde "sage"
// era fijo pase lo que pase; ahora combina con el fondo elegido).
function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const COLORES = [
  { id: "crema", label: "Crema (por defecto)", valor: "#fbf7f0", sage: "#6B8F71", sagedark: "#4F6B54" },
  { id: "azul", label: "Azul suave", valor: "#eaf2f8", sage: "#4A7FA7", sagedark: "#3A6488" },
  { id: "rosa", label: "Rosa suave", valor: "#fbeaf0", sage: "#B5566B", sagedark: "#8F4356" },
  { id: "verde", label: "Verde suave", valor: "#eaf5ec", sage: "#6B8F71", sagedark: "#4F6B54" },
  { id: "gris", label: "Gris suave", valor: "#f0efec", sage: "#6B6B63", sagedark: "#4F4F49" },
  { id: "lavanda", label: "Lavanda", valor: "#f1eafb", sage: "#8B6FB3", sagedark: "#6B5389" },
];

function aplicarColor(tema: (typeof COLORES)[number]) {
  document.documentElement.style.setProperty("--bg-color", tema.valor);
  document.documentElement.style.setProperty("--color-sage", rgb(tema.sage));
  document.documentElement.style.setProperty("--color-sagedark", rgb(tema.sagedark));
}

function useTemaColor() {
  const [temaActual, setTemaActual] = useState<string>(COLORES[0].id);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
      // Compat: versión anterior solo guardaba el hex de fondo, sin acento.
      const antiguo = localStorage.getItem(CLAVE_LOCALSTORAGE_ANTIGUA);
      const tema =
        COLORES.find((c) => c.id === guardado) ??
        COLORES.find((c) => c.valor === antiguo) ??
        null;
      if (tema) {
        setTemaActual(tema.id);
        aplicarColor(tema);
      }
    } catch {
      // localStorage puede fallar en navegación privada — se queda el tema por defecto.
    }
  }, []);

  function elegirColor(tema: (typeof COLORES)[number]) {
    setTemaActual(tema.id);
    aplicarColor(tema);
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, tema.id);
      localStorage.removeItem(CLAVE_LOCALSTORAGE_ANTIGUA);
    } catch {
      // Ver arriba: si falla, el tema se aplica igual, solo no se recuerda al recargar.
    }
  }

  return { temaActual, elegirColor };
}

// Contenido de los ajustes personales: tema de color (solo local, por
// dispositivo) y mostrar/ocultar las pestañas privadas de Tareas y Deudas
// (guardado en el servidor, ver NavegacionContext). Se reutiliza tanto
// dentro del desplegable de escritorio como en la hoja inferior de móvil,
// para no duplicar esta lógica dos veces.
export function ContenidoAjustes({ onAccion }: { onAccion?: () => void }) {
  const { temaActual, elegirColor } = useTemaColor();
  const { tareasDeudasActivado, activarTareasDeudas, desactivarTareasDeudas } = useNavegacion();

  return (
    <div>
      <p className="text-xs text-ink/40 px-1.5 pb-1.5">Tema de color (solo tú)</p>
      {COLORES.map((c) => (
        <button
          key={c.id}
          onClick={() => elegirColor(c)}
          className={`w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition ${
            temaActual === c.id ? "font-semibold text-sagedark" : "text-ink"
          }`}
        >
          <span
            className="inline-block w-4 h-4 rounded-full border border-sand shrink-0"
            style={{ backgroundColor: c.valor }}
          />
          {c.label}
          {temaActual === c.id && <span className="ml-auto text-sage">✓</span>}
        </button>
      ))}

      <div className="border-t border-sand mt-2 pt-2">
        <p className="text-xs text-ink/40 px-1.5 pb-1.5">Pestañas privadas (solo tú)</p>
        {tareasDeudasActivado ? (
          <button
            onClick={() => {
              desactivarTareasDeudas();
              onAccion?.();
            }}
            className="w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition text-ink"
          >
            ✅💶 Ocultar Tareas y Deudas
          </button>
        ) : (
          <button
            onClick={() => {
              activarTareasDeudas();
              onAccion?.();
            }}
            className="w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition text-ink"
          >
            ✅💶 Activar Tareas y Deudas
          </button>
        )}
      </div>
    </div>
  );
}

// Botón de engranaje + desplegable con ContenidoAjustes. Pensado para la
// barra de escritorio; en móvil los mismos ajustes viven en la hoja
// inferior que abre la pestaña "Menú" (ver Navbar).
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
        className="text-ink/50 hover:text-sage transition text-lg leading-none px-1"
      >
        ⚙️
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
            className={`absolute mt-2 w-56 max-w-[calc(100vw-2rem)] card z-40 p-2 ${
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
