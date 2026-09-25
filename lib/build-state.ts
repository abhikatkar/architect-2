export const BUILD_STATES = ["none", "running", "failed", "done"] as const;
export type BuildState = (typeof BUILD_STATES)[number];

/**
 * Build state is read from the URL on both paths, so a running build, a failed
 * build and a finished one are all linkable and screenshot-able. The signed-in
 * path additionally records it on the project row (D28); the demo writes
 * nothing (D29).
 */
export function parseBuild(value: string | string[] | undefined): BuildState {
  const v = Array.isArray(value) ? value[0] : value;
  return BUILD_STATES.includes(v as BuildState) ? (v as BuildState) : "none";
}
