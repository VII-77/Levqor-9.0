export type BrainState = "organic" | "neural" | "quantum" | "success" | "error";

export interface BrainStateConfig {
  state: BrainState;
  label: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const BRAIN_STATE_CONFIGS: Record<BrainState, BrainStateConfig> = {
  organic: {
    state: "organic",
    label: "Organic",
    description: "Calm, breathing state - the Brain at rest",
    colors: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      accent: "#93c5fd",
    },
  },
  neural: {
    state: "neural",
    label: "Neural",
    description: "Reasoning state - the Brain is thinking",
    colors: {
      primary: "#9333ea",
      secondary: "#a855f7",
      accent: "#c084fc",
    },
  },
  quantum: {
    state: "quantum",
    label: "Quantum",
    description: "Creative state - the Brain is generating",
    colors: {
      primary: "#06b6d4",
      secondary: "#22d3ee",
      accent: "#67e8f9",
    },
  },
  success: {
    state: "success",
    label: "Success",
    description: "Completion state - the Brain succeeded",
    colors: {
      primary: "#22c55e",
      secondary: "#4ade80",
      accent: "#86efac",
    },
  },
  error: {
    state: "error",
    label: "Error",
    description: "Alert state - the Brain encountered an issue",
    colors: {
      primary: "#ef4444",
      secondary: "#f87171",
      accent: "#fca5a5",
    },
  },
};
