import { domaineColor } from "../lib/domaines.js";
import { weekOverWeekDelta } from "../lib/trend.js";
import Heatmap from "./Heatmap.jsx";

function TrendBadge({ delta }) {
  if (delta == null || delta === 0) return null;
  const up = delta > 0;
  return (
    <span className={up ? "text-emerald-400" : "text-red-400"} title="Cette semaine vs la précédente">
      {up ? "▲" : "▼"} {Math.abs(delta)}%
    </span>
  );
}

export default function StatBar({ routine, periodDays = 30 }) {
  const completion = periodDays <= 7 ? routine.completion_7d : routine.completion_30d;
  const pct = completion != null ? Math.round(completion * 100) : null;
  const color = domaineColor(routine.domaine);
  const entries = routine.entries.slice(-periodDays);
  const delta = weekOverWeekDelta(routine.entries);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink">{routine.nom}</span>
        <span className="flex items-center gap-2 text-ink-muted shrink-0">
          {routine.streak > 0 && <span title="Streak">🔥 {routine.streak}</span>}
          <TrendBadge delta={delta} />
          <span className="tabular-nums w-10 text-right">{pct != null ? `${pct}%` : "—"}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct ?? 0}%`, backgroundColor: color }} />
      </div>
      <Heatmap entries={entries} />
    </div>
  );
}
