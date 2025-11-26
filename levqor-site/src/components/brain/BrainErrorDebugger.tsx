"use client";

import { useState, useCallback } from "react";
import { useLevqorBrainOptional } from "./LevqorBrainContext";
import { useLanguageStore } from "@/stores/languageStore";

interface ErrorAnalysis {
  error_type: string;
  severity: string;
  root_cause: string;
  suggested_fixes: string[];
  related_docs: string[];
  auto_fix_available: boolean;
}

interface DebugResponse {
  analysis: ErrorAnalysis;
  explanation: string;
  workflow_context?: {
    step_id: string;
    step_name: string;
    step_type: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function BrainErrorDebugger() {
  const brain = useLevqorBrainOptional();
  const { displayLanguage } = useLanguageStore();
  
  const [errorLog, setErrorLog] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const handleDebug = useCallback(async () => {
    if (!errorLog.trim()) {
      setError("Please paste an error message or log");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setFixResult(null);
    brain?.setNeural?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/debug_error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_log: errorLog.trim(),
          workflow_id: workflowId.trim() || undefined,
          language: displayLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze error");
      }

      const data = await response.json();
      setResult(data);
      
      if (data.analysis.auto_fix_available) {
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
  }, [errorLog, workflowId, displayLanguage, brain]);

  const handleAutoFix = useCallback(async () => {
    if (!result?.analysis.auto_fix_available) return;

    setFixing(true);
    setError(null);
    brain?.setQuantum?.();

    try {
      const response = await fetch(`${API_BASE}/api/ai/brain/auto_fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_type: result.analysis.error_type,
          workflow_id: workflowId.trim() || undefined,
          suggested_fix: result.analysis.suggested_fixes[0],
          language: displayLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply fix");
      }

      const data = await response.json();
      setFixResult(data.message || "Fix applied successfully");
      brain?.setSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply fix");
      brain?.setError?.();
    } finally {
      setFixing(false);
    }
  }, [result, workflowId, displayLanguage, brain]);

  const handleReset = useCallback(() => {
    setErrorLog("");
    setWorkflowId("");
    setResult(null);
    setFixResult(null);
    setError(null);
    brain?.setOrganic?.();
  }, [brain]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-red-400 bg-red-500/20";
      case "high": return "text-orange-400 bg-orange-500/20";
      case "medium": return "text-yellow-400 bg-yellow-500/20";
      default: return "text-blue-400 bg-blue-500/20";
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Levqor Brain Error Debugger</h3>
          <p className="text-sm text-slate-400">Paste an error and let Brain analyze it</p>
        </div>
      </div>

      {!fixResult && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Error Message or Log
            </label>
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste your error message, stack trace, or log here..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none font-mono text-sm"
              rows={5}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Workflow ID (optional)
            </label>
            <input
              type="text"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              placeholder="e.g., wf_123abc"
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleDebug}
            disabled={loading || !errorLog.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing error...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Debug with Levqor Brain</span>
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

      {result && !fixResult && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-white">Error Analysis</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(result.analysis.severity)}`}>
                {result.analysis.severity.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-400">Type:</span>
                <span className="ml-2 text-white">{result.analysis.error_type}</span>
              </div>
              <div>
                <span className="text-sm text-slate-400">Root Cause:</span>
                <p className="mt-1 text-white text-sm">{result.analysis.root_cause}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/30 rounded-lg">
            <h5 className="text-sm font-medium text-slate-300 mb-3">Suggested Fixes:</h5>
            <ul className="space-y-2">
              {result.analysis.suggested_fixes.map((fix, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-slate-300">{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.analysis.auto_fix_available && (
            <button
              onClick={handleAutoFix}
              disabled={fixing}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {fixing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Applying fix...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Apply Auto-Fix</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
          >
            Debug Another Error
          </button>
        </div>
      )}

      {fixResult && (
        <div className="mt-6">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-green-400">{fixResult}</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
          >
            Debug Another Error
          </button>
        </div>
      )}
    </div>
  );
}
