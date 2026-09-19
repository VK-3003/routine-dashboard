export const START_HOUR = 5;
export const END_HOUR = 25; // 1am next day, so late-night routines aren't clipped
export const BASE_HOUR_HEIGHT = 64; // px per hour at zoom level 1
export const ZOOM_LEVELS = [0.75, 1, 1.5, 2];

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
export function timeToY(hhmm, hourHeight = BASE_HOUR_HEIGHT) {
  const minutes = timeToMinutes(hhmm) - START_HOUR * 60;
  return (minutes / 60) * hourHeight;
}

/** Inverse of timeToY: a pixel offset within the grid back to "HH:MM", snapped. */
export function yToTime(y, hourHeight = BASE_HOUR_HEIGHT) {
  const minutesFromStart = (y / hourHeight) * 60;
  const minutes = snapMinutes(minutesFromStart) + START_HOUR * 60;
  return minutesToTime(minutes);
}

export function totalGridHeight(hourHeight = BASE_HOUR_HEIGHT) {
  return (END_HOUR - START_HOUR) * hourHeight;
}

export const HOUR_MARKS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

/**
 * Side-by-side layout for events that overlap in time, instead of stacking
 * them on top of each other unreadably. Greedy column assignment: good
 * enough for the handful of simultaneous routines a personal planner sees
 * (not a general-purpose calendar's worst case).
 */
export function layoutOverlaps(events) {
  const withRange = events
    .map((e) => ({
      event: e,
      startMin: timeToMinutes(e.heure),
      endMin: timeToMinutes(e.heure) + (e.duree ?? 30),
    }))
    .sort((a, b) => a.startMin - b.startMin);

  const columnEnds = []; // columnEnds[i] = end time of the last event placed in column i
  const placed = withRange.map((item) => {
    let col = columnEnds.findIndex((end) => end <= item.startMin);
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(item.endMin);
    } else {
      columnEnds[col] = item.endMin;
    }
    return { ...item, col };
  });

  const columnCount = columnEnds.length || 1;
  return placed.map(({ event, col }) => ({
    event,
    leftPct: (col / columnCount) * 100,
    widthPct: (1 / columnCount) * 100,
  }));
}
