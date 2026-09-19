import { describe, expect, it } from "vitest";
import {
  timeToMinutes,
  minutesToTime,
  snapMinutes,
  timeToY,
  yToTime,
  layoutOverlaps,
  BASE_HOUR_HEIGHT,
  START_HOUR,
} from "../planningLayout.js";

describe("timeToMinutes / minutesToTime", () => {
  it("round-trips", () => {
    expect(timeToMinutes("09:15")).toBe(555);
    expect(minutesToTime(555)).toBe("09:15");
  });

  it("wraps past midnight", () => {
    expect(minutesToTime(1440)).toBe("00:00");
    expect(minutesToTime(1470)).toBe("00:30");
  });
});

describe("snapMinutes", () => {
  it("rounds to the nearest quarter hour", () => {
    expect(snapMinutes(7)).toBe(0);
    expect(snapMinutes(8)).toBe(15);
    expect(snapMinutes(52)).toBe(45);
    expect(snapMinutes(53)).toBe(60);
  });
});

describe("timeToY / yToTime", () => {
  it("places the grid's start hour at y=0", () => {
    expect(timeToY(`${String(START_HOUR).padStart(2, "0")}:00`)).toBe(0);
  });

  it("round-trips a time through pixel space", () => {
    expect(yToTime(timeToY("09:15"))).toBe("09:15");
    expect(yToTime(timeToY("23:45"))).toBe("23:45");
  });

  it("scales one hour to BASE_HOUR_HEIGHT pixels", () => {
    const y1 = timeToY("10:00");
    const y2 = timeToY("11:00");
    expect(y2 - y1).toBe(BASE_HOUR_HEIGHT);
  });

  it("respects a custom hour height (zoom)", () => {
    const y1 = timeToY("10:00", 100);
    const y2 = timeToY("11:00", 100);
    expect(y2 - y1).toBe(100);
    expect(yToTime(timeToY("09:15", 100), 100)).toBe("09:15");
  });
});

describe("layoutOverlaps", () => {
  it("gives a single non-overlapping event the full width", () => {
    const result = layoutOverlaps([{ heure: "09:00", duree: 30 }]);
    expect(result[0].leftPct).toBe(0);
    expect(result[0].widthPct).toBe(100);
  });

  it("splits two overlapping events side by side", () => {
    const events = [
      { id: "a", heure: "09:15", duree: 30 },
      { id: "b", heure: "09:15", duree: 20 },
    ];
    const result = layoutOverlaps(events);
    const widths = result.map((r) => r.widthPct);
    const lefts = result.map((r) => r.leftPct).sort((a, b) => a - b);

    expect(widths).toEqual([50, 50]);
    expect(lefts).toEqual([0, 50]);
  });

  it("does not split events that don't overlap in time", () => {
    const events = [
      { id: "a", heure: "09:00", duree: 15 },
      { id: "b", heure: "10:00", duree: 15 },
    ];
    const result = layoutOverlaps(events);
    expect(result.every((r) => r.widthPct === 100)).toBe(true);
  });
});
