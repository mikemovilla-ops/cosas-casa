"use client";

import { fetchUsuarios, type Usuario } from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import { useNavegacion } from "@/contexts/NavegacionContext";
import ListaCompra from "./ListaCompra";
import ListaCasa from "./ListaCasa";
import ListaPelisSeries from "./ListaPelisSeries";
import ListaTareas from "./ListaTareas";
import ListaDeudas from "./ListaDeudas";

export default function ListasApp() {
  const { vista, tareasDeudasActivado } = useNavegacion();
  // Cambia poco (solo cuando alguien inicia sesión por primera vez), así que
  // basta con sondearlo cada 30s en vez de cada 4s como los items.
  const { items: usuarios } = usePoll<Usuario>(fetchUsuarios, 30000);

  return (
    <div>
      {vista === "compra" && <ListaCompra usuarios={usuarios} />}
      {vista === "casa" && <ListaCasa usuarios={usuarios} />}
      {vista === "pelisseries" && <ListaPelisSeries usuarios={usuarios} />}
      {vista === "tareas" && tareasDeudasActivado && <ListaTareas />}
      {vista === "deudas" && tareasDeudasActivado && <ListaDeudas />}
    </div>
  );
}
