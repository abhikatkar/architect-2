import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // next dev otherwise appends a generated block to CLAUDE.md on every run.
  // That file holds this project's own instructions, and the generated text
  // contains em dashes, which those instructions forbid.
  agentRules: false,
};

export default nextConfig;
