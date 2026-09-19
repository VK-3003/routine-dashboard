import { useEffect, useMemo, useState } from "react";
import { fetchStats } from "../lib/api.js";
import StatBar from "./StatBar.jsx";

const PERIODS = [
  { id: "7", label: "7 jours", days: 7 },
  { id: "30", label: "30 jours", days: 30 },
];

function average(values) {
  const present = values.filter((v) => v != null);
  return present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
}

function MetricCard({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-panel px-4 py-3 flex-1">
      <p className="text-xs text-ink-faint uppercase tracking-wide">{label}</p>
      <p className="text-2xl text-ink font-semibold">
        {value != null ? value.toFixed(1) : "—"}
        {value != null && <span className="text-sm text-ink-faint ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
        active ? "bg-chip-active text-ink" : "text-ink-muted hover:text-ink bg-panel"
      }`}
    >
      {children}
    </button>
  );
}

export default function StatsView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [periodId, setPeriodId] = useState("30");
  const [domaine, setDomaine] = useState(null);

  useEffect(() => {
    fetchStats().then(setData).catch((e) => setError(e.message));
  }, []);

  const periodDays = PERIODS.find((p) => p.id === periodId).days;

  const domaines = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.routines.map((r) => r.domaine).filter(Boolean))].sort();
  }, [data]);

  const routines = useMemo(() => {
    if (!data) return [];
    const filtered = domaine ? data.routines.filter((r) => r.domaine === domaine) : data.routines;
    const completionKey = periodId === "7" ? "completion_7d" : "completion_30d";
    return [...filtered].sort((a, b) => (b[completionKey] ?? 0) - (a[completionKey] ?? 0));
  }, [data, domaine, periodId]);

  const metrics = useMemo(() => {
    if (!data) return [];
    return data.metrics.slice(-periodDays);
  }, [data, periodDays]);

  if (error) return <p className="text-red-400 p-4">Erreur : {error}</p>;
  if (!data) return <p className="text-ink-muted p-4">Chargement...</p>;

  const sommeil = average(metrics.map((m) => m.sommeil));
  const energie = average(metrics.map((m) => m.energie));
  const stress = average(metrics.map((m) => m.stress));

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Stats</h1>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Chip key={p.id} active={periodId === p.id} onClick={() => setPeriodId(p.id)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      {domaines.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Chip active={domaine === null} onClick={() => setDomaine(null)}>
            Tous
          </Chip>
          {domaines.map((d) => (
            <Chip key={d} active={domaine === d} onClick={() => setDomaine(d)}>
              {d}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <MetricCard label="Sommeil moyen" value={sommeil} unit="h" />
        <MetricCard label="Énergie moyenne" value={energie} unit="/10" />
        <MetricCard label="Stress moyen" value={stress} unit="/10" />
      </div>

      <div className="rounded-xl bg-panel px-4 py-2 divide-y divide-line">
        {routines.map((routine) => (
          <StatBar key={routine.id} routine={routine} periodDays={periodDays} />
        ))}
        {routines.length === 0 && <p className="text-ink-muted py-4">Rien pour ce filtre.</p>}
      </div>
    </div>
  );
}
