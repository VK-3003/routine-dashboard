import { useEffect, useState } from "react";
import { fetchRoutines, fetchCheckinsForDate, checkin } from "../lib/api.js";
import { todayStr, todayWeekday, appliesToday } from "../lib/dates.js";
import { MOMENTS } from "../lib/domaines.js";
import RoutineRow from "./RoutineRow.jsx";

export default function TodayView() {
  const [routines, setRoutines] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const date = todayStr();
  const weekday = todayWeekday();

  useEffect(() => {
    Promise.all([fetchRoutines(), fetchCheckinsForDate(date)])
      .then(([allRoutines, checkins]) => {
        setRoutines(allRoutines.filter((r) => appliesToday(r, weekday)));
        const map = {};
        for (const c of checkins) map[c.routine_id] = c.fait;
        setChecked(map);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date, weekday]);

  function handleToggle(routineId, fait) {
    setChecked((prev) => ({ ...prev, [routineId]: fait }));
    checkin(routineId, date, fait).catch((e) => setError(e.message));
  }

  if (loading) return <p className="text-ink-muted p-4">Chargement...</p>;
  if (error) return <p className="text-red-400 p-4">Erreur : {error}</p>;

  const byMoment = MOMENTS.map((moment) => ({
    moment,
    items: routines
      .filter((r) => (r.moment ?? "Flexible") === moment)
      .sort((a, b) => (a.heure ?? "99:99").localeCompare(b.heure ?? "99:99")),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-ink">Aujourd'hui — {weekday}</h1>
      {byMoment.map(({ moment, items }) => (
        <section key={moment}>
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-faint mb-1">{moment}</h2>
          <div className="rounded-xl bg-panel divide-y divide-line">
            {items.map((routine) => (
              <RoutineRow
                key={routine.id}
                routine={routine}
                checked={!!checked[routine.id]}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </section>
      ))}
      {byMoment.length === 0 && <p className="text-ink-muted">Rien de prévu aujourd'hui.</p>}
    </div>
  );
}
