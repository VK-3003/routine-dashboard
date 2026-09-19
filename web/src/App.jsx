import { useState } from "react";
import KeyGate from "./components/KeyGate.jsx";
import TodayView from "./components/TodayView.jsx";
import WeekView from "./components/WeekView.jsx";
import StatsView from "./components/StatsView.jsx";

const TABS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "Semaine" },
  { id: "stats", label: "Stats" },
];

export default function App() {
  const [tab, setTab] = useState("today");

  return (
    <KeyGate>
      <div className="min-h-screen">
        <nav className="flex gap-1 border-b border-white/10 px-4 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {tab === "today" && <TodayView />}
        {tab === "week" && <WeekView />}
        {tab === "stats" && <StatsView />}
      </div>
    </KeyGate>
  );
}
