import { useEffect, useState } from "react";

/** "⌘K" on Apple platforms, "Ctrl K" elsewhere. Renders "Ctrl K" during SSR. */
export const useShortcutLabel = () => {
  const [label, setLabel] = useState("Ctrl K");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setLabel("⌘K");
  }, []);
  return label;
};
