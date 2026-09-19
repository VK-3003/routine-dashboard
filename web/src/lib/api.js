const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

async function call(path, options = {}) {
  const res = await fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Erreur ${res.status}`);
  }
  return res.json();
}

export function fetchRoutines() {
  return call("/api/routines").then((data) => data.routines);
}

export function fetchCheckinsForDate(dateStr) {
  return call(`/api/checkins?date=${dateStr}`).then((data) => data.checkins);
}

export function reschedule(routineId, changes) {
  return call("/api/reschedule", {
    method: "POST",
    body: JSON.stringify({ routine_id: routineId, ...changes }),
  });
}

export function checkin(routineId, date, fait) {
  return call("/api/checkin", {
    method: "POST",
    body: JSON.stringify({ routine_id: routineId, date, fait }),
  });
}
