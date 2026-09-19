import { useRef, useEffect } from "react";
import HourAxis from "./HourAxis.jsx";
import DayColumn from "./DayColumn.jsx";
import { timeToY, BASE_HOUR_HEIGHT } from "../../lib/planningLayout.js";

function todayKey(date) {
  const t = new Date();
  return date.toDateString() === t.toDateString();
}

/**
 * Renders `dates.length` day columns (7 for the week view, 1 for the mobile
 * day view - same component either way, so the drag-and-drop logic and
 * visuals never diverge between screen sizes).
 */
export default function PlanningGrid({ dates, eventsByDay, hourHeight = BASE_HOUR_HEIGHT }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Land the initial scroll roughly on the first event of the day, or a
    // sensible default (8am) - no one wants to scroll past empty hours first.
    const firstTimed = eventsByDay.flatMap((d) => d.timed)[0];
    const target = timeToY(firstTimed?.heure ?? "08:00", hourHeight);
    scrollRef.current?.scrollTo({ top: Math.max(target - 40, 0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates[0]?.toDateString()]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-y-auto rounded-xl bg-panel scroll-themed"
      style={{ maxHeight: "70vh" }}
    >
      <HourAxis hourHeight={hourHeight} />
      {dates.map((date, i) => (
        <DayColumn
          key={date.toISOString()}
          dayIndex={i}
          date={date}
          isToday={todayKey(date)}
          allDayItems={eventsByDay[i]?.allDay ?? []}
          timedItems={eventsByDay[i]?.timed ?? []}
          hourHeight={hourHeight}
        />
      ))}
    </div>
  );
}
