import { useEffect, useState } from "react";
import { fetchStats } from "../lib/api.js";
import StatBar from "./StatBar.jsx";

function average(values) {
  const present = values.filter((v) => v != null);
  return present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
}

function MetricCard({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-3 flex-1">
      <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
      <p className="text-2xl text-white/90 font-semibold">
        {value != null ? value.toFixed(1) : "—"}
        {value != null && <span className="text-sm text-white/40 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function StatsView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-400 p-4">Erreur : {error}</p>;
  if (!data) return <p className="text-white/50 p-4">Chargement...</p>;

  const routines = [...data.routines].sort((a, b) => (b.completion_30d ?? 0) - (a.completion_30d ?? 0));
  const sommeil = average(data.metrics.map((m) => m.sommeil));
  const energie = average(data.metrics.map((m) => m.energie));
  const stress = average(data.metrics.map((m) => m.stress));

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-white/90">Stats (30 derniers jours)</h1>

      <div className="flex gap-3">
        <MetricCard label="Sommeil moyen" value={sommeil} unit="h" />
        <MetricCard label="Énergie moyenne" value={energie} unit="/10" />
        <MetricCard label="Stress moyen" value={stress} unit="/10" />
      </div>

      <div className="rounded-xl bg-white/[0.03] px-4 py-2 divide-y divide-white/5">
        {routines.map((routine) => (
          <StatBar key={routine.id} routine={routine} />
        ))}
        {routines.length === 0 && <p className="text-white/50 py-4">Pas encore d'historique.</p>}
      </div>
    </div>
  );
}
