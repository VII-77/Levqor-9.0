"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocale } from "next-intl";
import { useLevqorBrainOptional } from "./LevqorBrainContext";

interface WorkflowIssue {
  step_id: string;
  step_name: string;
  issue_type: string;
  description: string;
  fix_suggestion: string;
  can_auto_fix: boolean;
}

interface WorkflowHealth {
  workflow_id: string;
  workflow_name: string;
  health_score: number;
  status: string;
  issues: WorkflowIssue[];
  last_run?: string;
  error_count: number;
}

interface FixResponse {
  success: boolean;
  message: string;
  fixed_issues: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function BrainFixMyWorkflow() {
  const brain = useLevqorBrainOptional();
  const locale = useLocale();
  
  const [workflowId, setWorkflowId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<WorkflowHealth | null>(null);
  const [fixResult, setFixResult] = useState<FixResponse | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!workflowId.trim()) {
      setError("Please enter a workflow ID");
      return;
    }

    setLoading(true);
    setError(null);
    setHealth(null);
    setFixResult(null);
    brain?.setNeural?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/workflow_health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: workflowId.trim(),
          language: locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze workflow");
      }

      const data = await response.json();
      setHealth(data);
      
      if (data.issues.length === 0) {
        brain?.setSuccess?.();
      } else if (data.issues.some((i: WorkflowIssue) => i.issue_type === "critical")) {
        brain?.setError?.();
      } else {
        brain?.setQuantum?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      brain?.setError?.();
    } finally {
      setLoading(false);
    }
  }, [workflowId, locale, brain]);

  const handleFixAll = useCallback(async () => {
    if (!health || health.issues.length === 0) return;

    setFixing(true);
    setError(null);
    brain?.setQuantum?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/fix_workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_id: workflowId.trim(),
          fix_all: true,
          language: locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fix workflow");
      }

      const data = await response.json();
      setFixResult(data);
      
      if (data.success) {
        brain?.setSuccess?.();
      } else {
        brain?.setError?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fix workflow");
      brain?.setError?.();
    } finally {
      setFixing(false);
    }
  }, [health, workflowId, locale, brain]);

  const handleReset = useCallback(() => {
    setWorkflowId("");
    setHealth(null);
    setFixResult(null);
    setError(null);
    brain?.setOrganic?.();
  }, [brain]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const getIssueIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "critical":
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Fix My Workflow</h3>
          <p className="text-sm text-slate-400">Let Brain diagnose and repair your workflow</p>
        </div>
      </div>

      {!fixResult && !health && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Workflow ID
            </label>
            <input
              type="text"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              placeholder="Enter your workflow ID (e.g., wf_abc123)"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !workflowId.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing workflow...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Diagnose Workflow</span>
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

      {health && !fixResult && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-white">{health.workflow_name}</h4>
                <p className="text-sm text-slate-400">ID: {health.workflow_id}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getHealthColor(health.health_score)}`}>
                  {health.health_score}%
                </div>
                <div className="text-xs text-slate-400">Health Score</div>
              </div>
            </div>

            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getHealthBg(health.health_score)} transition-all duration-500`}
                style={{ width: `${health.health_score}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Status:</span>
                <span className={`ml-2 ${health.status === "healthy" ? "text-green-400" : "text-yellow-400"}`}>
                  {health.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Errors (24h):</span>
                <span className={`ml-2 ${health.error_count > 0 ? "text-red-400" : "text-green-400"}`}>
                  {health.error_count}
                </span>
              </div>
            </div>
          </div>

          {health.issues.length > 0 ? (
            <>
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-slate-300">Issues Found:</h5>
                {health.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-900/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start gap-3">
                      {getIssueIcon(issue.issue_type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{issue.step_name}</span>
                          {issue.can_auto_fix && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                              Auto-fixable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{issue.description}</p>
                        <p className="text-sm text-cyan-400 mt-2">
                          <span className="text-slate-500">Fix: </span>
                          {issue.fix_suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFixAll}
                  disabled={fixing}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fixing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fixing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Fix All Issues</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
                >
                  Check Another
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-green-400">
                  No issues found! Your workflow is healthy.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {fixResult && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg border ${
            fixResult.success 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <svg className={`w-6 h-6 ${fixResult.success ? "text-green-400" : "text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-medium ${fixResult.success ? "text-green-400" : "text-red-400"}`}>
                {fixResult.message}
              </span>
            </div>
            {fixResult.fixed_issues > 0 && (
              <p className="text-sm text-slate-400">Fixed {fixResult.fixed_issues} issue(s)</p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="mt-4 w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
          >
            Check Another Workflow
          </button>
        </div>
      )}
    </div>
  );
}
