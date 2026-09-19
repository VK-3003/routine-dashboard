import { useEffect, useState } from "react";

const BREAKPOINT = "(max-width: 767px)";

/** True on phone-width viewports - drives week-grid vs single-day layout. */
export function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia?.(BREAKPOINT).matches ?? false);

  useEffect(() => {
    const mql = window.matchMedia(BREAKPOINT);
    const onChange = (e) => setIsNarrow(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isNarrow;
}
