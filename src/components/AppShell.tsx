"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PRODUCT_LIST, PRODUCTS } from "@/lib/products";
import type { ModuleId } from "@/lib/recommender";
import { START_SCREENING_EVENT } from "./ChatLauncher";
import { useLang } from "./LangProvider";
import { Card, Disclaimer, LangToggle, Sheet } from "./ui";
import { AboutCuore } from "./AboutCuore";
import { ProductDetail } from "./ProductDetail";
import { Wizard } from "./Wizard";

type Screen = "landing" | "home" | "education" | "products" | "wizard";

const slide = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.22 },
};

export function AppShell() {
  const { t, lang } = useLang();
  const [screen, setScreen] = useState<Screen>("landing");
  const [topic, setTopic] = useState<string | null>(null);
  const [product, setProduct] = useState<ModuleId | null>(null);
  const [whatIsOpen, setWhatIsOpen] = useState(false);

  // Keep the phone's back button inside the app.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => setScreen((e.state?.screen as Screen) ?? "landing");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback((s: Screen) => {
    window.history.pushState({ screen: s }, "");
    setScreen(s);
    window.scrollTo({ top: 0 });
  }, []);

  // The chat can send the user to the screening: by event when already here, by #check from other pages.
  useEffect(() => {
    const start = () => go("wizard");
    window.addEventListener(START_SCREENING_EVENT, start);
    if (window.location.hash === "#check") {
      window.history.replaceState({ screen: "landing" }, "", window.location.pathname);
      start();
    }
    return () => window.removeEventListener(START_SCREENING_EVENT, start);
  }, [go]);

  const closeTopic = useCallback(() => setTopic(null), []);
  const closeProduct = useCallback(() => setProduct(null), []);
  const closeWhatIs = useCallback(() => setWhatIsOpen(false), []);

  const activeTopic = t.education.topics.find((x) => x.id === topic);

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-5 pb-10 sm:px-8">
      <header className="flex min-h-16 items-center justify-between gap-2 py-3">
        {screen === "landing" ? (
          <span />
        ) : (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="min-h-12 rounded-full px-4 text-base font-bold text-accent underline underline-offset-4"
          >
            ← {t.back}
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Hidden during the wizard: leaving the page would drop the user's answers. */}
          {screen !== "wizard" && (
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center rounded-full px-4 text-base font-bold text-accent underline underline-offset-4"
            >
              {t.about.nav}
            </Link>
          )}
          <LangToggle />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={screen} {...slide}>
          {screen === "landing" && (
            <section className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
              <p className="text-6xl font-extrabold tracking-tight text-accent md:text-7xl lg:text-8xl">{t.appName}</p>
              <p className="mt-3 text-xl font-semibold text-accent-ink md:text-2xl">{t.tagline}</p>
              <p className="mt-4 max-w-sm text-lg text-muted md:max-w-xl md:text-xl">{t.landing.sub}</p>
              <button
                type="button"
                onClick={() => go("home")}
                className="mt-10 min-h-16 w-full max-w-xs rounded-full bg-accent text-2xl font-bold text-white shadow-lg"
              >
                {t.landing.cta}
              </button>
              <div className="mt-8 flex gap-3" aria-hidden="true">
                {PRODUCT_LIST.map((p) => (
                  <span key={p.id} data-theme={p.theme} className="size-5 rounded-full bg-accent md:size-6" />
                ))}
              </div>
            </section>
          )}

          {screen === "home" && (
            <section className="grid gap-4 md:grid-cols-2">
              <h1 className="text-3xl font-extrabold text-accent-ink md:col-span-2 md:text-4xl">{t.home.title}</h1>
              <div className="md:col-span-2">
                <Card title={t.home.wizard.title} desc={t.home.wizard.desc} accent onClick={() => go("wizard")} />
              </div>
              <div className="md:col-span-2">
                <Card title={t.home.whatIs.title} desc={t.home.whatIs.desc} onClick={() => setWhatIsOpen(true)} />
              </div>
              <Card title={t.home.products.title} desc={t.home.products.desc} onClick={() => go("products")} />
              <Card title={t.home.education.title} desc={t.home.education.desc} onClick={() => go("education")} />
              <Link
                href="/about"
                className="flex h-full w-full flex-col items-start justify-start rounded-3xl border-2 border-line bg-surface p-5 text-left shadow-sm md:col-span-2 md:p-6"
              >
                <span className="block text-xl font-bold text-accent-ink">{t.home.about.title}</span>
                <span className="mt-1 block text-base text-muted">{t.home.about.desc}</span>
              </Link>
            </section>
          )}

          {screen === "education" && (
            <section className="space-y-4">
              <h1 className="text-3xl font-extrabold text-accent-ink md:text-4xl">{t.education.title}</h1>
              <p className="text-base text-muted">{t.education.intro}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {t.education.topics.map((tp) => (
                  <Card key={tp.id} title={tp.title} desc={tp.summary} onClick={() => setTopic(tp.id)} />
                ))}
              </div>
            </section>
          )}

          {screen === "products" && (
            <section className="space-y-4">
              <h1 className="text-3xl font-extrabold text-accent-ink md:text-4xl">{t.products.title}</h1>
              <p className="text-base text-muted">{t.products.intro}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {PRODUCT_LIST.map((p) => (
                  <div key={p.id} data-theme={p.theme} className="flex">
                    <Card
                      title={p.name}
                      label={p.tagline[lang]}
                      desc={p.focus[lang]}
                      image={
                        p.image
                          ? { src: p.image.src, width: p.image.width, height: p.image.height }
                          : undefined
                      }
                      onClick={() => setProduct(p.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {screen === "wizard" && (
            <section className="mx-auto max-w-3xl">
              <h1 className="mb-4 text-3xl font-extrabold text-accent-ink md:text-4xl">{t.wizard.title}</h1>
              <Wizard onOpenProduct={setProduct} />
            </section>
          )}
        </motion.main>
      </AnimatePresence>

      {screen !== "wizard" && <Disclaimer className="mt-10" />}

      <Sheet open={!!activeTopic} onClose={closeTopic} title={activeTopic?.title ?? ""}>
        <div className="space-y-3 text-lg">
          {activeTopic?.body.map((para) => <p key={para}>{para}</p>)}
        </div>
        <Disclaimer className="mt-6" />
      </Sheet>

      <Sheet open={whatIsOpen} onClose={closeWhatIs} title={t.home.whatIs.title}>
        <AboutCuore
          onStartScreening={() => {
            setWhatIsOpen(false);
            go("wizard");
          }}
        />
        <Disclaimer className="mt-6" />
      </Sheet>

      <Sheet open={!!product} onClose={closeProduct} title={product ? PRODUCTS[product].name : ""}>
        {product && <ProductDetail product={PRODUCTS[product]} showLink />}
      </Sheet>
    </div>
  );
}
