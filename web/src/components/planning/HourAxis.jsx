import { HOUR_MARKS, totalGridHeight } from "../../lib/planningLayout.js";

export default function HourAxis({ hourHeight }) {
  return (
    <div className="w-12 shrink-0">
      <div className="py-1.5 text-xs">&nbsp;</div>
      <div className="min-h-[28px] border-t border-b border-line" />
      <div className="relative" style={{ height: totalGridHeight(hourHeight) }}>
        {HOUR_MARKS.map((h) => (
          <div
            key={h}
            className="absolute right-2 -translate-y-1/2 text-[11px] text-ink-faint tabular-nums"
            style={{ top: (h - HOUR_MARKS[0]) * hourHeight }}
          >
            {h % 24}h
          </div>
        ))}
      </div>
    </div>
  );
}
