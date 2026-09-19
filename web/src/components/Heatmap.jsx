export default function Heatmap({ entries }) {
  return (
    <div className="flex gap-[3px] mt-1.5">
      {entries.map((e) => (
        <span
          key={e.date}
          title={`${e.date} — ${e.fait ? "fait" : "pas fait"}`}
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: e.fait ? "#22c55e" : "var(--color-heatmap-empty)" }}
        />
      ))}
    </div>
  );
}
