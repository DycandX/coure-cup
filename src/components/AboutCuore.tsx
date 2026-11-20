"use client";

import { buildAboutCuore } from "@/lib/about-cuore";
import { useLang } from "./LangProvider";

/**
 * "What is a CUORE cup?": what it is, the portion, how it works, the three modules and the
 * points to note. Used in a panel on the home screen and as a section on the About page.
 * Content comes from src/lib/about-cuore.ts, shared with the chat.
 */
export function AboutCuore({ onStartScreening }: { onStartScreening?: () => void }) {
  const { lang } = useLang();
  const a = buildAboutCuore(lang);

  return (
    <div className="space-y-6 text-base text-fg">
      <p className="text-lg">{a.intro}</p>

      <div>
        <ul className="flex flex-wrap items-stretch gap-2" aria-label={a.portion}>
          {a.portionParts.map((p, i) => (
            <li
              key={p.label}
              className={`flex min-w-24 flex-1 flex-col items-center rounded-2xl border-2 px-3 py-3 text-center ${
                i === 2 ? "border-accent bg-accent text-white" : "border-line bg-surface text-accent-ink"
              }`}
            >
              <span className="text-2xl font-extrabold">{p.grams} g</span>
              <span className="text-sm font-semibold">{p.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">{a.portion}</p>
      </div>

      <section aria-labelledby="about-steps">
        <h3 id="about-steps" className="text-xl font-bold text-accent-ink">
          {a.stepsTitle}
        </h3>
        <ol className="mt-3 space-y-3">
          {a.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-white"
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="about-modules">
        <h3 id="about-modules" className="text-xl font-bold text-accent-ink">
          {a.modulesTitle}
        </h3>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {a.modules.map((m) => (
            <li key={m.id} data-theme={m.theme} className="rounded-2xl border-2 border-accent bg-surface p-4">
              <p className="text-xl font-extrabold text-accent">{m.name}</p>
              <p className="text-sm font-semibold text-muted">{m.tagline}</p>
              <p className="mt-2">{m.focus}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-notes" className="rounded-2xl bg-accent-soft p-4">
        <h3 id="about-notes" className="text-lg font-bold text-accent-ink">
          {a.notesTitle}
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          {a.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      {onStartScreening && (
        <button
          type="button"
          onClick={onStartScreening}
          className="min-h-14 w-full rounded-full bg-accent px-6 text-lg font-bold text-white"
        >
          {a.cta}
        </button>
      )}
    </div>
  );
}
