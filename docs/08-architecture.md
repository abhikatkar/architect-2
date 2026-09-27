# 08. Architecture

**This document is what this demo actually is.** The architecture being proposed for the product is a
separate document, [ARCHITECTURE.md](ARCHITECTURE.md): sandboxing, the agent harness, the proxy, model
agnosticism, GitHub, deploy and scaling, with the decision, the tech and the evidence behind each one. It
carries its own diagram, and a table saying which of its seven parts this demo implements.

## Diagrams

Four interactive diagrams, generated from the JSON sources in [architecture/](architecture/) and served
from `/architecture/` on the running app, each on a page that links back to the demo and to the index.
Three of them describe this demo. The first describes the proposal, and says so on its face.

Opening a generated file directly, from `public/architecture/`, gives the diagram with no way back: its bytes
are fixed by a delivery receipt (D42), so a link cannot be added inside it without making that receipt false.
The frame around it carries the links instead, which is why every reference here points at the route.

Start at **[/architecture](../app/architecture/page.tsx)** on the running app, which links to all four and
back to the demo, and which serves a generated still below 640px rather than sending a phone to a canvas
built for a desktop.

| Diagram | What it answers | Source |
|---|---|---|
| [Proposed production architecture](../app/architecture/[slug]/page.tsx) at `/architecture/proposed-architecture` | How the product would run in production: the seven parts of [ARCHITECTURE.md](ARCHITECTURE.md) and the trust boundaries between them. The only diagram here describing something that is not built. Exported for the submission form as a [PNG](architecture/exports/proposed-architecture.png) and a [PDF](architecture/exports/proposed-architecture.pdf) | [proposed-architecture.json](architecture/proposed-architecture.json) |
| [System architecture](../app/architecture/[slug]/page.tsx) at `/architecture/architecture` | What runs, what is staged, and where the trust boundaries are. Every node is marked Real or Simulated, and 22 source links are verified against the commit the diagram was generated from | [architecture.json](architecture/architecture.json) |
| [Agent workflow](../app/architecture/[slug]/page.tsx) at `/architecture/agent-workflow` | The four Northwind agents in order, each labeled with the kind of model it runs on and why | [agent-workflow.json](architecture/agent-workflow.json) |
| [Jev call sequence](../app/architecture/[slug]/page.tsx) at `/architecture/jev-call-sequence` | One "Test this agent" call end to end: the rate limit checked first, the Gateway call, the log write, and the recorded fallback | [jev-call-sequence.json](architecture/jev-call-sequence.json) |

The architecture diagram is source backed: it pins a commit and every source link is verified against the
blob at that commit when the diagram is built, so a link cannot drift to a line that does not exist. See
[D42](07-decision-log.md) for what that means for keeping them honest.

## Current stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16.3.6, App Router, React 19 | Server components keep the auth check on the server, so no protected page ships a client-side guard that can be bypassed |
| Language | TypeScript, strict | The repo is a work sample. Type errors in a reviewer's terminal cost more than the typing does |
| Styling | Tailwind v4 | Design tokens land in one config file, which is what [design/design-system.md](design/design-system.md) will own |
| Auth and data | Supabase, via `@supabase/ssr` | Google sign-in and Postgres in one service. See [D1](07-decision-log.md) |
| Hosting | Vercel | Zero-config for this stack, and preview deploys per branch |

The reasoning for choosing this over Lyzr's own Python and MongoDB stack is [D1](07-decision-log.md).
In short, the rubric ranks working functionality last, so build days spent on backend parity earn nothing.

## How a request flows

`proxy.ts` runs on every request that is not a static asset. Next 16 renamed the `middleware` file
convention to `proxy`, and the old name now emits a deprecation warning, so this repo uses the new one
([D8](07-decision-log.md)).

1. `proxy.ts` calls `updateSession` in [lib/supabase/session.ts](../lib/supabase/session.ts).
2. If Supabase credentials are absent, the request is treated as signed out. Protected paths redirect,
   everything else passes through. Missing configuration denies access rather than granting it.
3. Otherwise the Supabase client reads the request cookies and calls `getUser()`, which refreshes the
   access token when it is close to expiry and writes the new cookies onto the response.
4. Any path at or below `/app` with no user redirects to `/login?next=<original path>`, so the user
   lands back where they were aiming after signing in.

Nothing may be inserted between creating the server client and calling `getUser()`. An `await` in
between drops the refreshed cookie, and sessions then expire at unpredictable times.

## Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | Placeholder home, replaced once the design system lands |
| `/login` | Dynamic | Reads `error` and `next` from the query string, renders the Google button |
| `/auth/callback` | Dynamic | Exchanges the OAuth code for a session, then redirects to `next` |
| `/auth/signout` | Dynamic | POST only, clears the session, responds 303 to `/` |
| `/app` | Dynamic | Protected. Currently shows the signed-in email |

## Auth specifics

- Sessions are cookie based, not `localStorage`, so server components can read them.
- The callback only accepts relative redirect targets. An absolute `next` value falls back to `/app`,
  which stops the callback being used as an open redirect.
- On Vercel the callback prefers the `x-forwarded-host` header over the request origin, because the
  deployment sits behind a proxy.
- `/app` re-checks the user server side even though the proxy already guarded it. The page stays correct
  on its own if the proxy matcher is ever narrowed.
- Environment variables are read inside each client factory, never at module scope, so a build with no
  `.env.local` cannot fail on a missing variable.

## Verified and not verified

Verified locally: production build, `tsc --noEmit`, ESLint, and the route guard. Signed out, `/app`
returns `307` with `location: /login?next=%2Fapp`, and nested paths behave the same.

Not yet verified: a real Google sign-in, which needs a live Supabase project with the Google provider
configured. Until that runs, [README.md](../README.md) reports auth as planned, not functional.

## Mapping to Lyzr's agent backend

Answered in [ARCHITECTURE.md](ARCHITECTURE.md) rather than here, because the answer turned out to be an
architecture rather than a mapping table: the harness and the agent services are Python, the agent runtime
is Lyzr's own, and MongoDB keeps the agents, runs and project documents while a metering store holds what
the cost estimates are computed from. See "Fits Lyzr's current stack" in that document, and
[D1](07-decision-log.md) for why this demo does not run on that stack.
