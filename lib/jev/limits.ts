/**
 * The documented cost ceiling, in its own module.
 *
 * lib/jev/index.ts is server-only and pulls in the AI SDK and the Supabase
 * client, so a static page that only wants to state the limits cannot import
 * it. These live here instead, and both the runtime and the terms page read
 * the same two numbers rather than keeping their own copies. See D38.
 */
export const RATE_LIMIT_PER_IP_PER_HOUR = 10;
export const DAILY_CALL_CAP = 300;
