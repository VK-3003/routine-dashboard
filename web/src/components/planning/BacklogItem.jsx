import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { domaineColor } from "../../lib/domaines.js";

export default function BacklogItem({ routine }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `backlog:${routine.id}`,
    data: { kind: "backlog", routineId: routine.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        borderLeft: `3px solid ${domaineColor(routine.domaine)}`,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-lg px-2.5 py-1.5 text-sm cursor-grab active:cursor-grabbing bg-panel hover:bg-panel-hover text-ink touch-none"
    >
      {routine.nom}
      <span className="block text-xs text-ink-faint">{routine.frequence}</span>
    </div>
  );
}
