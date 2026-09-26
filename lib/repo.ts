/**
 * Where this repository lives.
 *
 * One constant, because the Code tab links a real commit and the home page
 * links the repo, and two copies of a URL is one copy too many.
 */
export const REPO_URL = "https://github.com/abhikatkar/architect-2";

export const commitUrl = (sha: string) => `${REPO_URL}/commit/${sha}`;
