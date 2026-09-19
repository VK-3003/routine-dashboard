import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { fetchRoutines, reschedule } from "../lib/api.js";
import { occurrenceDays, isWeekRelevant, groupEventsByDay, jsDayToFrench } from "../lib/weekEvents.js";
import { yToTime, ZOOM_LEVELS, BASE_HOUR_HEIGHT } from "../lib/planningLayout.js";
import { useIsNarrow } from "../lib/useIsNarrow.js";
import PlanningGrid from "./planning/PlanningGrid.jsx";
import BacklogItem from "./planning/BacklogItem.jsx";
import Toast from "./Toast.jsx";

function mondayOf(date) {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function WeekView() {
  const isNarrow = useIsNarrow();
  const [routines, setRoutines] = useState([]);
  const [anchor, setAnchor] = useState(() => new Date());
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(1); // ZOOM_LEVELS[1] === 1x
  const hourHeight = BASE_HOUR_HEIGHT * ZOOM_LEVELS[zoomIndex];

  useEffect(() => {
    fetchRoutines().then(setRoutines).catch((e) => setError(e.message));
  }, []);

  const dates = useMemo(() => {
    if (isNarrow) return [new Date(anchor)];
    const monday = mondayOf(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [anchor, isNarrow]);

  const eventsByDay = useMemo(() => groupEventsByDay(routines, dates), [routines, dates]);
  const backlog = useMemo(
    () => routines.filter((r) => isWeekRelevant(r) && occurrenceDays(r).length === 0),
    [routines]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function applyChange(routineId, patch) {
    reschedule(routineId, patch).catch((e) => setError(e.message));
    setRoutines((prev) => prev.map((r) => (r.id === routineId ? { ...r, ...patch } : r)));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const [zone, dayIndexStr] = over.id.split(":");
    const dayIndex = Number(dayIndexStr);
    const targetDay = jsDayToFrench(dates[dayIndex].getDay());
    const routineId = active.data.current.routineId;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const isDailyAlarm = routine.frequence === "Quotidien" || !routine.frequence;
    const previous = { heure: routine.heure, jours: routine.jours };

    if (zone === "allday") {
      if (isDailyAlarm) {
        setToast({ message: `"${routine.nom}" est quotidienne, elle ne peut pas passer en "sans heure".` });
        return;
      }
      const jours = [...new Set([...(routine.jours ?? []).filter((d) => d !== targetDay), targetDay])];
      applyChange(routineId, { jours, heure: null });
      setToast({
        message: `"${routine.nom}" déplacée à ${targetDay}, sans heure.`,
        actionLabel: "Annuler",
        onAction: () => applyChange(routineId, previous),
      });
      return;
    }

    // zone === "timed"
    const overRect = over.rect;
    const activeRect = active.rect.current.translated;
    const newHeure = yToTime(activeRect.top - overRect.top, hourHeight);

    if (isDailyAlarm) {
      applyChange(routineId, { heure: newHeure });
      setToast({
        message: `"${routine.nom}" est quotidienne : seule l'heure a changé (${newHeure}).`,
        actionLabel: "Annuler",
        onAction: () => applyChange(routineId, previous),
      });
      return;
    }

    const jours = [...new Set([...(routine.jours ?? []).filter((d) => d !== targetDay), targetDay])];
    applyChange(routineId, { jours, heure: newHeure });
    setToast({
      message: `"${routine.nom}" déplacée à ${targetDay} ${newHeure}.`,
      actionLabel: "Annuler",
      onAction: () => applyChange(routineId, previous),
    });
  }

  const rangeLabel = isNarrow
    ? dates[0].toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
    : `${dates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${dates[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;

  const step = isNarrow ? 1 : 7;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="max-w-6xl mx-auto p-4 space-y-3">
        {backlog.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {backlog.map((routine) => (
              <BacklogItem key={routine.id} routine={routine} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setAnchor((d) => addDays(d, -step))}
              className="px-2.5 py-1 rounded-lg text-sm bg-panel hover:bg-panel-hover text-ink"
            >
              ‹
            </button>
            <button
              onClick={() => setAnchor(new Date())}
              className="px-2.5 py-1 rounded-lg text-sm bg-panel hover:bg-panel-hover text-ink"
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setAnchor((d) => addDays(d, step))}
              className="px-2.5 py-1 rounded-lg text-sm bg-panel hover:bg-panel-hover text-ink"
            >
              ›
            </button>
          </div>
          <p className="text-sm text-ink-muted capitalize hidden sm:block">{rangeLabel}</p>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))}
              disabled={zoomIndex === 0}
              className="px-2 py-1 rounded-lg text-sm bg-panel hover:bg-panel-hover text-ink disabled:opacity-30"
              title="Dézoomer"
            >
              −
            </button>
            <button
              onClick={() => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1))}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="px-2 py-1 rounded-lg text-sm bg-panel hover:bg-panel-hover text-ink disabled:opacity-30"
              title="Zoomer"
            >
              +
            </button>
          </div>
        </div>
        <p className="text-sm text-ink-muted capitalize sm:hidden -mt-2">{rangeLabel}</p>

        {error && <p className="text-red-400 text-sm">Erreur : {error}</p>}

        <PlanningGrid dates={dates} eventsByDay={eventsByDay} hourHeight={hourHeight} />
      </div>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </DndContext>
  );
}
