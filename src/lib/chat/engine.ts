import type { Lang, ModuleId } from "../recommender/types";
import {
  CLAIM_PAIRS,
  CLAIM_SINGLE,
  DISEASE_TERMS,
  EDUCATION_TERMS,
  INTENT_TERMS,
  MATCH_ORDER,
  MEDICAL_SINGLE,
  MIN_SCORE,
  PERSONAL_MARKERS,
  SWALLOWING_SINGLE,
} from "./intents";
import { renderAnswer } from "./knowledge";
import { compile, hasAny, hasTerm, tokenize } from "./text";
import { triage, triageLines } from "./triage";
import type { ChatAnswer, IntentId } from "./types";

/**
 * Rule-based question answering for the product chat (sprint T-04, guards from T-05).
 * Runs entirely on the device: no network, no storage, no generated text. Every reply is
 * a pre-written answer from knowledge.ts.
 *
 * Order of decisions, first match wins:
 *   1. emergency triage            -> fixed emergency message
 *   2. health or cure claim        -> fixed non-claim answer
 *   3. medication, pregnancy, own condition -> refer to a health professional;
 *      swallowing difficulty (a safety exclusion) -> the consult answer
 *   4. best keyword score at or above MIN_SCORE -> that topic
 *   5. otherwise                   -> "not sure" with topic chips (never a guess)
 *
 * The interface is `answer(input, ctx)`. A semantic search could replace step 4 later
 * without touching the UI.
 */

export const MAX_INPUT = 300;

export type ReplyReason = "triage" | "claim" | "medical" | "match" | "unknown" | "empty";

/** Language-independent result of reading a message; render it with renderReply(). */
export interface ReplyRef {
  reason: ReplyReason;
  intent: IntentId;
  module?: ModuleId;
}

export interface ChatReply extends ChatAnswer {
  reason: ReplyReason;
  module?: ModuleId;
}

export interface ChatContext {
  /** The cup the user scanned, if any. A cup named in the message wins over it. */
  module?: ModuleId;
}

// ---- compiled data ---------------------------------------------------------------------

const claimSingle = compile(CLAIM_SINGLE);
const claimPairs = CLAIM_PAIRS.map(([a, b]) => [compile(a), compile(b)] as const);
const medicalSingle = compile(MEDICAL_SINGLE);
const swallowing = compile(SWALLOWING_SINGLE);
const disease = compile(DISEASE_TERMS);
const personal = compile(PERSONAL_MARKERS);
const education = compile(EDUCATION_TERMS);
const scored = MATCH_ORDER.map((id) => ({
  id,
  terms: (INTENT_TERMS[id] ?? []).map(([t, w]) => ({ tokens: tokenize(t), weight: w })),
}));

// ---- steps -----------------------------------------------------------------------------

const isClaim = (tokens: string[]) =>
  hasAny(tokens, claimSingle) || claimPairs.some(([a, b]) => hasAny(tokens, a) && hasAny(tokens, b));

const isMedical = (tokens: string[]) =>
  hasAny(tokens, medicalSingle) || (hasAny(tokens, disease) && hasAny(tokens, personal) && !hasAny(tokens, education));

const isSwallowing = (tokens: string[]) => hasAny(tokens, swallowing);

/** "L-CUP", "LCUP" or "module L": the one cup the message is about, if exactly one. */
function mentionedModule(tokens: string[]): ModuleId | undefined {
  const found = new Set<ModuleId>();
  const id = (t: string) => (t === "s" || t === "m" || t === "l" ? (t.toUpperCase() as ModuleId) : undefined);
  tokens.forEach((t, i) => {
    if (t === "scup" || t === "mcup" || t === "lcup") found.add(t[0].toUpperCase() as ModuleId);
    const next = tokens[i + 1];
    const m = id(t);
    if (m && next === "cup") found.add(m);
    if ((t === "modul" || t === "module") && next && id(next)) found.add(id(next)!);
  });
  return found.size === 1 ? [...found][0] : undefined;
}

function bestIntent(tokens: string[]): IntentId | null {
  let best: IntentId | null = null;
  let bestScore = 0;
  for (const { id, terms } of scored) {
    const score = terms.reduce((sum, t) => sum + (hasTerm(tokens, t.tokens) ? t.weight : 0), 0);
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return bestScore >= MIN_SCORE ? best : null;
}

/** Read a message. Language-independent: the same ref renders in Indonesian or English. */
export function classify(input: string, ctx: ChatContext = {}): ReplyRef {
  const text = input.slice(0, MAX_INPUT);
  const tokens = tokenize(text);
  const cup = mentionedModule(tokens) ?? ctx.module;

  if (tokens.length === 0) return { reason: "empty", intent: "unknown", module: cup };
  if (triage(text).length > 0) return { reason: "triage", intent: "heart.emergency" };
  if (isClaim(tokens)) return { reason: "claim", intent: "claims.health", module: cup };
  if (isMedical(tokens)) return { reason: "medical", intent: "out.of.scope", module: cup };
  if (isSwallowing(tokens)) return { reason: "medical", intent: "who.consult", module: cup };

  const intent = bestIntent(tokens);
  return intent ? { reason: "match", intent, module: cup } : { reason: "unknown", intent: "unknown", module: cup };
}

/** A quick-reply chip: the topic is already known, so there is nothing to match. */
export const chipRef = (intent: IntentId, ctx: ChatContext = {}): ReplyRef => ({
  reason: "match",
  intent,
  module: ctx.module,
});

export function renderReply(ref: ReplyRef, lang: Lang): ChatReply {
  if (ref.reason === "triage") {
    // Fixed message, no follow-up chips: nothing about products or food next to an emergency.
    const status = renderAnswer("heart.emergency", lang).status;
    return { intent: "heart.emergency", lines: triageLines(lang), followUps: [], status, reason: "triage" };
  }
  return { ...renderAnswer(ref.intent, lang, { module: ref.module }), reason: ref.reason, module: ref.module };
}

export function answer(input: string, lang: Lang, ctx: ChatContext = {}): ChatReply {
  return renderReply(classify(input, ctx), lang);
}
