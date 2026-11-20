/**
 * Language rules from AGENTS.md / docs/Brief_Web_CUORE.md, shared by every test
 * that scans user-facing copy (compliance.test.ts, chat/knowledge.test.ts).
 */

/** Collect every string reachable inside a value. */
export function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

// Negated disclaimers ("does not diagnose, treat or prevent") are required copy.
export const stripNegatedDisclaimer = (s: string) =>
  s
    .replace(/tidak mendiagnosis, mengobati, atau mencegah penyakit/gi, "")
    .replace(/does not diagnose, treat or prevent disease/gi, "");

export const FORBIDDEN: [string, RegExp][] = [
  ["cure claim", /menyembuhkan|\bcure[sd]?\b|\bheal(s|ing)?\b/i],
  ["cholesterol-lowering claim", /menurunkan\s+(kadar\s+)?kolesterol|lower(s|ing)?\s+(your\s+)?cholesterol|reduce[sd]?\s+cholesterol/i],
  ["disease-prevention claim", /mencegah\s+penyakit|prevent(s|ing)?\s+(heart\s+)?disease|mencegah\s+hipertensi/i],
  ["'side effect' wording", /efek samping|side effects?/i],
  ["sodium superiority", /lebih rendah natrium|rendah natrium|lower sodium|low[- ]sodium|less sodium|kurangi natrium|reduc\w* (your )?sodium/i],
  ["treatment wording", /terapi|therapy|obat untuk menyembuhkan|treats? (high|hypertension|diabetes)/i],
];
