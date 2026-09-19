function todayLocalStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDays(dateStr, offset) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Completion this week (last 7 days) vs the 7 days before that, as a
 * percentage-point delta. Null when either window has no logged entries -
 * a flat 0% isn't meaningful to show when there's nothing to compare.
 */
export function weekOverWeekDelta(entries) {
  const byDate = Object.fromEntries(entries.map((e) => [e.date, e.fait]));
  const today = todayLocalStr();

  const thisWeek = [];
  const lastWeek = [];
  for (let i = 0; i < 14; i++) {
    const date = shiftDays(today, -i);
    if (!(date in byDate)) continue;
    (i < 7 ? thisWeek : lastWeek).push(byDate[date]);
  }

  if (!thisWeek.length || !lastWeek.length) return null;

  const ratio = (arr) => arr.filter(Boolean).length / arr.length;
  return Math.round((ratio(thisWeek) - ratio(lastWeek)) * 100);
}
