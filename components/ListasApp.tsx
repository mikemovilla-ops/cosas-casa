"use client";

import { useEffect, useState } from "react";
import { actualizarPerfil, fetchPerfil, fetchUsuarios, type Usuario } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import ListaCompra from "./ListaCompra";
import ListaCasa from "./ListaCasa";
import ListaTareas from "./ListaTareas";
import ListaDeudas from "./ListaDeudas";

type Vista = "compra" | "casa" | "tareas" | "deudas";

export default function ListasApp() {
  const [vista, setVista] = useState<Vista>("compra");
  // Cambia poco (solo cuando alguien inicia sesión por primera vez), así que
  // basta con sondearlo cada 30s en vez de cada 4s como los items.
  const { items: usuarios } = usePoll<Usuario>(fetchUsuarios, 30000);

  // Solo se lee una vez al cargar: es la propia preferencia del usuario, no
  // algo que vaya a cambiar por lo que haga la otra persona.
  const [tareasDeudasActivado, setTareasDeudasActivado] = useState<boolean | null>(null);
  useEffect(() => {
    fetchPerfil().then((p) => setTareasDeudasActivado(p.tareasDeudasActivado));
  }, []);

  async function activarTareasDeudas() {
    setTareasDeudasActivado(true);
    await actualizarPerfil({ tareasDeudasActivado: true });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <TabButton activo={vista === "compra"} onClick={() => setVista("compra")}>
          🛒 Compra
        </TabButton>
        <TabButton activo={vista === "casa"} onClick={() => setVista("casa")}>
          🏠 Casa
        </TabButton>
        {tareasDeudasActivado && (
          <>
            <TabButton activo={vista === "tareas"} onClick={() => setVista("tareas")}>
              ✅ Tareas
            </TabButton>
            <TabButton activo={vista === "deudas"} onClick={() => setVista("deudas")}>
              💶 Deudas
            </TabButton>
          </>
        )}
        {tareasDeudasActivado === false && (
          <button
            onClick={activarTareasDeudas}
            className="text-xs text-ink/40 hover:text-sage underline underline-offset-2 ml-1"
          >
            + Activar Tareas y Deudas (privado, solo tú)
          </button>
        )}
      </div>

      {vista === "compra" && <ListaCompra usuarios={usuarios} />}
      {vista === "casa" && <ListaCasa usuarios={usuarios} />}
      {vista === "tareas" && tareasDeudasActivado && <ListaTareas />}
      {vista === "deudas" && tareasDeudasActivado && <ListaDeudas />}
    </div>
  );
}

function TabButton({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition ${
        activo ? "bg-sage text-white" : "bg-white border border-sand text-ink/60 hover:border-sage"
      }`}
    >
      {children}
    </button>
  );
}
