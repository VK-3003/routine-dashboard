import { JOURS_SEMAINE } from "./domaines.js";

export function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function todayWeekday() {
  // getDay(): 0=Sunday..6=Saturday -> JOURS_SEMAINE: 0=Lundi..6=Dimanche
  const jsDay = new Date().getDay();
  return JOURS_SEMAINE[(jsDay + 6) % 7];
}

export function appliesToday(routine, weekday) {
  if (routine.frequence === "Quotidien" || !routine.frequence) return true;
  if (routine.frequence === "Ponctuel") return true;
  // "2x/semaine", "3x/semaine", "Hebdo": only on assigned days
  return routine.jours?.includes(weekday) ?? false;
}
