"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "./LangProvider";
import { DISCLAIMER } from "@/lib/recommender";

export function LangToggle({ className = "" }: { className?: string }) {
  const { t, toggle, lang } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      className={`min-h-12 min-w-12 rounded-full border-2 border-accent px-4 text-base font-bold text-accent ${className}`}
    >
      {t.langToggle}
    </button>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  return (
    <p className={`text-center text-sm font-semibold text-muted ${className}`}>
      {DISCLAIMER[lang]}
    </p>
  );
}

/** Accessible bottom sheet / modal. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-3xl md:max-w-2xl bg-surface shadow-2xl sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
              <h2 className="text-xl font-bold text-accent-ink">{title}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="min-h-12 min-w-12 rounded-full bg-accent-soft px-4 font-bold text-accent-ink"
              >
                {t.close}
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Card({
  onClick,
  title,
  desc,
  accent,
  label,
}: {
  onClick: () => void;
  title: string;
  desc: string;
  accent?: boolean;
  label?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`flex h-full w-full flex-col items-start justify-start rounded-3xl border-2 p-5 text-left shadow-sm md:p-6 ${
        accent ? "border-accent bg-accent text-white" : "border-line bg-surface"
      }`}
    >
      {label && (
        <span className={`mb-1 block text-sm font-bold ${accent ? "text-white/90" : "text-accent"}`}>
          {label}
        </span>
      )}
      <span className={`block text-xl font-bold ${accent ? "text-white" : "text-accent-ink"}`}>{title}</span>
      <span className={`mt-1 block text-base ${accent ? "text-white/95" : "text-muted"}`}>{desc}</span>
    </motion.button>
  );
}

