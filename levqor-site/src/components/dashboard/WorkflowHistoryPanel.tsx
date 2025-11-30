"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiBase } from "@/lib/api-config";

interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: string;
  started_at: number;
  ended_at: number | null;
  error: string | null;
}

const API_BASE = getApiBase();

export default function WorkflowHistoryPanel() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/workflows/runs?limit=10`);
      if (!response.ok) throw new Error("Failed to fetch workflow runs");
      
      const data = await response.json();
      setRuns(data.runs || []);
      setError(null);
    } catch (err) {
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 30000);
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getDuration = (start: number, end: number | null) => {
    if (!end) return "Running...";
    const seconds = Math.round(end - start);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-500/20 text-green-400",
      running: "bg-blue-500/20 text-blue-400",
      failed: "bg-red-500/20 text-red-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      pending_approval: "bg-purple-500/20 text-purple-400",
    };
    return styles[status] || "bg-slate-500/20 text-slate-400";
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Workflow History</h3>
            <p className="text-sm text-slate-400">Recent workflow runs</p>
          </div>
        </div>
        <button
          onClick={fetchRuns}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {runs.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400">No workflow runs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <div
              key={run.id}
              className="p-3 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(run.status)}`}>
                    {run.status}
                  </span>
                  <span className="text-sm text-slate-300 font-mono">
                    {run.workflow_id.slice(0, 8)}...
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {formatDate(run.started_at)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getDuration(run.started_at, run.ended_at)}
                  </p>
                </div>
              </div>
              {run.error && (
                <p className="mt-2 text-xs text-red-400 truncate">{run.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
