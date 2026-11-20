import type { Lang, ModuleId } from "../recommender/types";

/**
 * Product Q&A knowledge base (sprint T-03). Data only: no matching of user text
 * (T-04) and no emergency detection (T-05). Every answer is pre-written or
 * composed from products.ts / recommender templates, never generated.
 */

export const INTENT_IDS = [
  "about.cuore",
  "brew.how",
  "allergens",
  "caution.l",
  "who.can",
  "who.consult",
  "who.priority",
  "compare.modules",
  "nutrition.estimate",
  "ingredients",
  "claims.health",
  "screening.start",
  "heart.symptoms",
  "heart.emergency",
  "out.of.scope",
  "unknown",
] as const;
export type IntentId = (typeof INTENT_IDS)[number];

/** Where the content comes from, for reviewers. */
export type EntrySource = "product" | "policy" | "who-kemenkes";

/**
 * final        composed from product data, the brief or existing recommender templates.
 * draft        new prose written by the agent (including all heart content, from public
 *              sources), waiting for team and clinician review.
 * pending-data waits for facts the team has not supplied yet (see BREW_DETAILS).
 */
export type EntryStatus = "final" | "draft" | "pending-data";

/** What the chat knows about the current context (for example the scanned cup). */
export interface AnswerContext {
  module?: ModuleId;
}

export interface KnowledgeEntry {
  id: IntentId;
  /** Question shown as a quick-reply chip. */
  chip: Record<Lang, string>;
  /** Modules this entry is meaningful for. */
  moduleScope: "all" | ModuleId[];
  /** Answer paragraphs, one string each. Pure: same input, same output. */
  answer: (lang: Lang, ctx?: AnswerContext) => string[];
  /** Chips offered after this answer. */
  followUps: IntentId[];
  source: EntrySource;
  status: EntryStatus;
}

export interface ChatAnswer {
  intent: IntentId;
  lines: string[];
  followUps: IntentId[];
  status: EntryStatus;
}
