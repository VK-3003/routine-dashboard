const STORAGE_KEY = "routine_theme";

function systemPrefersLight() {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
}

export function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private browsing / blocked storage: fall through to system preference */
  }
  return systemPrefersLight() ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* not persisted this session, still applied visually */
  }
}
