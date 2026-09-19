import { describe, expect, it } from "vitest";
import {
  timeToMinutes,
  minutesToTime,
  snapMinutes,
  timeToY,
  yToTime,
  HOUR_HEIGHT,
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

  it("scales one hour to HOUR_HEIGHT pixels", () => {
    const y1 = timeToY("10:00");
    const y2 = timeToY("11:00");
    expect(y2 - y1).toBe(HOUR_HEIGHT);
  });
});
