"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/recommender/types";
import { COPY, type Copy } from "@/lib/copy";

const KEY = "cuore-lang";
const listeners = new Set<() => void>();

function readLang(): Lang {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "id" ? "id" : "en";
  } catch {
    return "en";
  }
}

let memoryLang: Lang | null = null; // fallback when storage is unavailable

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = (): Lang => memoryLang ?? readLang();
const getServerSnapshot = (): Lang => "en";

interface Ctx {
  lang: Lang;
  t: Copy;
  toggle: () => void;
}
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Lang = getSnapshot() === "id" ? "en" : "id";
    memoryLang = next;
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: keep in memory only */
    }
    listeners.forEach((l) => l());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, t: COPY[lang], toggle }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const c = useContext(LangContext);
  if (!c) throw new Error("useLang must be used inside LangProvider");
  return c;
}

