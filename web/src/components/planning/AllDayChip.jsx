import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { domaineColor } from "../../lib/domaines.js";

export default function AllDayChip({ routine, dayIndex }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event:${routine.id}:${dayIndex}`,
    data: { kind: "event", routineId: routine.id, dayIndex },
  });

  const color = domaineColor(routine.domaine);

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        backgroundColor: `${color}26`,
        borderLeft: `3px solid ${color}`,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.6 : 1,
      }}
      className="w-full rounded-md px-1.5 py-0.5 text-left touch-none cursor-grab active:cursor-grabbing mb-1"
      title={routine.nom}
    >
      <p className="text-[11px] font-medium text-ink truncate leading-tight">{routine.nom}</p>
    </button>
  );
}
