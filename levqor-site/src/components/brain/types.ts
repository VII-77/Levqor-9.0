export type BrainState = "organic" | "neural" | "quantum";

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
};
