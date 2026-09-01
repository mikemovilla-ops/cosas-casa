"use client";

import { useState } from "react";
import { fetchUsuarios, type Usuario } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import ListaCompra from "./ListaCompra";
import ListaCasa from "./ListaCasa";

export default function ListasApp() {
  const [vista, setVista] = useState<"compra" | "casa">("compra");
  // Cambia poco (solo cuando alguien inicia sesión por primera vez), así que
  // basta con sondearlo cada 30s en vez de cada 4s como los items.
  const { items: usuarios } = usePoll<Usuario>(fetchUsuarios, 30000);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <TabButton activo={vista === "compra"} onClick={() => setVista("compra")}>
          🛒 Compra
        </TabButton>
        <TabButton activo={vista === "casa"} onClick={() => setVista("casa")}>
          🏠 Casa
        </TabButton>
      </div>

      {vista === "compra" ? <ListaCompra usuarios={usuarios} /> : <ListaCasa usuarios={usuarios} />}
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
