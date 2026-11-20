import { checkSafety } from "./safety";
import { pickModule, pickReasons, scoreModules } from "./scoring";
import type { Recommendation, ScreeningInput } from "./types";

export * from "./types";
export { checkSafety, checkSafetyAnswers, computeBmi, SAFETY_LIMITS } from "./safety";
export { scoreModules, THRESHOLDS } from "./scoring";
export {
  renderRecommendation,
  DISCLAIMER,
  EMERGENCY_CALL,
  MODULE_NAME,
  EXCLUSION_TEXT,
  REASON_TEXT,
  NOTICE_TEXT,
  MODULE_HEADLINE,
  CONSULT_HEADLINE,
  NONE_HEADLINE,
  NONE_BODY,
} from "./templates";

/**
 * Entry point. Pure and synchronous: nothing leaves the device.
 * Replace the body of `recommend` to plug in a trained model later; keep the
 * safety layer in front of it.
 */
export function recommend(input: ScreeningInput): Recommendation {
  const safety = checkSafety(input); // consent + exclusions
  if (!safety.ok) return { kind: "consult", exclusions: safety.exclusions };

  const detail = scoreModules(input);
  const picked = pickModule(detail.scores);
  if (picked === null) return { kind: "none", scores: detail.scores, tier: detail.tier, notices: detail.notices };
  return {
    kind: "module",
    module: picked,
    scores: detail.scores,
    reasons: pickReasons(detail, picked),
    notices: detail.notices,
    tier: detail.tier,
  };
}
