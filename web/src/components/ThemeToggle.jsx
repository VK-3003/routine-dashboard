import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme } from "../lib/theme.js";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      title="Changer de thème"
      className="ml-auto px-2.5 py-1.5 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-panel-hover"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
