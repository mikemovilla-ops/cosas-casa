"use client";

import { useState } from "react";
import {
  actualizarItem,
  crearItem,
  eliminarItem,
  fetchItems,
  reordenarColumna,
  type GrupoMuscular,
  type Item,
} from "@/lib/api-client";
import { usePoll } from "@/lib/use-poll";
import NombreEditable from "./NombreEditable";
import FechaEditable from "./FechaEditable";
import ListaOrdenable, { AsaArrastre, FilaOrdenable } from "./ListaOrdenable";
import ColumnaDesplegable from "./ColumnaDesplegable";

const GRUPOS: { grupo: GrupoMuscular; label: string }[] = [
  { grupo: "PECHO", label: "Pecho" },
  { grupo: "ESPALDA", label: "Espalda" },
  { grupo: "TRAPECIO", label: "Trapecio" },
  { grupo: "BICEPS", label: "Bíceps" },
  { grupo: "TRICEPS", label: "Tríceps" },
  { grupo: "PIERNA", label: "Pierna" },
];

function kg(n: number) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 2 }) + " kg";
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

// Lista personal de ejercicios del gimnasio (solo la ve quien la crea), una
// columna por grupo muscular. Cada ejercicio guarda el peso actual — al
// subirlo se edita en el sitio, y la fecha pasa a hoy para saber cuándo fue
// la última vez que se cambió.
export default function ListaGym() {
  const { items, setItems, reload } = usePoll<Item>(() => fetchItems("GYM"));
  const [texto, setTexto] = useState("");
  const [peso, setPeso] = useState("");
  const [grupo, setGrupo] = useState<GrupoMuscular>("PECHO");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valorTexto = texto.trim();
    const valorPeso = peso.trim() ? Number(peso.replace(",", ".")) : null;
    if (!valorTexto || (valorPeso !== null && (!Number.isFinite(valorPeso) || valorPeso < 0)) || enviando) return;
    setEnviando(true);
    setTexto("");
    setPeso("");
    try {
      const nuevo = await crearItem("GYM", valorTexto, { grupoMuscular: grupo, peso: valorPeso });
      setItems((prev) => [...prev, nuevo]);
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarPeso(item: Item, nuevoPeso: number | null) {
    const fecha = hoy();
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, peso: nuevoPeso, fecha } : i)));
    await actualizarItem(item.id, { peso: nuevoPeso, fecha });
    reload();
  }

  async function cambiarFecha(item: Item, nuevaFecha: string | null) {
    if (!nuevaFecha) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, fecha: nuevaFecha } : i)));
    await actualizarItem(item.id, { fecha: nuevaFecha });
    reload();
  }

  async function renombrar(item: Item, nuevoTexto: string) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, texto: nuevoTexto } : i)));
    await actualizarItem(item.id, { texto: nuevoTexto });
    reload();
  }

  async function eliminar(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await eliminarItem(id);
  }

  async function reordenar(itemsReordenados: Item[]) {
    await reordenarColumna(itemsReordenados, (id, orden) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, orden } : i)));
    });
    reload();
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 mb-6">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ejercicio (press banca...)"
          className="flex-1 min-w-[10rem] rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        />
        <input
          type="number"
          min={0}
          step={0.5}
          inputMode="decimal"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="kg"
          aria-label="Peso en kg"
          className="w-20 rounded-md border border-sand px-2 py-2 bg-white focus:border-sage outline-none"
        />
        <select
          value={grupo}
          onChange={(e) => setGrupo(e.target.value as GrupoMuscular)}
          aria-label="Grupo muscular"
          className="rounded-md border border-sand px-3 py-2 bg-white focus:border-sage outline-none"
        >
          {GRUPOS.map((g) => (
            <option key={g.grupo} value={g.grupo}>
              {g.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="bg-sage text-white font-medium px-4 py-2 rounded-md hover:bg-sagedark transition disabled:opacity-40"
        >
          Añadir
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-6">
        {GRUPOS.map((g) => (
          <Columna
            key={g.grupo}
            titulo={g.label}
            items={items.filter((i) => i.grupoMuscular === g.grupo).sort((a, b) => a.orden - b.orden)}
            onCambiarPeso={cambiarPeso}
            onCambiarFecha={cambiarFecha}
            onRenombrar={renombrar}
            onEliminar={eliminar}
            onReordenar={reordenar}
          />
        ))}
      </div>
    </div>
  );
}

function Columna({
  titulo,
  items,
  onCambiarPeso,
  onCambiarFecha,
  onRenombrar,
  onEliminar,
  onReordenar,
}: {
  titulo: string;
  items: Item[];
  onCambiarPeso: (item: Item, peso: number | null) => void;
  onCambiarFecha: (item: Item, fecha: string | null) => void;
  onRenombrar: (item: Item, texto: string) => void;
  onEliminar: (id: string) => void;
  onReordenar: (itemsReordenados: Item[]) => void;
}) {
  return (
    <ColumnaDesplegable titulo={titulo} count={items.length}>
      {items.length === 0 ? (
        <p className="text-ink/40 text-sm italic">Sin ejercicios apuntados</p>
      ) : (
        <ListaOrdenable items={items} onReordenar={onReordenar} className="card divide-y divide-sand">
          {(item) => (
            <FilaOrdenable key={item.id} id={item.id} className="flex items-center gap-2 px-3 py-2">
              {({ asaProps }) => (
                <>
                  <AsaArrastre asaProps={asaProps} />
                  <NombreEditable texto={item.texto} onGuardar={(t) => onRenombrar(item, t)}>
                    {(texto) => <span className="flex-1 text-ink">{texto}</span>}
                  </NombreEditable>
                  <PesoEditable peso={item.peso} onChange={(p) => onCambiarPeso(item, p)} />
                  <FechaEditable
                    fecha={item.fecha ?? item.createdAt}
                    onChange={(f) => onCambiarFecha(item, f)}
                    permitirBorrar={false}
                  />
                  <button
                    onClick={() => onEliminar(item.id)}
                    aria-label="Eliminar"
                    className="text-ink/30 hover:text-clay transition px-1"
                  >
                    ✕
                  </button>
                </>
              )}
            </FilaOrdenable>
          )}
        </ListaOrdenable>
      )}
    </ColumnaDesplegable>
  );
}

// Como TipoCocinaEditable pero numérico: toca el peso para cambiarlo, y
// dejarlo vacío lo quita (ejercicios sin lastre).
function PesoEditable({ peso, onChange }: { peso: number | null; onChange: (peso: number | null) => void }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(peso?.toString() ?? "");

  function abrir(e: React.MouseEvent) {
    e.stopPropagation();
    setValor(peso?.toString() ?? "");
    setEditando(true);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEditando(false);
    const limpio = valor.trim().replace(",", ".");
    const nuevo = limpio ? Number(limpio) : null;
    if (nuevo !== null && (!Number.isFinite(nuevo) || nuevo < 0)) return;
    if (nuevo !== peso) onChange(nuevo);
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="number"
          min={0}
          step={0.5}
          inputMode="decimal"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardar}
          aria-label="Peso en kg"
          className="w-20 text-sm rounded border border-sand px-1.5 py-0.5 bg-white focus:border-sage outline-none"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={abrir}
      title="Editar peso"
      aria-label="Editar peso"
      className={`shrink-0 text-sm px-1.5 py-0.5 rounded-full border tabular-nums ${
        peso !== null
          ? "border-sage/40 text-sagedark bg-sage/10 hover:bg-sage/20 font-semibold"
          : "border-sand text-ink/30 hover:text-sage"
      }`}
    >
      {peso !== null ? kg(peso) : "+ kg"}
    </button>
  );
}
