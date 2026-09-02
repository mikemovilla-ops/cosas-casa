"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Lista arrastrable genérica: cada columna de cada lista (Compra, Casa,
// Tareas, Deudas) la envuelve con esto. `items` debe venir ya ordenado (por
// `orden`) — al soltar, se avisa vía onReordenar con la columna entera ya
// reordenada, y quien llama reasigna un `orden` secuencial (0,1,2...) a
// todos sus items. No se calcula solo un valor intermedio entre los dos
// vecinos porque, si varios items comparten el mismo `orden` de partida
// (p. ej. todos los que ya existían antes de añadir esta función, con el
// valor por defecto 0), la media entre dos iguales sigue dando el mismo
// valor y el arrastre no tendría ningún efecto real.
export default function ListaOrdenable<T extends { id: string }>({
  items,
  onReordenar,
  className,
  children,
}: {
  items: T[];
  onReordenar: (itemsReordenados: T[]) => void;
  className?: string;
  children: (item: T) => React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReordenar(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={className}>{items.map((item) => children(item))}</ul>
      </SortableContext>
    </DndContext>
  );
}

// Fila de una ListaOrdenable. `children` recibe las props del "asa" de
// arrastre para ponerlas solo en un icono, no en toda la fila — si no, cada
// botón/input de dentro (toggle, borrar, editar...) competiría con el drag.
export function FilaOrdenable({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: (props: { asaProps: React.HTMLAttributes<HTMLElement>; arrastrando: boolean }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={className}>
      {children({ asaProps: { ...attributes, ...listeners }, arrastrando: isDragging })}
    </li>
  );
}

export function AsaArrastre({ asaProps }: { asaProps: React.HTMLAttributes<HTMLElement> }) {
  return (
    <span
      {...asaProps}
      aria-label="Arrastrar para reordenar"
      className="shrink-0 text-ink/20 hover:text-ink/50 cursor-grab active:cursor-grabbing px-0.5 touch-none select-none"
    >
      ⠿
    </span>
  );
}
