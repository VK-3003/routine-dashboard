import { describe, expect, it } from "vitest";
import {
  jsDayToFrench,
  frenchToJsDay,
  isWeekRelevant,
  occurrenceDays,
  buildEvents,
} from "../weekEvents.js";
import { JOURS_SEMAINE } from "../domaines.js";

describe("jsDayToFrench / frenchToJsDay", () => {
  it("round-trips every day of the week", () => {
    for (let jsDay = 0; jsDay < 7; jsDay++) {
      const french = jsDayToFrench(jsDay);
      expect(frenchToJsDay(french)).toBe(jsDay);
    }
  });

  it("maps Monday to JS day 1 and Sunday to JS day 0", () => {
    expect(jsDayToFrench(1)).toBe("Lundi");
    expect(jsDayToFrench(0)).toBe("Dimanche");
    expect(frenchToJsDay("Lundi")).toBe(1);
    expect(frenchToJsDay("Dimanche")).toBe(0);
  });
});

describe("isWeekRelevant", () => {
  it("is true for a routine with a fixed time", () => {
    expect(isWeekRelevant({ heure: "09:15", frequence: "Quotidien" })).toBe(true);
  });

  it("is false for a plain daily routine with no time (belongs to Aujourd'hui only)", () => {
    expect(isWeekRelevant({ heure: null, frequence: "Quotidien" })).toBe(false);
  });

  it("is true for Nx/semaine and Hebdo regardless of heure", () => {
    expect(isWeekRelevant({ heure: null, frequence: "2x/semaine" })).toBe(true);
    expect(isWeekRelevant({ heure: null, frequence: "3x/semaine" })).toBe(true);
    expect(isWeekRelevant({ heure: null, frequence: "Hebdo" })).toBe(true);
  });

  it("is false for Ponctuel with no time", () => {
    expect(isWeekRelevant({ heure: null, frequence: "Ponctuel" })).toBe(false);
  });
});

describe("occurrenceDays", () => {
  it("returns all 7 days for a daily routine with a fixed time", () => {
    const days = occurrenceDays({ heure: "09:15", frequence: "Quotidien", jours: [] });
    expect(days).toEqual(JOURS_SEMAINE);
  });

  it("returns an empty list for a daily routine with no time (excluded from the week)", () => {
    expect(occurrenceDays({ heure: null, frequence: "Quotidien", jours: [] })).toEqual([]);
  });

  it("returns the assigned Jours for a Nx/semaine routine", () => {
    const routine = { heure: null, frequence: "2x/semaine", jours: ["Mardi", "Jeudi"] };
    expect(occurrenceDays(routine)).toEqual(["Mardi", "Jeudi"]);
  });

  it("returns an empty list (backlog) for a Nx/semaine routine with no assigned day", () => {
    expect(occurrenceDays({ heure: null, frequence: "3x/semaine", jours: [] })).toEqual([]);
  });
});

describe("buildEvents", () => {
  // A Monday-first week: index 0 = Monday 2026-09-14 .. index 6 = Sunday 2026-09-20.
  const weekDates = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2026, 8, 14 + i)));

  it("places a timed daily routine on every day at the right time", () => {
    const routine = { id: "r1", nom: "Test", heure: "09:15", frequence: "Quotidien", domaine: "Sport" };
    const events = buildEvents([routine], weekDates);

    expect(events).toHaveLength(7);
    expect(events[0].start).toBe("2026-09-14T09:15:00");
    expect(events[0].allDay).toBe(false);
  });

  it("places a Nx/semaine routine only on its assigned days", () => {
    const routine = {
      id: "r2",
      nom: "Test 2x",
      heure: null,
      frequence: "2x/semaine",
      jours: ["Mardi", "Vendredi"],
      domaine: "Kiné",
    };
    const events = buildEvents([routine], weekDates);

    expect(events).toHaveLength(2);
    expect(events[0].allDay).toBe(true);
    expect(events[0].start).toBe("2026-09-15"); // Tuesday
    expect(events[1].start).toBe("2026-09-18"); // Friday
  });

  it("excludes plain daily routines with no time entirely", () => {
    const routine = { id: "r3", nom: "Boire de l'eau", heure: null, frequence: "Quotidien", jours: [] };
    expect(buildEvents([routine], weekDates)).toHaveLength(0);
  });
});
