import { JOURS_SEMAINE, domaineColor } from "./domaines.js";

// JS Date.getDay(): 0=Sunday..6=Saturday. Map to our French weekday names.
export function jsDayToFrench(jsDay) {
  return JOURS_SEMAINE[(jsDay + 6) % 7];
}

export function frenchToJsDay(frenchDay) {
  const index = JOURS_SEMAINE.indexOf(frenchDay);
  return index === -1 ? null : (index + 1) % 7;
}

/** Which weekdays a routine occurs on, as French day names. Empty = unplaced (goes to backlog). */
export function occurrenceDays(routine) {
  if (routine.frequence === "Quotidien" || !routine.frequence) return [...JOURS_SEMAINE];
  if (routine.frequence === "Ponctuel") return [];
  return routine.jours ?? [];
}

/** Build FullCalendar event objects for one displayed week (array of 7 Date, Monday-first). */
export function buildEvents(routines, weekDates) {
  const events = [];
  for (const routine of routines) {
    const days = occurrenceDays(routine);
    for (const day of days) {
      const jsDay = frenchToJsDay(day);
      const date = weekDates[(jsDay + 6) % 7];
      if (!date) continue;
      const dateStr = date.toISOString().slice(0, 10);
      const durationMin = routine.duree ?? 30;

      events.push({
        id: `${routine.id}__${dateStr}`,
        title: routine.nom,
        start: routine.heure ? `${dateStr}T${routine.heure}:00` : dateStr,
        end: routine.heure
          ? addMinutes(`${dateStr}T${routine.heure}:00`, durationMin)
          : undefined,
        allDay: !routine.heure,
        backgroundColor: domaineColor(routine.domaine),
        borderColor: domaineColor(routine.domaine),
        extendedProps: { routineId: routine.id, frequence: routine.frequence },
      });
    }
  }
  return events;
}

function addMinutes(isoStart, minutes) {
  const d = new Date(isoStart);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString().slice(0, 19);
}
