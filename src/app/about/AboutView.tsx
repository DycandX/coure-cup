"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AboutCuore } from "@/components/AboutCuore";
import { useLang } from "@/components/LangProvider";
import { Disclaimer, LangToggle } from "@/components/ui";

const ZOOM_STEPS = [1, 1.75, 2.5] as const;

export function AboutView() {
  const { t } = useLang();
  const router = useRouter();
  const a = t.about;
  const reducedMotion = useReducedMotion();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(1); // default enlarged (1.75x) when viewer opens
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Drag-to-pan for mouse/pen. Pointer capture starts only after real movement so a plain click still zooms.
  const dragState = useRef<{
    active: boolean;
    moved: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const openViewer = useCallback(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setZoomIndex(1);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    (openerRef.current ?? triggerRef.current)?.focus();
  }, []);

  useEffect(() => {
    if (!viewerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeViewer();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !dialogRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !dialogRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [viewerOpen, closeViewer]);

  const zoom = ZOOM_STEPS[zoomIndex];

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || e.pointerType === "touch") return;
    const el = viewportRef.current;
    if (!el) return;
    dragState.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d.active) return;
    const el = viewportRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      d.moved = true;
      el.setPointerCapture(d.pointerId);
    }
    el.scrollLeft = d.scrollLeft - dx;
    el.scrollTop = d.scrollTop - dy;
  };

  const onImageClick = () => {
    // A drag ends with a click event; only a plain click changes the zoom level.
    if (dragState.current.moved) {
      dragState.current.moved = false;
      return;
    }
    setZoomIndex((i) => (i + 1) % ZOOM_STEPS.length);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    const el = viewportRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  };

  const fadeTransition = reducedMotion ? { duration: 0 } : { duration: 0.18 };

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-5 pb-10 sm:px-8">
      <header className="flex min-h-16 items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-full px-4 text-base font-bold text-accent underline underline-offset-4"
        >
          ← {t.back}
        </Link>
        <LangToggle />
      </header>

      <main className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-accent-ink md:text-4xl">{a.title}</h1>
          <p className="mt-2 text-base text-muted md:text-lg">{a.subtitle}</p>
        </div>

        <section
          aria-labelledby="about-what"
          className="rounded-3xl border-2 border-line bg-surface p-5 shadow-sm md:p-6"
        >
          <h2 id="about-what" className="mb-4 text-2xl font-extrabold text-accent-ink md:text-3xl">
            {t.home.whatIs.title}
          </h2>
          <AboutCuore onStartScreening={() => router.push("/#check")} />
        </section>

        <p className="rounded-2xl border-2 border-accent bg-accent-soft p-4 text-base font-semibold text-accent-ink">
          {a.mlNotice}
        </p>

        <Link
          href="/model"
          className="inline-flex min-h-12 items-center rounded-full border-2 border-accent px-5 text-base font-bold text-accent"
        >
          {a.modelCardLink} →
        </Link>

        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          <section className="rounded-3xl border-2 border-line bg-surface p-5 shadow-sm md:p-6">
            <h2 className="text-xl font-bold text-accent-ink md:text-2xl">{a.summaryTitle}</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-base text-fg">
              {a.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border-2 border-line bg-surface p-4 shadow-sm md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-accent-ink md:text-2xl">{a.posterTitle}</h2>
              <button
                ref={triggerRef}
                type="button"
                onClick={openViewer}
                className="min-h-12 rounded-full bg-accent px-4 text-base font-bold text-white"
              >
                {a.zoomOpen}
              </button>
            </div>
            <p className="mt-1 text-sm text-muted">{a.posterHint}</p>

            {/* Pointer-only second way to open the viewer; keyboard users use the button above. No aria-label, so the image alt stays in the accessible name. */}
            <button
              type="button"
              tabIndex={-1}
              onClick={openViewer}
              className="mt-3 block w-full overflow-hidden rounded-2xl border-2 border-line bg-bg text-left transition hover:border-accent"
            >
              <span className="sr-only">{a.zoomOpen}: </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/poster.webp"
                alt={a.posterAlt}
                width={1412}
                height={1962}
                className="h-auto w-full"
              />
            </button>
          </section>
        </div>
      </main>

      <Disclaimer className="mt-10" />

      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={a.viewerLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className="fixed inset-0 z-50 flex flex-col bg-black text-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 bg-black px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                  disabled={zoomIndex === 0}
                  aria-label={a.zoomOut}
                  className="min-h-12 min-w-12 rounded-full border-2 border-white/60 px-3 text-base font-bold text-white disabled:opacity-40"
                >
                  − {a.zoomOut}
                </button>
                <button
                  type="button"
                  onClick={() => setZoomIndex(0)}
                  aria-label={a.zoomReset}
                  className="min-h-12 rounded-full border-2 border-white/60 px-3 text-sm font-bold text-white"
                >
                  {Math.round(zoom * 100)}% · {a.zoomReset}
                </button>
                <button
                  type="button"
                  onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
                  disabled={zoomIndex === ZOOM_STEPS.length - 1}
                  aria-label={a.zoomIn}
                  className="min-h-12 min-w-12 rounded-full border-2 border-white/60 px-3 text-base font-bold text-white disabled:opacity-40"
                >
                  + {a.zoomIn}
                </button>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={closeViewer}
                aria-label={a.zoomClose}
                className="min-h-12 min-w-12 rounded-full bg-white px-5 text-base font-bold text-accent-ink"
              >
                {t.close}
              </button>
            </div>

            <p className="bg-black px-4 py-1.5 text-center text-xs text-white/85">{a.panHint}</p>

            <div
              ref={viewportRef}
              tabIndex={0}
              role="region"
              aria-label={a.posterTitle}
              style={{ touchAction: "pan-x pan-y pinch-zoom" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={`flex-1 overflow-auto overscroll-contain p-3 ${
                zoom > 1 ? "cursor-grab active:cursor-grabbing" : "flex items-start justify-center"
              }`}
            >
              <div
                style={{
                  width: zoom === 1 ? "100%" : `${Math.round(zoom * 100)}%`,
                  maxWidth: zoom === 1 ? "720px" : "none",
                }}
                className="mx-auto"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/poster.webp"
                  alt={a.posterAlt}
                  width={1412}
                  height={1962}
                  draggable={false}
                  onClick={onImageClick}
                  className="h-auto w-full select-none rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
