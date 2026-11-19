"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FOOD_KEYS,
  recommend,
  checkSafetyAnswers,
  computeBmi,
  renderRecommendation,
  MODULE_NAME,
  type Freq,
  type FoodFrequency,
  type HistoryAnswers,
  type ModuleId,
  type Recommendation,
  type SafetyAnswers,
  type ScreeningInput,
  type Sex,
  type SymptomAnswers,
} from "@/lib/recommender";
import { DEMO_INPUT } from "@/lib/demo";
import { PRODUCTS } from "@/lib/products";
import { useLang } from "./LangProvider";
import { Disclaimer } from "./ui";

const SAFETY_KEYS = [
  "emergencySymptoms",
  "pregnant",
  "kidneyDisease",
  "soyAllergy",
  "swallowingDifficulty",
  "takesMedication",
] as const;

const HISTORY_KEYS: (keyof HistoryAnswers)[] = [
  "hypertension",
  "highCholesterol",
  "diabetes",
  "familyHypertensionStroke",
  "familyEarlyHeartDisease",
  "familyDiabetes",
];

const SYMPTOM_KEYS: (keyof SymptomAnswers)[] = [
  "headacheNeck",
  "dizziness",
  "thirst",
  "urination",
  "hunger",
  "tiredAfterMeals",
  "weightLoss",
];

const emptyHistory = (): HistoryAnswers => ({
  hypertension: false,
  highCholesterol: false,
  diabetes: false,
  familyHypertensionStroke: false,
  familyEarlyHeartDisease: false,
  familyDiabetes: false,
});
const emptySymptoms = (): SymptomAnswers => ({
  headacheNeck: false,
  dizziness: false,
  thirst: false,
  urination: false,
  hunger: false,
  tiredAfterMeals: false,
  weightLoss: false,
});

const num = (s: string): number | undefined => {
  const v = s.trim() === "" ? undefined : Number(s.replace(",", "."));
  return v !== undefined && Number.isFinite(v) ? v : undefined;
};

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-base font-semibold">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-14 w-full rounded-2xl border-2 border-line bg-surface px-4 text-xl focus:border-accent"
      />
    </label>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label
      className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 p-3 ${
        checked ? "border-accent bg-accent-soft" : "border-line bg-surface"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-7 shrink-0 accent-[var(--accent)]"
      />
      <span className="text-base font-semibold">{label}</span>
    </label>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-12 flex-1 rounded-2xl border-2 px-3 text-base font-semibold ${
              active ? "border-accent bg-accent text-white" : "border-line bg-surface text-fg"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Wizard({
  onOpenProduct,
  scannedCup,
}: {
  onOpenProduct?: (id: ModuleId) => void;
  /** The cup whose QR code was scanned (set on /cup/[variant]). */
  scannedCup?: ModuleId;
}) {
  const { t } = useLang();
  const w = t.wizard;

  const [step, setStep] = useState(0); // 0..2, 3 = result
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [safety, setSafety] = useState<Partial<SafetyAnswers>>({});
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | undefined>();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bp, setBp] = useState([
    { s: "", d: "" },
    { s: "", d: "" },
  ]);
  const [history, setHistory] = useState<HistoryAnswers>(emptyHistory());
  const [lab, setLab] = useState({ ldl: "", hdl: "", tg: "", glu: "" });
  const [symptoms, setSymptoms] = useState<SymptomAnswers>(emptySymptoms());
  const [food, setFood] = useState<Partial<FoodFrequency>>({});
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const bmi = computeBmi(num(height), num(weight));

  const bpFilled = bp.flatMap((r) => [r.s, r.d]).filter((v) => num(v) !== undefined).length;
  const bpPartial = bpFilled !== 0 && bpFilled !== 4;

  const validate = (s: number): string | null => {
    if (s === 0) return consent && SAFETY_KEYS.every((k) => safety[k] !== undefined) ? null : w.errorIncomplete;
    if (s === 1) {
      if (
        num(age) === undefined ||
        sex === undefined ||
        num(height) === undefined ||
        num(weight) === undefined ||
        num(waist) === undefined
      )
        return w.errorIncomplete;
      return bpPartial ? w.errorBp : null;
    }
    return FOOD_KEYS.every((k) => food[k] !== undefined) ? null : w.errorIncomplete;
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setError(null);
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    const err = validate(step);
    if (err) {
      setError(err);
      return;
    }
    if (step === 0) {
      // Safety first: stop here when an answer already routes to a health professional.
      const ex = checkSafetyAnswers(consent, safety as SafetyAnswers);
      if (ex.length) {
        setRec({ kind: "consult", exclusions: ex });
        return go(3);
      }
    }
    if (step < 2) return go(step + 1);
    const hasLab = [lab.ldl, lab.hdl, lab.tg, lab.glu].some((v) => num(v) !== undefined);
    const input: ScreeningInput = {
      consent,
      age: num(age),
      sex,
      heightCm: num(height),
      weightKg: num(weight),
      waistCm: num(waist),
      bloodPressure: bpFilled === 4 ? bp.map((r) => ({ systolic: num(r.s)!, diastolic: num(r.d)! })) : [],
      history,
      symptoms,
      food,
      safety: safety as SafetyAnswers,
      tier2: hasLab
        ? { ldl: num(lab.ldl), hdl: num(lab.hdl), triglycerides: num(lab.tg), fastingGlucose: num(lab.glu) }
        : undefined,
    };
    setRec(recommend(input));
    go(3);
  };

  const reset = () => {
    setConsent(false);
    setSafety({});
    setAge("");
    setSex(undefined);
    setHeight("");
    setWeight("");
    setWaist("");
    setBp([{ s: "", d: "" }, { s: "", d: "" }]);
    setHistory(emptyHistory());
    setLab({ ldl: "", hdl: "", tg: "", glu: "" });
    setSymptoms(emptySymptoms());
    setFood({});
    setRec(null);
    setIsDemo(false);
    go(0);
  };

  const yn = [
    { value: "yes", label: w.yes },
    { value: "no", label: w.no },
  ];

  return (
    <div>
      {step < 3 && (
        <nav aria-label={w.stepLabel(step + 1, 3)} className="mb-5">
          <ol className="flex gap-2">
            {w.steps.map((name, i) => (
              <li key={name} className="flex-1" aria-current={i === step ? "step" : undefined}>
                <div className={`h-2 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
                <p className={`mt-1 text-sm ${i === step ? "font-bold text-accent-ink" : "text-muted"}`}>
                  {i + 1}. {name}
                </p>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            {w.stepLabel(step + 1, 3)}
          </p>
        </nav>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-accent-ink">{w.consentTitle}</h2>
              <p className="text-base">{w.consentBody}</p>
              <label className="flex min-h-14 items-start gap-3 rounded-2xl border-2 border-line bg-surface p-4">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 size-7 accent-[var(--accent)]"
                />
                <span className="text-base font-semibold">{w.consentCheck}</span>
              </label>
              <h2 className="pt-2 text-2xl font-bold text-accent-ink">{w.safetyTitle}</h2>
              <div className="grid gap-5 md:grid-cols-2 md:gap-x-8">
                {SAFETY_KEYS.map((k) => (
                  <fieldset key={k} className="space-y-2">
                    <legend className="text-base font-semibold">{w.safetyQuestions[k]}</legend>
                    <Segmented
                      label={w.safetyQuestions[k]}
                      options={yn}
                      value={safety[k] === undefined ? undefined : safety[k] ? "yes" : "no"}
                      onChange={(v) => setSafety((s) => ({ ...s, [k]: v === "yes" }))}
                    />
                  </fieldset>
                ))}
              </div>
              {/* Demo is for presentations in the app; the public QR pages do not offer it. */}
              {!scannedCup && (
                <div className="rounded-2xl bg-accent-soft p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRec(recommend(DEMO_INPUT));
                      setIsDemo(true);
                      go(3);
                    }}
                    className="min-h-12 rounded-full border-2 border-accent px-5 text-base font-bold text-accent"
                  >
                    {w.demoButton}
                  </button>
                  <p className="mt-2 text-sm text-muted">{w.demoHint}</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-accent-ink">{w.bodyTitle}</h2>
              <NumberField label={w.age} value={age} onChange={setAge} />
              <fieldset className="space-y-2">
                <legend className="text-base font-semibold">{w.sex}</legend>
                <Segmented<Sex>
                  label={w.sex}
                  options={[
                    { value: "female", label: w.female },
                    { value: "male", label: w.male },
                  ]}
                  value={sex}
                  onChange={setSex}
                />
              </fieldset>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <NumberField label={w.height} value={height} onChange={setHeight} />
                <NumberField label={w.weight} value={weight} onChange={setWeight} />
                <div className="col-span-2 md:col-span-1">
                  <NumberField label={w.waist} value={waist} onChange={setWaist} />
                </div>
              </div>
              {bmi !== undefined && Number.isFinite(bmi) && (
                <p className="text-base font-semibold text-accent-ink" aria-live="polite">
                  {w.bmiAuto(bmi.toFixed(1))}
                </p>
              )}

              <h2 className="pt-2 text-2xl font-bold text-accent-ink">{w.historyTitle}</h2>
              <p className="text-sm text-muted">{w.historyHint}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {HISTORY_KEYS.map((k) => (
                  <Check
                    key={k}
                    label={w.history[k]}
                    checked={history[k]}
                    onChange={(v) => setHistory((h) => ({ ...h, [k]: v }))}
                  />
                ))}
              </div>

              <fieldset className="space-y-3">
                <legend className="text-xl font-bold text-accent-ink">{w.bpTitle}</legend>
                <p className="text-sm text-muted">{w.bpHint}</p>
                <div className="grid gap-3 md:grid-cols-2">
                {bp.map((r, i) => (
                  <div key={i} className="rounded-2xl bg-accent-soft p-3">
                    <p className="mb-2 font-semibold text-accent-ink">{w.reading(i + 1)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label={w.systolic}
                        value={r.s}
                        onChange={(v) => setBp((b) => b.map((x, j) => (j === i ? { ...x, s: v } : x)))}
                      />
                      <NumberField
                        label={w.diastolic}
                        value={r.d}
                        onChange={(v) => setBp((b) => b.map((x, j) => (j === i ? { ...x, d: v } : x)))}
                      />
                    </div>
                  </div>
                ))}
                </div>
              </fieldset>

              <details className="rounded-2xl border-2 border-line bg-surface p-4">
                <summary className="min-h-10 cursor-pointer text-base font-bold">{w.optionalLab}</summary>
                <p className="my-2 text-sm text-muted">{w.optionalLabHint}</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* LDL/HDL/triglyceride fields stay hidden until the physician supplies cut-offs (DECISIONS D-003). */}
                  <NumberField label={w.glucose} value={lab.glu} onChange={(v) => setLab((l) => ({ ...l, glu: v }))} />
                </div>
              </details>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-accent-ink">{w.symptomsTitle}</h2>
              <p className="text-sm text-muted">{w.symptomsHint}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {SYMPTOM_KEYS.map((k) => (
                  <Check
                    key={k}
                    label={w.symptoms[k]}
                    checked={symptoms[k]}
                    onChange={(v) => setSymptoms((s) => ({ ...s, [k]: v }))}
                  />
                ))}
              </div>
              <h2 className="pt-2 text-2xl font-bold text-accent-ink">{w.foodTitle}</h2>
              <p className="text-base text-muted">{w.foodHint}</p>
              <div className="grid gap-5 md:grid-cols-2 md:gap-x-8">
                {FOOD_KEYS.map((k) => (
                  <fieldset key={k} className="space-y-2">
                    <legend className="text-base font-semibold">{w.food[k]}</legend>
                    <Segmented<Freq>
                      label={w.food[k]}
                      options={w.freq.map((label, i) => ({ value: i as Freq, label }))}
                      value={food[k]}
                      onChange={(v) => setFood((f) => ({ ...f, [k]: v }))}
                    />
                  </fieldset>
                ))}
              </div>
            </div>
          )}

          {step === 3 && rec && (
            <Result rec={rec} demo={isDemo} scannedCup={isDemo ? undefined : scannedCup} onReset={reset} onOpenProduct={onOpenProduct} />
          )}
        </motion.div>
      </AnimatePresence>

      {step < 3 && (
        <div className="mt-6">
          {error && (
            <p role="alert" className="mb-3 rounded-2xl bg-red-50 p-3 text-base font-semibold text-red-800">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => go(step - 1)}
                className="min-h-14 flex-1 rounded-full border-2 border-accent text-lg font-bold text-accent"
              >
                {t.previous}
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="min-h-14 flex-[2] rounded-full bg-accent text-lg font-bold text-white"
            >
              {step === 2 ? t.seeResult : t.next}
            </button>
          </div>
        </div>
      )}
      <Disclaimer className="mt-6" />
    </div>
  );
}

function Result({
  rec,
  demo,
  scannedCup,
  onReset,
  onOpenProduct,
}: {
  rec: Recommendation;
  demo: boolean;
  scannedCup?: ModuleId;
  onReset: () => void;
  onOpenProduct?: (id: ModuleId) => void;
}) {
  const { lang, t } = useLang();
  const w = t.wizard;
  const text = renderRecommendation(rec, lang);

  return (
    <div className="space-y-4" aria-live="polite">
      <h2 className="text-2xl font-bold text-accent-ink">{w.resultTitle}</h2>
      {demo && <p className="rounded-2xl bg-line p-3 text-sm font-bold">{w.demoLabel}</p>}
      {rec.kind === "module" ? (
        <div data-theme={PRODUCTS[rec.module].theme} className="rounded-3xl bg-accent-soft p-5">
          <p className="text-4xl font-extrabold text-accent">{MODULE_NAME[rec.module]}</p>
          <p className="mt-2 text-lg font-bold text-accent-ink">{text.headline}</p>
          <h3 className="mt-4 text-base font-bold text-accent-ink">{w.reasonsTitle}</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-base">
            {text.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {text.notices.map((n) => (
            <p key={n} className="mt-3 rounded-2xl border-2 border-amber-500 bg-amber-50 p-3 text-base font-semibold text-amber-950">
              {n}
            </p>
          ))}
          {scannedCup && (
            <p className="mt-3 text-base font-semibold text-accent-ink">
              {scannedCup === rec.module
                ? w.scannedSame(MODULE_NAME[scannedCup])
                : w.scannedDiff(MODULE_NAME[scannedCup], MODULE_NAME[rec.module])}
            </p>
          )}
          <p className="mt-3 text-sm text-muted">{w.tierNote(rec.tier)}</p>
          <div className="mt-4 flex flex-col gap-2">
            {onOpenProduct && (
              <button
                type="button"
                onClick={() => onOpenProduct(rec.module)}
                className="min-h-14 rounded-full bg-accent text-lg font-bold text-white"
              >
                {w.seeProduct}
              </button>
            )}
          </div>
        </div>
      ) : rec.kind === "none" ? (
        <div className="rounded-3xl border-2 border-line bg-surface p-5">
          <p className="text-xl font-bold text-accent-ink">{text.headline}</p>
          <p className="mt-3 text-base">{text.reasons[0]}</p>
          {text.notices.map((n) => (
            <p key={n} className="mt-3 rounded-2xl border-2 border-amber-500 bg-amber-50 p-3 text-base font-semibold text-amber-950">
              {n}
            </p>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-amber-500 bg-amber-50 p-5">
          <p className="text-xl font-bold text-amber-950">{text.headline}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-amber-950">
            {text.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-muted">{w.onDevice}</p>
      <p className="text-sm text-muted">{w.mlNote}</p>
      <button
        type="button"
        onClick={onReset}
        className="min-h-14 w-full rounded-full border-2 border-accent text-lg font-bold text-accent"
      >
        {t.startOver}
      </button>
    </div>
  );
}
