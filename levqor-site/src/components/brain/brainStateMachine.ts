import type { BrainState } from "./types";

export type BrainUIEvent =
  | "idle"
  | "hover_primary_cta"
  | "click_primary_cta"
  | "hover_secondary_cta"
  | "dashboard_action_start"
  | "dashboard_action_success"
  | "dashboard_action_error"
  | "test_cycle";

const STATE_ORDER: BrainState[] = ["organic", "neural", "quantum", "success", "error"];

export function computeNextBrainState(params: {
  currentState: BrainState;
  uiEvent: BrainUIEvent;
  intensity?: number;
}): BrainState {
  const { currentState, uiEvent, intensity = 0 } = params;

  switch (uiEvent) {
    case "idle":
      return "organic";

    case "hover_primary_cta":
      return "neural";

    case "click_primary_cta":
      return "success";

    case "hover_secondary_cta":
      return "quantum";

    case "dashboard_action_start":
      return "neural";

    case "dashboard_action_success":
      return "success";

    case "dashboard_action_error":
      return "error";

    case "test_cycle": {
      const currentIndex = STATE_ORDER.indexOf(currentState);
      const nextIndex = (currentIndex + 1) % STATE_ORDER.length;
      return STATE_ORDER[nextIndex];
    }

    default:
      if (intensity > 0.7 && currentState !== "error" && currentState !== "success") {
        return "quantum";
      }
      return currentState;
  }
}

export function getDefaultState(): BrainState {
  return "organic";
}

export function isTransientState(state: BrainState): boolean {
  return state === "success" || state === "error";
}

export function getTransientDuration(state: BrainState): number {
  if (state === "success") return 1500;
  if (state === "error") return 2000;
  return 0;
}
