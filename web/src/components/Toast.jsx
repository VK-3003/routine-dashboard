import { useEffect } from "react";

const AUTO_DISMISS_MS = 5000;

export default function Toast({ message, actionLabel, onAction, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-panel border border-line px-4 py-2.5 shadow-lg text-sm text-ink">
      <span>{message}</span>
      {actionLabel && (
        <button
          onClick={() => {
            onAction();
            onDismiss();
          }}
          className="text-emerald-400 font-medium hover:text-emerald-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
