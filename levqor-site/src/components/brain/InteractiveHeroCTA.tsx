"use client";

import { Link } from "@/i18n/routing";
import { useCallback, useRef } from "react";
import { useLevqorBrainOptional } from "./LevqorBrainContext";
import { computeNextBrainState, getTransientDuration } from "./brainStateMachine";

interface InteractiveHeroCTAProps {
  primaryHref: string;
  primaryText: string;
  secondaryHref: string;
  secondaryText: string;
  className?: string;
}

export default function InteractiveHeroCTA({
  primaryHref,
  primaryText,
  secondaryHref,
  secondaryText,
  className = "",
}: InteractiveHeroCTAProps) {
  const brain = useLevqorBrainOptional();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrimaryHover = useCallback(() => {
    if (brain) {
      const nextState = computeNextBrainState({
        currentState: brain.state,
        uiEvent: "hover_primary_cta",
      });
      brain.setState(nextState);
    }
  }, [brain]);

  const handlePrimaryLeave = useCallback(() => {
    if (brain) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const nextState = computeNextBrainState({
        currentState: brain.state,
        uiEvent: "idle",
      });
      brain.setState(nextState);
    }
  }, [brain]);

  const handlePrimaryClick = useCallback(() => {
    if (brain) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const nextState = computeNextBrainState({
        currentState: brain.state,
        uiEvent: "click_primary_cta",
      });
      brain.setState(nextState);
      const duration = getTransientDuration(nextState);
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          brain.setOrganic();
        }, duration);
      }
    }
  }, [brain]);

  const handleSecondaryHover = useCallback(() => {
    if (brain) {
      const nextState = computeNextBrainState({
        currentState: brain.state,
        uiEvent: "hover_secondary_cta",
      });
      brain.setState(nextState);
    }
  }, [brain]);

  const handleSecondaryLeave = useCallback(() => {
    if (brain) {
      const nextState = computeNextBrainState({
        currentState: brain.state,
        uiEvent: "idle",
      });
      brain.setState(nextState);
    }
  }, [brain]);

  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${className}`}>
      <Link
        href={primaryHref}
        className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        onMouseEnter={handlePrimaryHover}
        onMouseLeave={handlePrimaryLeave}
        onClick={handlePrimaryClick}
        onFocus={handlePrimaryHover}
        onBlur={handlePrimaryLeave}
      >
        {primaryText}
        <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
      <Link
        href={secondaryHref}
        className="group px-8 py-4 border-2 border-neutral-800 text-neutral-900 rounded-xl font-semibold hover:bg-neutral-800 hover:text-white transition-all text-lg"
        onMouseEnter={handleSecondaryHover}
        onMouseLeave={handleSecondaryLeave}
        onFocus={handleSecondaryHover}
        onBlur={handleSecondaryLeave}
      >
        {secondaryText}
      </Link>
    </div>
  );
}
