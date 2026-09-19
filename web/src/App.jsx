import { useEffect, useState } from "react";
import KeyGate from "./components/KeyGate.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import TodayView from "./components/TodayView.jsx";
import WeekView from "./components/WeekView.jsx";
import StatsView from "./components/StatsView.jsx";
import { applyTheme, getInitialTheme } from "./lib/theme.js";

const TABS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "Semaine" },
  { id: "stats", label: "Stats" },
];

export default function App() {
  const [tab, setTab] = useState("today");

  // Applied here (not just in ThemeToggle) so the theme is correct even on
  // the KeyGate screen, before the toggle itself has mounted.
  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  return (
    <KeyGate>
      <div className="min-h-screen bg-surface text-ink">
        <nav className="flex items-center gap-1 border-b border-line px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t.id ? "bg-panel-hover text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
          <ThemeToggle />
        </nav>
        {tab === "today" && <TodayView />}
        {tab === "week" && <WeekView />}
        {tab === "stats" && <StatsView />}
      </div>
    </KeyGate>
  );
}
