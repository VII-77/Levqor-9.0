"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import type { BrainState } from "./types";

export type LevqorBrainState = BrainState;

interface LevqorBrainContextValue {
  state: LevqorBrainState;
  setState: (next: LevqorBrainState) => void;
  setOrganic: () => void;
  setNeural: () => void;
  setQuantum: () => void;
  setSuccess: () => void;
  setError: () => void;
}

const LevqorBrainContext = createContext<LevqorBrainContextValue | null>(null);

interface LevqorBrainProviderProps {
  children: ReactNode;
  initialState?: LevqorBrainState;
}

export function LevqorBrainProvider({
  children,
  initialState = "organic",
}: LevqorBrainProviderProps) {
  const [state, setStateInternal] = useState<LevqorBrainState>(initialState);

  const setState = useCallback((next: LevqorBrainState) => {
    setStateInternal(next);
  }, []);

  const setOrganic = useCallback(() => setStateInternal("organic"), []);
  const setNeural = useCallback(() => setStateInternal("neural"), []);
  const setQuantum = useCallback(() => setStateInternal("quantum"), []);
  const setSuccess = useCallback(() => setStateInternal("success"), []);
  const setError = useCallback(() => setStateInternal("error"), []);

  const value = useMemo<LevqorBrainContextValue>(
    () => ({
      state,
      setState,
      setOrganic,
      setNeural,
      setQuantum,
      setSuccess,
      setError,
    }),
    [state, setState, setOrganic, setNeural, setQuantum, setSuccess, setError]
  );

  return (
    <LevqorBrainContext.Provider value={value}>
      {children}
    </LevqorBrainContext.Provider>
  );
}

export function useLevqorBrain(): LevqorBrainContextValue {
  const context = useContext(LevqorBrainContext);
  if (!context) {
    throw new Error("useLevqorBrain must be used within a LevqorBrainProvider");
  }
  return context;
}

export function useLevqorBrainOptional(): LevqorBrainContextValue | null {
  return useContext(LevqorBrainContext);
}

export default LevqorBrainProvider;
