import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { domaineColor } from "../../lib/domaines.js";

export default function EventBlock({ routine, dayIndex, top, height }) {
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
        position: "absolute",
        top,
        height: Math.max(height, 22),
        left: 2,
        right: 2,
        backgroundColor: `${color}26`,
        borderLeft: `3px solid ${color}`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="rounded-md px-1.5 py-0.5 text-left overflow-hidden touch-none cursor-grab active:cursor-grabbing"
      title={`${routine.nom}${routine.heure ? ` — ${routine.heure}` : ""}`}
    >
      <p className="text-[11px] font-medium text-ink truncate leading-tight">{routine.nom}</p>
      {routine.heure && <p className="text-[10px] text-ink-muted leading-tight">{routine.heure}</p>}
    </button>
  );
}
