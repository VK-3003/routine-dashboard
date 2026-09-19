import { domaineColor } from "../lib/domaines.js";

export default function RoutineRow({ routine, checked, onToggle }) {
  return (
    <label className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(routine.id, e.target.checked)}
        className="h-4 w-4 accent-emerald-500"
      />
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: domaineColor(routine.domaine) }}
        title={routine.domaine ?? ""}
      />
      {routine.heure && (
        <span className="text-xs text-white/50 tabular-nums w-11 shrink-0">{routine.heure}</span>
      )}
      <span className={checked ? "line-through text-white/40" : "text-white/90"}>{routine.nom}</span>
      {routine.duree && <span className="ml-auto text-xs text-white/40">{routine.duree} min</span>}
    </label>
  );
}
