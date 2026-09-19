const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const STORAGE_KEY = "routine_api_key";

// The access key is never baked into the build - it's entered once by the
// viewer and kept only in their own browser's localStorage. Anyone loading
// the page without it gets 401s and sees no real data.
export function getStoredKey() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* private browsing / blocked storage: key just won't persist across reloads */
  }
}

export function clearStoredKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function call(path, options = {}) {
  const res = await fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": getStoredKey() ?? "",
      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearStoredKey();
    window.dispatchEvent(new Event("routine-unauthorized"));
    throw new Error("UNAUTHORIZED");
  }
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
