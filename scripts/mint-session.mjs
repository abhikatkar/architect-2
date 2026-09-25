/*
  Mints real Supabase session cookies for a test user, so the responsive check
  can run against genuinely signed-in screens.

  It signs in through @supabase/ssr, the same library the app uses, and captures
  whatever cookies that library writes. Hand-rolling the cookie format would
  drift from the app the moment the library changed it.

  Usage:
    node scripts/mint-session.mjs               # first test user
    node scripts/mint-session.mjs 2             # second test user

  Prints a JSON array of {name, value}. Credentials come from .env.local and are
  never printed.
*/
import { readFileSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";

function loadEnv(path = ".env.local") {
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv();
const which = process.argv[2] === "2" ? "_2" : "";
const email = env[`TEST_USER${which}_EMAIL`];
const password = env[`TEST_USER${which}_PASSWORD`];

if (!email || !password) {
  console.error(`Missing TEST_USER${which}_EMAIL or TEST_USER${which}_PASSWORD in .env.local`);
  process.exit(1);
}

const jar = new Map();
const supabase = createServerClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  },
);

const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
  console.error("Sign in failed:", error.message);
  process.exit(1);
}

process.stderr.write(`signed in as ${data.user.email} (${data.user.id})\n`);
console.log(JSON.stringify([...jar.entries()].map(([name, value]) => ({ name, value }))));
