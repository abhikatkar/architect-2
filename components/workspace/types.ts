export const LAYERS = ["plan", "agents", "app", "data", "code", "deploy"] as const;
export type Layer = (typeof LAYERS)[number];

export const LAYER_LABELS: Record<Layer, string> = {
  plan: "Plan",
  agents: "Agents",
  app: "App",
  data: "Data",
  code: "Code",
  deploy: "Deploy",
};

export type Pane = "chat" | "canvas";

export function parseLayer(value: string | string[] | undefined): Layer {
  const v = Array.isArray(value) ? value[0] : value;
  return LAYERS.includes(v as Layer) ? (v as Layer) : "plan";
}

export function parsePane(value: string | string[] | undefined): Pane {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "canvas" ? "canvas" : "chat";
}
