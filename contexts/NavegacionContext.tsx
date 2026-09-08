"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { actualizarPerfil, fetchPerfil } from "@/lib/api-client";

export type Vista = "compra" | "casa" | "pelisseries" | "tareas" | "deudas";

type NavegacionContextValue = {
  vista: Vista;
  setVista: (v: Vista) => void;
  tareasDeudasActivado: boolean | null;
  activarTareasDeudas: () => Promise<void>;
  desactivarTareasDeudas: () => Promise<void>;
};

const NavegacionContext = createContext<NavegacionContextValue | null>(null);

// Vive por encima de Navbar y de ListasApp para que la barra de pestañas
// (arriba, en Navbar) y el contenido (en ListasApp) compartan el mismo
// estado de "qué pestaña está activa" sin ser el mismo componente.
export function NavegacionProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [vista, setVista] = useState<Vista>("compra");
  const [tareasDeudasActivado, setTareasDeudasActivado] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchPerfil().then((p) => setTareasDeudasActivado(p.tareasDeudasActivado));
  }, [status]);

  async function activarTareasDeudas() {
    setTareasDeudasActivado(true);
    await actualizarPerfil({ tareasDeudasActivado: true });
  }

  async function desactivarTareasDeudas() {
    setTareasDeudasActivado(false);
    setVista((v) => (v === "tareas" || v === "deudas" ? "compra" : v));
    await actualizarPerfil({ tareasDeudasActivado: false });
  }

  return (
    <NavegacionContext.Provider
      value={{ vista, setVista, tareasDeudasActivado, activarTareasDeudas, desactivarTareasDeudas }}
    >
      {children}
    </NavegacionContext.Provider>
  );
}

export function useNavegacion() {
  const ctx = useContext(NavegacionContext);
  if (!ctx) throw new Error("useNavegacion debe usarse dentro de NavegacionProvider");
  return ctx;
}
