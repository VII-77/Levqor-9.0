"use client";

import LevqorBrainCanvas from "./LevqorBrainCanvas";
import { useLevqorBrain } from "./LevqorBrainContext";

export default function DashboardBrainCanvas({ className }: { className?: string }) {
  const { state } = useLevqorBrain();
  return (
    <div className={`relative ${className || ""}`}>
      <LevqorBrainCanvas brainState={state} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/20 px-2 py-0.5 rounded">
        Brain: {state.charAt(0).toUpperCase() + state.slice(1)}
      </div>
    </div>
  );
}
