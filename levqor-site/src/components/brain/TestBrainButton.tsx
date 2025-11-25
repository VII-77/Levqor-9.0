"use client";

import { useCallback, useRef, useState } from "react";
import { useLevqorBrainOptional } from "./LevqorBrainContext";
import { computeNextBrainState, getDefaultState } from "./brainStateMachine";
import type { BrainState } from "./types";

const STATE_SEQUENCE: BrainState[] = ["organic", "neural", "quantum", "success", "error", "organic"];
const STATE_LABELS: Record<BrainState, string> = {
  organic: "Calm",
  neural: "Thinking",
  quantum: "Processing",
  success: "Success",
  error: "Error",
};

export default function TestBrainButton() {
  const brain = useLevqorBrainOptional();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runSequence = useCallback(() => {
    if (!brain || isRunning) return;

    setIsRunning(true);
    let index = 0;

    const cycleNext = () => {
      if (index >= STATE_SEQUENCE.length) {
        setIsRunning(false);
        setCurrentIndex(0);
        return;
      }

      const nextState = computeNextBrainState({
        currentState: brain.state,
        uiEvent: "test_cycle",
      });
      brain.setState(nextState);
      setCurrentIndex(index);
      index++;

      timeoutRef.current = setTimeout(cycleNext, 800);
    };

    cycleNext();
  }, [brain, isRunning]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRunning(false);
    setCurrentIndex(0);
    if (brain) {
      brain.setState(getDefaultState());
    }
  }, [brain]);

  if (!brain) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
      <span className="text-xs text-yellow-700 font-medium">Dev:</span>
      <button
        onClick={isRunning ? cleanup : runSequence}
        disabled={false}
        className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
          isRunning
            ? "bg-yellow-500 text-white hover:bg-yellow-600"
            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        }`}
      >
        {isRunning ? `${STATE_LABELS[STATE_SEQUENCE[currentIndex]]}...` : "Test Brain"}
      </button>
      {isRunning && (
        <button
          onClick={cleanup}
          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Stop
        </button>
      )}
    </div>
  );
}
