import { domaineColor } from "../lib/domaines.js";
import Heatmap from "./Heatmap.jsx";

export default function StatBar({ routine, periodDays = 30 }) {
  const completion = periodDays <= 7 ? routine.completion_7d : routine.completion_30d;
  const pct = completion != null ? Math.round(completion * 100) : null;
  const color = domaineColor(routine.domaine);
  const entries = routine.entries.slice(-periodDays);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-white/90">{routine.nom}</span>
        <span className="flex items-center gap-2 text-white/50 shrink-0">
          {routine.streak > 0 && <span title="Streak">🔥 {routine.streak}</span>}
          <span className="tabular-nums w-10 text-right">{pct != null ? `${pct}%` : "—"}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct ?? 0}%`, backgroundColor: color }} />
      </div>
      <Heatmap entries={entries} />
    </div>
  );
}
