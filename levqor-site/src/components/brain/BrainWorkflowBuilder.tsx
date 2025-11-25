"use client";

import { useState, useCallback } from "react";
import { useLevqorBrainOptional } from "./LevqorBrainContext";

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

interface SubmitResponse {
  status: string;
  workflow_id?: string;
  approval_id?: string;
  message: string;
  impact_level: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function BrainWorkflowBuilder() {
  const brain = useLevqorBrainOptional();
  
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [volume, setVolume] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<BuilderResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);

  const handleBuild = useCallback(async () => {
    if (!goal.trim()) {
      setError("Please describe what you want to automate");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSubmitResult(null);
    
    brain?.setNeural?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/build_workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          context: context.trim(),
          approx_volume: volume.trim(),
          language: "en"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to build workflow");
      }

      const data = await response.json();
      setResult(data);
      
      if (data.requires_approval) {
        brain?.setQuantum?.();
      } else {
        brain?.setSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      brain?.setError?.();
    } finally {
      setLoading(false);
    }
  }, [goal, context, volume, brain]);

  const handleSubmit = useCallback(async () => {
    if (!result?.proposed_workflow) return;

    setSubmitting(true);
    setError(null);
    brain?.setQuantum?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/submit_workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: result.proposed_workflow
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit workflow");
      }

      const data = await response.json();
      setSubmitResult(data);
      
      if (data.status === "created") {
        brain?.setSuccess?.();
      } else {
        brain?.setNeural?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      brain?.setError?.();
    } finally {
      setSubmitting(false);
    }
  }, [result, brain]);

  const handleReset = useCallback(() => {
    setGoal("");
    setContext("");
    setVolume("");
    setResult(null);
    setSubmitResult(null);
    setError(null);
    brain?.setOrganic?.();
  }, [brain]);

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Create with Levqor Brain</h3>
          <p className="text-sm text-slate-400">Describe what you want to automate</p>
        </div>
      </div>

      {!submitResult && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What do you want to automate?
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Send a weekly summary email to my team with key metrics from our CRM"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Context (optional)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Marketing team"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Volume (optional)
              </label>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="e.g., 100 emails/week"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleBuild}
            disabled={loading || !goal.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Levqor Brain is thinking...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Ask Levqor Brain to design workflow</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {result && !submitResult && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{result.proposed_workflow.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                result.impact_level === "C" ? "bg-red-500/20 text-red-400" :
                result.impact_level === "B" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-green-500/20 text-green-400"
              }`}>
                Impact: {result.impact_name}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{result.proposed_workflow.description}</p>
            
            <div className="space-y-2">
              {result.proposed_workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs">
                    {index + 1}
                  </span>
                  <span className="text-slate-300">{step.name || `Step ${index + 1}`}</span>
                  <span className="text-slate-500">({step.type})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900/30 rounded-lg">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap">{result.explanation}</pre>
          </div>

          {result.requires_approval && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                This workflow contains critical operations and requires approval before activation.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{result.requires_approval ? "Submit for Approval" : "Create Workflow"}</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {submitResult && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg border ${
            submitResult.status === "created" 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-blue-500/10 border-blue-500/30"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <svg className={`w-6 h-6 ${submitResult.status === "created" ? "text-green-400" : "text-blue-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-medium ${submitResult.status === "created" ? "text-green-400" : "text-blue-400"}`}>
                {submitResult.message}
              </span>
            </div>
            {submitResult.workflow_id && (
              <p className="text-sm text-slate-400">Workflow ID: {submitResult.workflow_id}</p>
            )}
            {submitResult.approval_id && (
              <p className="text-sm text-slate-400">Approval ID: {submitResult.approval_id}</p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="mt-4 w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
          >
            Create Another Workflow
          </button>
        </div>
      )}
    </div>
  );
}
