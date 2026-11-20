"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { Disclaimer, LangToggle } from "@/components/ui";
import { buildModelCard } from "@/lib/model-card";

export function ModelCardView() {
  const { t, lang } = useLang();
  const card = buildModelCard(lang);

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-5 pb-10 sm:px-8">
      <header className="flex min-h-16 items-center justify-between gap-2 py-3">
        <Link
          href="/about"
          className="inline-flex min-h-12 items-center rounded-full px-4 text-base font-bold text-accent underline underline-offset-4"
        >
          ← {t.back}
        </Link>
        <LangToggle />
      </header>

      <main className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-accent-ink md:text-4xl">{card.title}</h1>
          <p className="mt-2 text-base text-muted md:text-lg">{card.subtitle}</p>
        </div>

        <p className="rounded-2xl border-2 border-accent bg-accent-soft p-4 text-base font-semibold text-accent-ink">
          {card.status}
        </p>

        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          {card.sections.map((s) => (
            <section
              key={s.id}
              aria-labelledby={`mc-${s.id}`}
              className="rounded-3xl border-2 border-line bg-surface p-5 shadow-sm md:p-6"
            >
              <h2 id={`mc-${s.id}`} className="text-xl font-bold text-accent-ink md:text-2xl">
                {s.heading}
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-base text-fg">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <Disclaimer className="mt-10" />
    </div>
  );
}
