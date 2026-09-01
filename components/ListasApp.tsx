"use client";

import { useState } from "react";
import ListaCompra from "./ListaCompra";
import ListaCasa from "./ListaCasa";

export default function ListasApp() {
  const [vista, setVista] = useState<"compra" | "casa">("compra");

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

      {vista === "compra" ? <ListaCompra /> : <ListaCasa />}
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
