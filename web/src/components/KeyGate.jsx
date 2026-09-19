import { useEffect, useState } from "react";
import { getStoredKey, setStoredKey } from "../lib/api.js";

export default function KeyGate({ children }) {
  const [hasKey, setHasKey] = useState(() => !!getStoredKey());
  const [input, setInput] = useState("");

  useEffect(() => {
    const onUnauthorized = () => setHasKey(false);
    window.addEventListener("routine-unauthorized", onUnauthorized);
    return () => window.removeEventListener("routine-unauthorized", onUnauthorized);
  }, []);

  if (hasKey) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setStoredKey(input.trim());
    setHasKey(true);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 text-center">
        <p className="text-ink-muted text-sm">Clé d'accès</p>
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-lg bg-panel border border-line px-3 py-2 text-ink text-center outline-none focus:border-ink-muted"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600/80 hover:bg-emerald-600 py-2 text-white font-medium"
        >
          Entrer
        </button>
      </form>
    </div>
  );
}
