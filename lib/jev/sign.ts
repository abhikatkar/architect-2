import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signs the Jev result that travels back in the URL.
 *
 * The result is carried as a query parameter so a run is linkable and works
 * before hydration (D19, D25). That also means anyone can type one. Without a
 * signature, a hand-written URL could render a fabricated "Live result", which
 * is exactly the claim the rest of this repo refuses to make.
 *
 * The agent id is inside the signed payload, so a genuine result cannot be
 * moved onto a different agent either.
 *
 * Fails closed: with no JEV_RESULT_SECRET set, nothing verifies and every
 * result renders as unverified. A missing secret must not silently downgrade
 * into "trust everything".
 */

const SIGNATURE_LENGTH = 32;

export function signJevResult(agentId: string, json: string): string {
  const secret = process.env.JEV_RESULT_SECRET ?? "";
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(`${agentId}.${json}`)
    .digest("hex")
    .slice(0, SIGNATURE_LENGTH);
}

export function verifyJevResult(
  agentId: string,
  json: string,
  signature: string,
): boolean {
  if (!process.env.JEV_RESULT_SECRET) return false;
  if (!signature || signature.length !== SIGNATURE_LENGTH) return false;

  const expected = signJevResult(agentId, json);
  if (!expected) return false;

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  // Length is already equal by the check above, which is what timingSafeEqual
  // requires. Compared this way so the check does not leak the signature.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
