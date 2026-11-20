/**
 * Text handling shared by the triage and the intent matcher. Pure functions, no
 * network and no storage. Input is lower-cased, stripped of accents and punctuation,
 * split into tokens, and common slang or elongated spellings are mapped to one form.
 */

const SLANG: Record<string, string> = {
  gak: "tidak", ga: "tidak", ngga: "tidak", nggak: "tidak", enggak: "tidak", engga: "tidak", gk: "tidak",
  tdk: "tidak", tak: "tidak", sy: "saya", aq: "aku", yg: "yang", dgn: "dengan", utk: "untuk",
  bgt: "banget", krn: "karena", bs: "bisa", blh: "boleh", gmn: "bagaimana", gimana: "bagaimana", gmna: "bagaimana",
  nafas: "napas", bernafas: "bernapas", sesek: "sesak",
  cant: "cannot", cnt: "cannot", plz: "please", pls: "please", u: "you", ur: "your", abt: "about",
};

function canonToken(raw: string): string {
  let t = raw.replace(/(.)\1{2,}/g, "$1"); // "sakiiit" -> "sakit"
  // Indonesian clitics: "bedanya" -> "beda", "dadaku" -> "dada", "apakah" -> "apa"
  if (t.length > 5 && (t.endsWith("nya") || t.endsWith("kah") || t.endsWith("lah"))) t = t.slice(0, -3);
  else if (t.length > 5 && (t.endsWith("ku") || t.endsWith("mu"))) t = t.slice(0, -2);
  return SLANG[t] ?? t;
}

export function tokenize(input: string): string[] {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(canonToken);
}

/** Edit distance where swapping two neighbouring letters counts as one edit. */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * Everyday words that sit one edit away from a keyword and must never be read as a typo of it:
 * "tanya" (ask) is not "tanda" (sign), "lemas" (limp) is not "lemak" (fat), "heard" is not "heart".
 * Exact matches still work, so a keyword that is itself in this list keeps matching itself.
 */
const NEVER_A_TYPO = new Set(["tanya", "lemas", "lemah", "serta", "heard", "strike", "bahas", "kurang", "atas", "beras", "badan"]);

/**
 * A typed word matches a term exactly, or, for terms of 5+ letters, within one edit
 * (two for 9+ letters) when the first letter agrees. Short words must be exact so that
 * "dada" is never confused with "data". Misspellings such as "sesk napas" still match.
 */
export function tokenMatches(token: string, term: string): boolean {
  if (token === term) return true;
  if (NEVER_A_TYPO.has(token)) return false;
  // Four-letter terms ("pain") tolerate two neighbouring letters swapped ("pian").
  if (term.length === 4 && token.length === 4 && token[0] === term[0]) {
    return [...token].sort().join("") === [...term].sort().join("") && editDistance(token, term) === 1;
  }
  if (term.length < 5 || token.length < 4 || token[0] !== term[0]) return false;
  const max = term.length >= 9 ? 2 : 1;
  return Math.abs(token.length - term.length) <= max && editDistance(token, term) <= max;
}

/** True when the term's words appear next to each other, in order, in the tokens. */
export function hasTerm(tokens: string[], termTokens: string[]): boolean {
  if (termTokens.length === 0) return false;
  for (let i = 0; i + termTokens.length <= tokens.length; i++) {
    if (termTokens.every((w, j) => tokenMatches(tokens[i + j], w))) return true;
  }
  return false;
}

/** Compile a list of plain-text terms once. */
export const compile = (terms: readonly string[]) => terms.map((t) => tokenize(t));

export const hasAny = (tokens: string[], compiled: string[][]) => compiled.some((t) => hasTerm(tokens, t));
