/**
 * Switches the owner can flip without touching the engine.
 *
 * heartEducation  true: the "heart signs and complaints" topic gives the general-information
 *                 answer (draft, waiting for dr. Enny's review, team answer A9).
 *                 false: that topic only refers the user to a health professional.
 *
 * The emergency triage (triage.ts) is NOT switchable: it always runs.
 */
export const CHAT_CONFIG: { heartEducation: boolean } = {
  heartEducation: true,
};
