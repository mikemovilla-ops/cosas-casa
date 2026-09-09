"use client";

import { fetchUsuarios, type Usuario } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import { useNavegacion, type Vista } from "@/contexts/NavegacionContext";
import ListaCompra from "./ListaCompra";
import ListaCasa from "./ListaCasa";
import ListaPelisSeries from "./ListaPelisSeries";
import ListaRestaurantes from "./ListaRestaurantes";
import ListaTareas from "./ListaTareas";
import ListaDeudas from "./ListaDeudas";

// Solo en móvil (ver md:hidden abajo): en escritorio la pestaña activa ya se
// ve resaltada junto al resto, pero en móvil la barra inferior deja poco
// margen para eso, así que cada página repite su título arriba del todo.
const TITULOS: Record<Vista, string> = {
  compra: "🛒 Compra",
  casa: "🏠 Casa",
  pelisseries: "🎬 Pelis/Series",
  restaurantes: "🍽️ Restaurantes",
  tareas: "✅ Tareas",
  deudas: "💶 Deudas",
};

export default function ListasApp() {
  const { vista, tareasDeudasActivado } = useNavegacion();
  // Cambia poco (solo cuando alguien inicia sesión por primera vez), así que
  // basta con sondearlo cada 30s en vez de cada 4s como los items.
  const { items: usuarios } = usePoll<Usuario>(fetchUsuarios, 30000);

  return (
    <div>
      <h1 className="md:hidden text-xl font-semibold text-sagedark mb-4">{TITULOS[vista]}</h1>
      {vista === "compra" && <ListaCompra usuarios={usuarios} />}
      {vista === "casa" && <ListaCasa usuarios={usuarios} />}
      {vista === "pelisseries" && <ListaPelisSeries usuarios={usuarios} />}
      {vista === "restaurantes" && <ListaRestaurantes usuarios={usuarios} />}
      {vista === "tareas" && tareasDeudasActivado && <ListaTareas />}
      {vista === "deudas" && tareasDeudasActivado && <ListaDeudas />}
    </div>
  );
}
