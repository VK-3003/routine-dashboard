import { domaineColor } from "../lib/domaines.js";
import Heatmap from "./Heatmap.jsx";

export default function StatBar({ routine }) {
  const pct7d = routine.completion_7d != null ? Math.round(routine.completion_7d * 100) : null;
  const color = domaineColor(routine.domaine);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-white/90">{routine.nom}</span>
        <span className="flex items-center gap-2 text-white/50 shrink-0">
          {routine.streak > 0 && <span title="Streak">🔥 {routine.streak}</span>}
          <span className="tabular-nums w-10 text-right">{pct7d != null ? `${pct7d}%` : "—"}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct7d ?? 0}%`, backgroundColor: color }}
        />
      </div>
      <Heatmap entries={routine.entries} />
    </div>
  );
}
