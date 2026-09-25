import type { JevAgentId, JevAnswer } from "./questions";

/**
 * Stored results, served when the cap is reached or a live call fails.
 *
 * These must be **captured from real calls**. Nothing here may be written by
 * hand to look like a plausible answer, because the screen labels them
 * "Recorded result from <date>" and a fabricated one would be a false claim
 * about something that never ran.
 *
 * `capturedOn: null` means no live call has been recorded yet. The UI says so
 * in those words rather than showing an answer. They get filled by running
 * scripts/capture-jev.mjs once AI_GATEWAY_API_KEY exists.
 */

export type RecordedResult = {
  capturedOn: string | null;
  latencyMs: number | null;
  answers: JevAnswer[];
};

export const RECORDED: Record<JevAgentId, RecordedResult> = {
  intake: { capturedOn: null, latencyMs: null, answers: [] },
  "grounding-checker": { capturedOn: null, latencyMs: null, answers: [] },
  "escalation-router": { capturedOn: null, latencyMs: null, answers: [] },
};

export function hasRecorded(id: JevAgentId) {
  return RECORDED[id].capturedOn !== null && RECORDED[id].answers.length > 0;
}
