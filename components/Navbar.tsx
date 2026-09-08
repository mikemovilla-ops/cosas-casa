"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useNavegacion, type Vista } from "@/contexts/NavegacionContext";
import MenuAjustes, { ContenidoAjustes } from "./MenuAjustes";

const PESTANAS: { vista: Vista; icon: string; label: string }[] = [
  { vista: "compra", icon: "🛒", label: "Compra" },
  { vista: "casa", icon: "🏠", label: "Casa" },
  { vista: "pelisseries", icon: "🎬", label: "Pelis" },
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
  const { vista, setVista, tareasDeudasActivado } = useNavegacion();

  const pestanas = [
    ...PESTANAS,
    ...(tareasDeudasActivado
      ? [
          { vista: "tareas" as Vista, icon: "✅", label: "Tareas" },
          { vista: "deudas" as Vista, icon: "💶", label: "Deudas" },
        ]
      : []),
  ];

  function irA(v: Vista) {
    setVista(v);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sand bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 px-4 py-3">
          <span className="font-semibold text-lg text-sagedark shrink-0">🏡 Cosas de Casa (C&amp;M)</span>

          {/* Escritorio: pestañas en línea */}
          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {pestanas.map((p) => (
              <TabDesktop key={p.vista} activo={vista === p.vista} onClick={() => irA(p.vista)}>
                {p.icon} {p.label}
              </TabDesktop>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <MenuAjustes />
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
        </div>
      </header>

      {/* Móvil: barra de pestañas fija abajo, con "Menú" para ajustes/perfil */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch bg-white border-t border-sand"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {pestanas.map((p) => (
          <TabInferior
            key={p.vista}
            icon={p.icon}
            label={p.label}
            activo={vista === p.vista}
            onClick={() => irA(p.vista)}
          />
        ))}
        <TabInferior
          icon="☰"
          label="Menú"
          activo={menuAbierto}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        />
      </nav>

      {menuAbierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="md:hidden fixed inset-0 z-30 bg-ink/20"
            onClick={() => setMenuAbierto(false)}
          />
          <div
            className="md:hidden fixed bottom-14 inset-x-0 z-40 bg-white border-t border-sand rounded-t-2xl shadow-lg p-3 max-h-[70vh] overflow-y-auto"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-sand px-1">
              <div className="flex items-center gap-2 min-w-0">
                {session?.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "Usuario"}
                    width={32}
                    height={32}
                    className="rounded-full border border-sand shrink-0"
                  />
                )}
                <span className="text-sm font-medium text-ink truncate">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  signOut();
                }}
                className="text-sm text-clay shrink-0 px-2"
              >
                Salir
              </button>
            </div>
            <ContenidoAjustes onAccion={() => setMenuAbierto(false)} />
          </div>
        </>
      )}
    </>
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

function TabInferior({
  icon,
  label,
  activo,
  onClick,
  ...rest
}: {
  icon: string;
  label: string;
  activo: boolean;
  onClick: () => void;
  "aria-expanded"?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-0 text-[11px] font-medium transition ${
        activo ? "text-sagedark" : "text-ink/50"
      }`}
      {...rest}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="truncate max-w-full">{label}</span>
    </button>
  );
}
