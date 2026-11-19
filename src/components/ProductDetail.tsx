"use client";

import Link from "next/link";
import {
  BASE_COMPOSITION,
  ESTIMATE_NOTE,
  GENERAL_NOTE,
  INGREDIENT_NAME,
  NUTRITION_KEYS,
  NUTRITION_LABEL,
  PREP_STEPS,
  type Product,
} from "@/lib/products";
import { useLang } from "./LangProvider";
import { Disclaimer } from "./ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-lg font-bold text-accent-ink">{title}</h3>
      {children}
    </section>
  );
}

export function ProductDetail({
  product,
  showLink = false,
  wide = false,
}: {
  product: Product;
  showLink?: boolean;
  /** Two columns from tablet width up (used on the full-page QR view). */
  wide?: boolean;
}) {
  const { lang, t } = useLang();
  const p = t.products;
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  return (
    <div data-theme={product.theme} className={`text-fg ${wide ? "md:grid md:grid-cols-2 md:gap-x-10" : ""}`}>
      <p className="text-base font-semibold text-accent md:col-span-2">{product.tagline[lang]}</p>

      <Section title={p.focus}>
        <p>{product.focus[lang]}</p>
      </Section>
      <Section title={p.priority}>
        <p>{product.priorityFor[lang]}</p>
      </Section>
      <Section title={p.benefit}>
        <p>{product.benefit[lang]}</p>
      </Section>

      <Section title={p.allergens}>
        <ul className="list-disc space-y-1 pl-5">
          {product.allergens[lang].map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      <Section title={p.composition}>
        <div className="space-y-3">
          <div>
            <p className="font-semibold">{p.module}</p>
            <p className="text-muted">
              {product.composition.map((i) => `${INGREDIENT_NAME[i.id][lang]} ${i.grams} g`).join(", ")}
            </p>
          </div>
          <div>
            <p className="font-semibold">{p.base}</p>
            <p className="text-muted">
              {BASE_COMPOSITION.map((i) => `${INGREDIENT_NAME[i.id][lang]} ${i.grams} g`).join(", ")}
            </p>
          </div>
        </div>
      </Section>

      <Section title={p.nutrition}>
        <table className="w-full border-collapse text-base">
          <caption className="sr-only">{p.nutrition}</caption>
          <tbody>
            {NUTRITION_KEYS.map((k) => (
              <tr key={k} className="border-b border-line">
                <th scope="row" className="py-2 pr-2 text-left font-medium">
                  {NUTRITION_LABEL[k].label[lang]}
                </th>
                <td className="py-2 text-right font-bold">
                  {fmt(product.nutrition[k])} {NUTRITION_LABEL[k].unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm font-semibold text-muted">{ESTIMATE_NOTE[lang]}</p>
      </Section>

      <Section title={p.prepare}>
        <ol className="list-decimal space-y-1 pl-5">
          {PREP_STEPS[lang].map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Section>

      <Section title={p.generalNote}>
        <p className="text-muted">{GENERAL_NOTE[lang]}</p>
      </Section>

      {showLink && (
        <Link
          href={`/cup/${product.slug}`}
          className="mt-6 flex min-h-14 items-center justify-center rounded-full bg-accent px-6 text-lg font-bold text-white md:col-span-2"
        >
          {p.viewPage}
        </Link>
      )}
      <Disclaimer className="mt-6 md:col-span-2" />
    </div>
  );
}
