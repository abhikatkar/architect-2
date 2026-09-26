import type {
  DomainRecord,
  Member,
  PublishSettings,
  RepoTarget,
} from "./types";

/**
 * Domain, publish and access for the Deploy tab, and the repo targets for the
 * GitHub consent sheet.
 *
 * Every default here is the answer to something the teardown found:
 *
 * - **Private, and it says so.** The modal that created a repo without anyone
 *   pressing Push never showed whether the repo was public or private.
 * - **Marketplace off.** Publishing defaulted to on, and people using the app
 *   spend the owner's credits.
 * - **Admin by invite.** Admin access could only be granted through a server
 *   environment variable, which is not a thing the person who owns the app can
 *   reach.
 *
 * Simulated, like everything downstream of a project (D16). Nothing here
 * creates a repo, verifies a domain, sends an invite or deploys anything.
 */

/** Both are fictional, like every other name in the demo. */
export const DOMAINS: DomainRecord[] = [
  {
    host: "northwind-helpline.architect.app",
    kind: "default",
    state: "live",
    detail: "Given to every project. Cannot be removed.",
  },
  {
    host: "helpline.northwind.example",
    kind: "custom",
    state: "needs dns",
    detail: "Add a CNAME to northwind-helpline.architect.app, then verify.",
  },
];

export const PUBLISH: PublishSettings = {
  // Off, and the note beside it says who pays if it is turned on.
  marketplace: false,
  visibility: "private",
  listing: "Northwind Helpline, a billing support agent",
};

/**
 * Owner and collaborator are the two people already named in the demo, so the
 * access list is the same cast as the rest of the story rather than new names.
 */
export const MEMBERS: Member[] = [
  {
    name: "Maya Rao",
    email: "maya@northwindcloud.example",
    role: "owner",
    state: "active",
  },
  {
    name: "Dev Iyer",
    email: "dev@northwindcloud.example",
    role: "editor",
    state: "active",
  },
  {
    name: "Sam Okonkwo",
    email: "sam@northwindcloud.example",
    role: "admin",
    state: "invited",
  },
];

export const ROLES: { id: Member["role"]; label: string; can: string }[] = [
  { id: "owner", label: "Owner", can: "Everything, including billing and deleting the app" },
  { id: "admin", label: "Admin", can: "Open the admin dashboard and manage access" },
  { id: "editor", label: "Editor", can: "Change agents and deploy to preview" },
  { id: "viewer", label: "Viewer", can: "Read the app and its runs" },
];

/** What the consent sheet can connect to. */
export const REPO_TARGETS: RepoTarget[] = [
  {
    id: "new",
    name: "northwind-helpline",
    kind: "new",
    detail: "Creates the repository under your account",
  },
  {
    id: "existing",
    name: "northwind/helpline-app",
    kind: "existing",
    detail: "Pushes to a repository you already own",
  },
];

/**
 * What a connected repo shows afterwards, in both directions.
 *
 * The two-way claim is the one the teardown found broken: GitHub was push only,
 * and the repo was connected without consent. Showing both directions is how
 * the claim is made checkable rather than asserted.
 */
export const SYNC_LOG: {
  direction: "in" | "out";
  sha: string;
  message: string;
  ago: string;
}[] = [
  { direction: "in", sha: "3f21a0c", message: "Tidy the invoice helper, from your editor", ago: "20 min ago" },
  { direction: "out", sha: "a41c9e2", message: "Add escalation reason to dashboard", ago: "2 days ago" },
  { direction: "in", sha: "9d4e7b1", message: "Rename a test file, from your editor", ago: "3 days ago" },
];
