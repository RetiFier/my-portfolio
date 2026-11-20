import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "../../utils/animations";

interface ToastDetail {
  message: string;
  /** Optional small label shown before the message, e.g. "trophy 03 / 06". */
  label?: string;
}

/** Show a short status message from anywhere. */
export const toast = (message: string, label?: string) =>
  window.dispatchEvent(new CustomEvent<ToastDetail>("toast", { detail: { message, label } }));

interface Item extends ToastDetail {
  id: number;
}

let seq = 0;

/** Bottom-centre status messages (copy confirmations, trophies). Announced politely. */
export const Toaster: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const { message, label } = (e as CustomEvent<ToastDetail>).detail;
      const id = ++seq;
      setItems((prev) => [...prev.slice(-1), { id, message, label }]);
      window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
    };
    window.addEventListener("toast", onToast);
    return () => window.removeEventListener("toast", onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="no-print pointer-events-none fixed bottom-6 left-1/2 z-[95] flex w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 flex-col items-center gap-2"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.p
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center gap-3 border border-ink bg-ink px-4 py-2.5 font-mono text-meta text-canvas"
          >
            {t.label && <span className="uppercase tracking-[0.05em] text-accent">{t.label}</span>}
            <span>{t.message}</span>
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  );
};
