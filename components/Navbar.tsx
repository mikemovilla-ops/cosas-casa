"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useNavegacion, type Vista } from "@/contexts/NavegacionContext";
import AjustesColor from "./AjustesColor";

const PESTANAS: { vista: Vista; label: string }[] = [
  { vista: "compra", label: "🛒 Compra" },
  { vista: "casa", label: "🏠 Casa" },
  { vista: "pelisseries", label: "🎬 Pelis/Series" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuAbierto, setMenuAbierto] = useState(false);

  if (status !== "authenticated") {
    return (
      <header className="sticky top-0 z-30 border-b border-sand bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-lg text-sagedark">🏡 Cosas de Casa (C&amp;M)</span>
          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("google")}
              className="bg-sage text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-sagedark transition"
            >
              Entrar con Google
            </button>
          )}
        </div>
      </header>
    );
  }

  return <NavbarAutenticado session={session} menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />;
}

function NavbarAutenticado({
  session,
  menuAbierto,
  setMenuAbierto,
}: {
  session: ReturnType<typeof useSession>["data"];
  menuAbierto: boolean;
  setMenuAbierto: (v: boolean) => void;
}) {
  const { vista, setVista, tareasDeudasActivado, activarTareasDeudas, desactivarTareasDeudas } = useNavegacion();

  function irA(v: Vista) {
    setVista(v);
    setMenuAbierto(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sand bg-white">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 px-4 py-3">
        <span className="font-semibold text-lg text-sagedark shrink-0">🏡 Cosas de Casa (C&amp;M)</span>

        {/* Escritorio: pestañas en línea */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap">
          {PESTANAS.map((p) => (
            <TabDesktop key={p.vista} activo={vista === p.vista} onClick={() => irA(p.vista)}>
              {p.label}
            </TabDesktop>
          ))}
          {tareasDeudasActivado && (
            <>
              <TabDesktop activo={vista === "tareas"} onClick={() => irA("tareas")}>
                ✅ Tareas
              </TabDesktop>
              <TabDesktop activo={vista === "deudas"} onClick={() => irA("deudas")}>
                💶 Deudas
              </TabDesktop>
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <AjustesColor />
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "Usuario"}
              width={28}
              height={28}
              className="rounded-full border border-sand"
            />
          )}
          <button onClick={() => signOut()} className="text-sm text-ink/60 hover:text-clay transition">
            Salir
          </button>
        </div>

        {/* Móvil: hamburguesa */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          className="md:hidden flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-sand"
        >
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform ${menuAbierto ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-5 bg-ink transition-opacity ${menuAbierto ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform ${menuAbierto ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuAbierto && (
        <nav className="md:hidden border-t border-sand px-4 py-3 flex flex-col gap-1">
          {PESTANAS.map((p) => (
            <TabMovil key={p.vista} activo={vista === p.vista} onClick={() => irA(p.vista)}>
              {p.label}
            </TabMovil>
          ))}
          {tareasDeudasActivado && (
            <>
              <TabMovil activo={vista === "tareas"} onClick={() => irA("tareas")}>
                ✅ Tareas
              </TabMovil>
              <TabMovil activo={vista === "deudas"} onClick={() => irA("deudas")}>
                💶 Deudas
              </TabMovil>
              <button
                onClick={desactivarTareasDeudas}
                className="text-left text-xs text-ink/40 hover:text-clay underline underline-offset-2 px-3 py-1"
              >
                Ocultar Tareas y Deudas
              </button>
            </>
          )}
          {tareasDeudasActivado === false && (
            <button
              onClick={activarTareasDeudas}
              className="text-left text-xs text-ink/40 hover:text-sage underline underline-offset-2 px-3 py-1"
            >
              + Activar Tareas y Deudas (privado, solo tú)
            </button>
          )}

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-sand">
            <div className="flex items-center gap-2">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Usuario"}
                  width={28}
                  height={28}
                  className="rounded-full border border-sand"
                />
              )}
              <AjustesColor />
            </div>
            <button onClick={() => signOut()} className="text-sm text-ink/60 hover:text-clay transition px-3">
              Salir
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

function TabDesktop({
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
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
        activo ? "bg-sage text-white" : "text-ink/60 hover:bg-sand/40"
      }`}
    >
      {children}
    </button>
  );
}

function TabMovil({
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
      className={`text-left px-3 py-2 rounded-md text-sm font-medium transition ${
        activo ? "bg-sage text-white" : "text-ink/70 hover:bg-sand/40"
      }`}
    >
      {children}
    </button>
  );
}
