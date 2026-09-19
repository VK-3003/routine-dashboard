import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import { fetchRoutines, reschedule } from "../lib/api.js";
import { buildEvents, occurrenceDays, isWeekRelevant, jsDayToFrench } from "../lib/weekEvents.js";
import { domaineColor } from "../lib/domaines.js";

function mondayOf(date) {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekDatesFrom(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function WeekView() {
  const [routines, setRoutines] = useState([]);
  const [weekStart, setWeekStart] = useState(mondayOf(new Date()));
  const [error, setError] = useState(null);
  const backlogRef = useRef(null);

  useEffect(() => {
    fetchRoutines().then(setRoutines).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!backlogRef.current) return;
    const draggable = new Draggable(backlogRef.current, {
      itemSelector: ".backlog-item",
      eventData: (el) => ({
        title: el.dataset.nom,
        extendedProps: { routineId: el.dataset.id },
        backgroundColor: el.dataset.color,
        borderColor: el.dataset.color,
      }),
    });
    return () => draggable.destroy();
  }, [routines]);

  const weekDates = useMemo(() => weekDatesFrom(weekStart), [weekStart]);
  const events = useMemo(() => buildEvents(routines, weekDates), [routines, weekDates]);
  const backlog = useMemo(
    () => routines.filter((r) => isWeekRelevant(r) && occurrenceDays(r).length === 0),
    [routines]
  );

  function updateRoutine(routineId, patch) {
    setRoutines((prev) => prev.map((r) => (r.id === routineId ? { ...r, ...patch } : r)));
  }

  function handleEventDrop(info) {
    const routineId = info.event.extendedProps.routineId;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const newDate = info.event.start;
    const newHeure = info.event.allDay
      ? null
      : `${String(newDate.getHours()).padStart(2, "0")}:${String(newDate.getMinutes()).padStart(2, "0")}`;

    if (routine.frequence === "Quotidien" || !routine.frequence) {
      // Applies every day - only the time can meaningfully change.
      reschedule(routineId, { heure: newHeure }).catch((e) => setError(e.message));
      updateRoutine(routineId, { heure: newHeure });
      return;
    }

    // Nx/semaine or Hebdo: moving to a new day swaps that one day in Jours.
    const oldDay = jsDayToFrench(info.oldEvent.start.getDay());
    const newDay = jsDayToFrench(newDate.getDay());
    const jours = (routine.jours ?? []).filter((d) => d !== oldDay);
    if (!jours.includes(newDay)) jours.push(newDay);

    reschedule(routineId, { jours, heure: newHeure }).catch((e) => setError(e.message));
    updateRoutine(routineId, { jours, heure: newHeure });
  }

  function handleExternalDrop(info) {
    const routineId = info.draggedEl.dataset.id;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const newDay = jsDayToFrench(info.date.getDay());
    const jours = [...new Set([...(routine.jours ?? []), newDay])];

    reschedule(routineId, { jours }).catch((e) => setError(e.message));
    updateRoutine(routineId, { jours });
  }

  return (
    <div className="flex gap-4 p-4 max-w-6xl mx-auto">
      <aside className="w-56 shrink-0">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-faint mb-2">À placer</h2>
        <div ref={backlogRef} className="space-y-1">
          {backlog.map((routine) => (
            <div
              key={routine.id}
              className="backlog-item rounded-lg px-2 py-1.5 text-sm cursor-grab bg-panel hover:bg-panel-hover text-ink"
              data-id={routine.id}
              data-nom={routine.nom}
              data-color={domaineColor(routine.domaine)}
            >
              {routine.nom}
              <span className="block text-xs text-ink-faint">{routine.frequence}</span>
            </div>
          ))}
          {backlog.length === 0 && <p className="text-xs text-ink-faint">Rien à placer.</p>}
        </div>
      </aside>

      <div className="flex-1">
        {error && <p className="text-red-400 text-sm mb-2">Erreur : {error}</p>}
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          firstDay={1}
          locale="fr"
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          allDaySlot={true}
          allDayText="Sans heure"
          events={events}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          drop={handleExternalDrop}
          eventReceive={(info) => info.event.remove() /* handled via drop + reschedule, avoid dup */}
          datesSet={(arg) => setWeekStart(mondayOf(arg.start))}
          height="auto"
        />
      </div>
    </div>
  );
}
