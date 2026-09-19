import { JOURS_SEMAINE } from "./domaines.js";

// JS Date.getDay(): 0=Sunday..6=Saturday. Map to our French weekday names.
export function jsDayToFrench(jsDay) {
  return JOURS_SEMAINE[(jsDay + 6) % 7];
}

export function frenchToJsDay(frenchDay) {
  const index = JOURS_SEMAINE.indexOf(frenchDay);
  return index === -1 ? null : (index + 1) % 7;
}

/**
 * Whether a routine belongs in the Week grid at all. Plain daily routines
 * with no fixed time apply identically every day - they're already well
 * served by the Aujourd'hui checklist, and repeating all ~20 of them across
 * all 7 day columns just floods the all-day row into unreadable mush.
 * Only routines worth *positioning* (a fixed hour, or a day that varies)
 * show up here.
 */
export function isWeekRelevant(routine) {
  if (routine.heure) return true;
  return routine.frequence === "2x/semaine" || routine.frequence === "3x/semaine" || routine.frequence === "Hebdo";
}

/** Which weekdays a routine occurs on, as French day names. Empty = unplaced (goes to backlog). */
export function occurrenceDays(routine) {
  if (routine.heure && (routine.frequence === "Quotidien" || !routine.frequence)) return [...JOURS_SEMAINE];
  if (!isWeekRelevant(routine)) return [];
  return routine.jours ?? [];
}

/**
 * Group routines per visible day (any length: 7 for the week grid, 1 for the
 * mobile day view - same grouping logic either way) into all-day vs timed
 * buckets, for PlanningGrid to render.
 */
export function groupEventsByDay(routines, dates) {
  return dates.map((date) => {
    const weekday = jsDayToFrench(date.getDay());
    const applicable = routines.filter((r) => occurrenceDays(r).includes(weekday));
    return {
      allDay: applicable.filter((r) => !r.heure),
      timed: applicable.filter((r) => r.heure),
    };
  });
}
