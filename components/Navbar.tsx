"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useNavegacion, type Vista } from "@/contexts/NavegacionContext";
import MenuAjustes, { ContenidoAjustes, useAplicarTemaGuardado } from "./MenuAjustes";

// Mismo esquema de menú que EuroAmigus: en escritorio, enlaces arriba; en
// móvil, barra flotante abajo con iconos y una pestaña "Tú" (tu foto) que
// despliega encima, dentro de la misma barra, los ajustes, las pestañas
// privadas y Salir.

type PropsIcono = { activo: boolean };
const svg = (activo: boolean) => ({
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: activo ? 2.2 : 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

function IconoCompra({ activo }: PropsIcono) {
  // Carrito
  return (
    <svg {...svg(activo)}>
      <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7.5H6.2" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}

function IconoCasa({ activo }: PropsIcono) {
  return (
    <svg {...svg(activo)}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9v10a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

function IconoPelis({ activo }: PropsIcono) {
  // Claqueta
  return (
    <svg {...svg(activo)}>
      <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
      <path d="m3.5 9 1.2-4.2 15.4 0L20.5 9" />
      <path d="m9 4.8-1.5 4.2M14.5 4.8 13 9" />
    </svg>
  );
}

function IconoRestos({ activo }: PropsIcono) {
  // Tenedor y cuchillo
  return (
    <svg {...svg(activo)}>
      <path d="M7 3v7a2 2 0 0 0 2 2v9M9 3v6M11 3v7a2 2 0 0 1-2 2" />
      <path d="M17 21V3c-1.8 1.2-3 3.5-3 6.5V13h3" />
    </svg>
  );
}

function IconoTareas({ activo }: PropsIcono) {
  return (
    <svg {...svg(activo)}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8.5 12.2 2.4 2.3 4.6-5" />
    </svg>
  );
}

function IconoDeudas({ activo }: PropsIcono) {
  // Símbolo del euro
  return (
    <svg {...svg(activo)}>
      <path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5" />
      <path d="M5 10.5h8M5 13.5h8" />
    </svg>
  );
}

function IconoGym({ activo }: PropsIcono) {
  // Mancuerna
  return (
    <svg {...svg(activo)}>
      <path d="M8 12h8" />
      <rect x="4.5" y="7.5" width="3.5" height="9" rx="1" />
      <rect x="16" y="7.5" width="3.5" height="9" rx="1" />
      <path d="M2.5 10v4M21.5 10v4" />
    </svg>
  );
}

function IconoPerfil({ activo }: PropsIcono) {
  return (
    <svg {...svg(activo)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </svg>
  );
}

const PESTANAS: { vista: Vista; label: string; Icono: (p: PropsIcono) => JSX.Element }[] = [
  { vista: "compra", label: "Compra", Icono: IconoCompra },
  { vista: "casa", label: "Casa", Icono: IconoCasa },
  { vista: "pelisseries", label: "Pelis", Icono: IconoPelis },
  { vista: "restaurantes", label: "Restos", Icono: IconoRestos },
];

const PRIVADAS: { vista: Vista; label: string; Icono: (p: PropsIcono) => JSX.Element }[] = [
  { vista: "tareas", label: "Tareas", Icono: IconoTareas },
  { vista: "deudas", label: "Deudas", Icono: IconoDeudas },
  { vista: "gym", label: "Gym", Icono: IconoGym },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-acento text-fondooscuro">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
          <path d="M12 3.2 3 10.4V20a1 1 0 0 0 1 1h5.5v-6h5v6H20a1 1 0 0 0 1-1v-9.6z" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold leading-none">
        Cosas de <span className="text-acento">Casa</span>
      </span>
    </div>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  useAplicarTemaGuardado();

  if (status !== "authenticated") {
    return (
      <header className="sticky top-0 z-30 border-b border-borde bg-fondooscuro/80 backdrop-blur">
        <div className="max-w-3xl mx-auto flex items-center px-4 py-3">
          <Logo />
        </div>
      </header>
    );
  }

  return <NavbarAutenticado session={session} />;
}

function NavbarAutenticado({ session }: { session: ReturnType<typeof useSession>["data"] }) {
  const { vista, setVista, tareasDeudasActivado } = useNavegacion();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function irA(v: Vista) {
    setVista(v);
    setMenuAbierto(false);
  }

  const enPrivada = PRIVADAS.some((p) => p.vista === vista);

  const Avatar = ({ tam, borde }: { tam: number; borde: string }) =>
    session?.user?.image ? (
      <Image
        src={session.user.image}
        alt={session.user.name ?? "Tú"}
        width={tam}
        height={tam}
        className={`rounded-full border ${borde}`}
      />
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-borde bg-fondooscuro/80 backdrop-blur">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Logo />

          {/* Escritorio: pestañas compartidas en línea. Tareas/Deudas/Gym
              (personales) van aparte, debajo, para no mezclarlas. */}
          <nav className="hidden md:flex items-center gap-1">
            {PESTANAS.map((p) => (
              <TabDesktop key={p.vista} activo={vista === p.vista} onClick={() => irA(p.vista)}>
                {p.label}
              </TabDesktop>
            ))}
            <div className="ml-2 flex items-center gap-2 border-l border-borde pl-3">
              <MenuAjustes />
              <Avatar tam={28} borde="border-white/20" />
              <button
                onClick={() => signOut()}
                className="text-sm text-tinta/60 hover:text-coral transition"
                title={session?.user?.email ?? ""}
              >
                Salir
              </button>
            </div>
          </nav>
        </div>

        {tareasDeudasActivado && (
          <div className="hidden md:block border-t border-borde">
            <div className="max-w-3xl mx-auto flex items-center gap-1 px-4 py-1.5">
              <span className="etiqueta mr-2">Privado</span>
              {PRIVADAS.map((p) => (
                <TabDesktop key={p.vista} activo={vista === p.vista} onClick={() => irA(p.vista)} pequeno>
                  {p.label}
                </TabDesktop>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Móvil: barra flotante abajo. Con 4 compartidas + 3 privadas + "Tú"
          no cabían sin recortar el texto, así que las privadas viven dentro
          del menú "Tú", que se despliega encima de las pestañas. */}
      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMenuAbierto(false)}
        />
      )}
      <nav
        className="md:hidden fixed inset-x-4 z-40 overflow-hidden rounded-2xl border border-borde bg-fondooscuro/95 shadow-lg shadow-black/40 backdrop-blur-sm"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        {menuAbierto && (
          <div className="max-h-[65vh] overflow-y-auto border-b border-borde p-3">
            <div className="flex items-center justify-between gap-2 px-1.5 pb-3 mb-2 border-b border-borde">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                <p className="text-xs text-tinta/40 truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  signOut();
                }}
                className="shrink-0 text-sm text-tinta/70 hover:text-coral transition px-1"
              >
                Salir
              </button>
            </div>

            {tareasDeudasActivado && (
              <div className="mb-2 pb-2 border-b border-borde">
                <p className="etiqueta px-1.5 pb-1.5">Privado</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRIVADAS.map(({ vista: v, label, Icono }) => (
                    <button
                      key={v}
                      onClick={() => irA(v)}
                      className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-semibold transition active:opacity-50 ${
                        vista === v ? "bg-acento/15 text-acento" : "bg-white/5 text-tinta/70"
                      }`}
                    >
                      <Icono activo={vista === v} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ContenidoAjustes onAccion={() => setMenuAbierto(false)} />
          </div>
        )}
        <div className="flex items-stretch justify-around">
          {PESTANAS.map(({ vista: v, label, Icono }) => (
            <TabInferior key={v} activo={vista === v} onClick={() => irA(v)} label={label}>
              <Icono activo={vista === v} />
            </TabInferior>
          ))}
          <TabInferior
            activo={menuAbierto || enPrivada}
            onClick={() => setMenuAbierto((v) => !v)}
            label="Tú"
            aria-expanded={menuAbierto}
          >
            {session?.user?.image ? (
              <Avatar tam={22} borde={menuAbierto || enPrivada ? "border-acento" : "border-white/30"} />
            ) : (
              <IconoPerfil activo={menuAbierto || enPrivada} />
            )}
          </TabInferior>
        </div>
      </nav>
    </>
  );
}

function TabDesktop({
  activo,
  onClick,
  pequeno = false,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  pequeno?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-semibold transition whitespace-nowrap ${pequeno ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"} ${
        activo ? "bg-acento text-fondooscuro" : "text-tinta/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function TabInferior({
  activo,
  onClick,
  label,
  children,
  ...rest
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  "aria-expanded"?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition active:opacity-50 ${
        activo ? "text-acento" : "text-tinta/50"
      }`}
      {...rest}
    >
      {children}
      {label}
    </button>
  );
}
