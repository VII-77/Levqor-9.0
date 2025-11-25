"use client";

import { useState, useCallback } from "react";
import type { BrainState } from "./types";
import { BRAIN_STATE_CONFIGS } from "./types";

export interface UseBrainStateReturn {
  state: BrainState;
  setState: (newState: BrainState) => void;
  config: typeof BRAIN_STATE_CONFIGS[BrainState];
  cycleState: () => void;
}

export function useBrainState(initialState: BrainState = "organic"): UseBrainStateReturn {
  const [state, setStateInternal] = useState<BrainState>(initialState);

  const setState = useCallback((newState: BrainState) => {
    setStateInternal(newState);
  }, []);

  const cycleState = useCallback(() => {
    setStateInternal((current) => {
      switch (current) {
        case "organic":
          return "neural";
        case "neural":
          return "quantum";
        case "quantum":
          return "success";
        case "success":
          return "error";
        case "error":
          return "organic";
        default:
          return "organic";
      }
    });
  }, []);

  return {
    state,
    setState,
    config: BRAIN_STATE_CONFIGS[state],
    cycleState,
  };
}

export default useBrainState;
