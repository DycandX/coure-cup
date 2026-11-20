"use client";

import { useState } from "react";
import Link from "next/link";
import { BY_SLUG, PRODUCTS } from "@/lib/products";
import { ChatView } from "./ChatView";
import { useLang } from "./LangProvider";
import { LangToggle } from "./ui";
import { ProductDetail } from "./ProductDetail";
import { Wizard } from "./Wizard";

/**
 * Lightweight, mobile-first landing page opened by the QR code on a cup.
 * Opens straight into the screening wizard; product info is one tap away.
 */
export function CupPage({ slug }: { slug: keyof typeof BY_SLUG }) {
  const product = BY_SLUG[slug];
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"check" | "about" | "ask">("check");
  const [aboutId, setAboutId] = useState(product.id);
  const about = PRODUCTS[aboutId];

  const tabs = [
    { id: "check" as const, label: t.qr.tabCheck },
    { id: "about" as const, label: t.qr.tabAbout(about.name) },
    { id: "ask" as const, label: t.qr.tabAsk },
  ];

  return (
    <div data-theme={product.theme} className="min-h-dvh bg-bg">
      <header className="bg-accent px-5 pb-8 pt-5 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="min-h-12 content-center text-base font-bold underline underline-offset-4">
            {t.qr.backHome}
          </Link>
          <LangToggle className="!border-white !text-white" />
        </div>
        <div className="mx-auto mt-6 max-w-3xl">
          <p className="text-base font-semibold text-white/90">
            CUORE · {product.tagline[lang]} · {t.qr.scanned(product.name)}
          </p>
          <h1 className="mt-1 text-5xl font-extrabold tracking-tight md:text-6xl">{product.name}</h1>
        </div>
      </header>
      <main className="mx-auto -mt-4 max-w-3xl rounded-t-3xl bg-surface px-5 pb-12 pt-5 shadow-sm sm:px-8">
        <div role="tablist" className="mb-5 flex gap-2">
          {tabs.map((x) => (
            <button
              key={x.id}
              role="tab"
              type="button"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`min-h-12 flex-1 rounded-2xl border-2 px-3 text-base font-bold ${
                tab === x.id ? "border-accent bg-accent text-white" : "border-line bg-surface text-accent-ink"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div hidden={tab !== "check"}>
          <Wizard
            scannedCup={product.id}
            onOpenProduct={(id) => {
              setAboutId(id);
              setTab("about");
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
        <div hidden={tab !== "about"}>
          <ProductDetail product={about} wide />
        </div>
        <div hidden={tab !== "ask"}>
          <ChatView
            module={product.id}
            listClassName="min-h-48 max-h-[55dvh]"
            onStartScreening={() => {
              setTab("check");
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
      </main>
    </div>
  );
}
