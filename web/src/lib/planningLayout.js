export const START_HOUR = 5;
export const END_HOUR = 25; // 1am next day, so late-night routines aren't clipped
export const HOUR_HEIGHT = 64; // px per hour, drives the whole grid's scale

export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes) {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Snap to the nearest 15 minutes. */
export function snapMinutes(minutes) {
  return Math.round(minutes / 15) * 15;
}

/** Pixel offset from the grid's top for a given "HH:MM" time. */
export function timeToY(hhmm) {
  const minutes = timeToMinutes(hhmm) - START_HOUR * 60;
  return (minutes / 60) * HOUR_HEIGHT;
}

/** Inverse of timeToY: a pixel offset within the grid back to "HH:MM", snapped. */
export function yToTime(y) {
  const minutesFromStart = (y / HOUR_HEIGHT) * 60;
  const minutes = snapMinutes(minutesFromStart) + START_HOUR * 60;
  return minutesToTime(minutes);
}

export function totalGridHeight() {
  return (END_HOUR - START_HOUR) * HOUR_HEIGHT;
}

export const HOUR_MARKS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
