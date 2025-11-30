"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useLevqorBrainOptional } from "./LevqorBrainContext";
import { getApiBase } from "@/lib/api-config";

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  next_step_ids: string[];
}

interface ProposedWorkflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

interface BuilderResponse {
  proposed_workflow: ProposedWorkflow;
  explanation: string;
  impact_level: string;
  impact_name: string;
  requires_approval: boolean;
}

const API_BASE = getApiBase();

export default function HomepageBrainDemo() {
  const brain = useLevqorBrainOptional();
  const t = useTranslations('brain');
  const locale = useLocale();
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuilderResponse | null>(null);
  
  const examplePrompts = [
    t('example1'),
    t('example2'),
    t('example3'),
  ];

  const handleBuild = useCallback(async () => {
    if (!goal.trim()) {
      setError(t('emptyError') || "Please describe what you want to automate");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    brain?.setNeural?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/build_workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          language: locale ||"en",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to build workflow");
      }

      const data = await response.json();
      setResult(data);
      brain?.setSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      brain?.setError?.();
    } finally {
      setLoading(false);
    }
  }, [goal, brain, locale, t]);

  const handleExampleClick = (example: string) => {
    setGoal(example);
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setGoal("");
    setResult(null);
    setError(null);
    brain?.setOrganic?.();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-neutral-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">{t('title')}</h3>
          <p className="text-sm text-neutral-500">{t('subtitle')}</p>
        </div>
      </div>

      {!result ? (
        <>
          <div className="relative mb-4">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleBuild();
                }
              }}
              placeholder={t('placeholder')}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none transition-all"
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {examplePrompts.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>

          <button
            onClick={handleBuild}
            disabled={loading || !goal.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('thinking')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{t('generate')}</span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-success-50 to-primary-50 rounded-xl border border-success-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-success-700">{t('success')}</span>
            </div>
            <h4 className="font-semibold text-neutral-900 mb-1">{result.proposed_workflow.name}</h4>
            <p className="text-sm text-neutral-600 mb-3">{result.proposed_workflow.description}</p>
            
            <div className="space-y-2">
              {result.proposed_workflow.steps.slice(0, 4).map((step, index) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-neutral-700">{step.name}</span>
                  <span className="text-neutral-400 text-xs">({step.type})</span>
                </div>
              ))}
              {result.proposed_workflow.steps.length > 4 && (
                <p className="text-xs text-neutral-500 pl-7">+{result.proposed_workflow.steps.length - 4} more steps</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="/signin"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium rounded-xl transition-all text-center shadow-lg"
            >
              {t('signupCta')}
            </a>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-all"
            >
              {t('tryAnother')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
