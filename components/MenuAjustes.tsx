"use client";

import { useEffect, useState } from "react";
import { useNavegacion } from "@/contexts/NavegacionContext";

const CLAVE_LOCALSTORAGE = "nuestra-casa-color-fondo";

// Paleta curada de fondos suaves — no es un selector de color libre para
// mantener la coherencia visual del resto de la app (tarjetas blancas,
// acentos verdes...).
const COLORES = [
  { id: "crema", label: "Crema (por defecto)", valor: "#fbf7f0" },
  { id: "azul", label: "Azul suave", valor: "#eaf2f8" },
  { id: "rosa", label: "Rosa suave", valor: "#fbeaf0" },
  { id: "verde", label: "Verde suave", valor: "#eaf5ec" },
  { id: "gris", label: "Gris suave", valor: "#f0efec" },
  { id: "lavanda", label: "Lavanda", valor: "#f1eafb" },
];

function aplicarColor(valor: string) {
  document.documentElement.style.setProperty("--bg-color", valor);
}

// Menú único de ajustes personales: color de fondo (solo local, por
// dispositivo) y mostrar/ocultar las pestañas privadas de Tareas y Deudas
// (guardado en el servidor, ver NavegacionContext). Antes vivían como
// controles sueltos por la barra de navegación; agruparlos aquí evita tener
// que duplicar la lógica de escritorio/móvil dos veces.
export default function MenuAjustes({ align = "right" }: { align?: "left" | "right" }) {
  const [abierto, setAbierto] = useState(false);
  const [colorActual, setColorActual] = useState<string>(COLORES[0].valor);
  const { tareasDeudasActivado, activarTareasDeudas, desactivarTareasDeudas } = useNavegacion();

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
      if (guardado) {
        setColorActual(guardado);
        aplicarColor(guardado);
      }
    } catch {
      // localStorage puede fallar en navegación privada — se queda el color por defecto.
    }
  }, []);

  function elegirColor(valor: string) {
    setColorActual(valor);
    aplicarColor(valor);
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, valor);
    } catch {
      // Ver arriba: si falla, el color se aplica igual, solo no se recuerda al recargar.
    }
  }

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
            <p className="text-xs text-ink/40 px-1.5 pb-1.5">Color de fondo (solo tú)</p>
            {COLORES.map((c) => (
              <button
                key={c.id}
                onClick={() => elegirColor(c.valor)}
                className={`w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition ${
                  colorActual === c.valor ? "font-semibold text-sagedark" : "text-ink"
                }`}
              >
                <span
                  className="inline-block w-4 h-4 rounded-full border border-sand shrink-0"
                  style={{ backgroundColor: c.valor }}
                />
                {c.label}
                {colorActual === c.valor && <span className="ml-auto text-sage">✓</span>}
              </button>
            ))}

            <div className="border-t border-sand mt-2 pt-2">
              <p className="text-xs text-ink/40 px-1.5 pb-1.5">Pestañas privadas (solo tú)</p>
              {tareasDeudasActivado ? (
                <button
                  onClick={() => {
                    desactivarTareasDeudas();
                    setAbierto(false);
                  }}
                  className="w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition text-ink"
                >
                  ✅💶 Ocultar Tareas y Deudas
                </button>
              ) : (
                <button
                  onClick={() => {
                    activarTareasDeudas();
                    setAbierto(false);
                  }}
                  className="w-full flex items-center gap-2 text-left text-sm px-1.5 py-1.5 rounded hover:bg-sand/40 transition text-ink"
                >
                  ✅💶 Activar Tareas y Deudas
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
