import { useDroppable } from "@dnd-kit/core";
import EventBlock from "./EventBlock.jsx";
import AllDayChip from "./AllDayChip.jsx";
import { HOUR_MARKS, HOUR_HEIGHT, timeToY, totalGridHeight } from "../../lib/planningLayout.js";

export default function DayColumn({ dayIndex, date, isToday, allDayItems, timedItems }) {
  const allDayDrop = useDroppable({ id: `allday:${dayIndex}` });
  const timedDrop = useDroppable({ id: `timed:${dayIndex}` });

  return (
    <div className="flex-1 min-w-0 border-l border-line first:border-l-0">
      <div className={`text-center py-1.5 text-xs ${isToday ? "text-emerald-400 font-semibold" : "text-ink-muted"}`}>
        <span className="capitalize">{date.toLocaleDateString("fr-FR", { weekday: "short" })}</span>{" "}
        {date.getDate()}
      </div>

      <div
        ref={allDayDrop.setNodeRef}
        className={`min-h-[28px] px-0.5 py-0.5 border-t border-b border-line transition-colors ${
          allDayDrop.isOver ? "bg-chip-active" : ""
        }`}
      >
        {allDayItems.map((routine) => (
          <AllDayChip key={routine.id} routine={routine} dayIndex={dayIndex} />
        ))}
      </div>

      <div
        ref={timedDrop.setNodeRef}
        className={`relative transition-colors ${timedDrop.isOver ? "bg-chip-active" : ""}`}
        style={{ height: totalGridHeight() }}
      >
        {HOUR_MARKS.map((h) => (
          <div key={h} className="absolute left-0 right-0 border-t border-line" style={{ top: (h - HOUR_MARKS[0]) * HOUR_HEIGHT }} />
        ))}
        {timedItems.map((routine) => (
          <EventBlock
            key={routine.id}
            routine={routine}
            dayIndex={dayIndex}
            top={timeToY(routine.heure)}
            height={((routine.duree ?? 30) / 60) * HOUR_HEIGHT}
          />
        ))}
      </div>
    </div>
  );
}
