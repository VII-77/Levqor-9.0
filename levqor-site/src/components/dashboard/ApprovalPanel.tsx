"use client";

import { useState, useEffect, useCallback } from "react";

interface ApprovalAction {
  id: string;
  action_type: string;
  payload: Record<string, unknown>;
  reason: string;
  impact_level: string;
  status: string;
  created_at: number;
}

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function ApprovalPanel() {
  const [actions, setActions] = useState<ApprovalAction[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/approvals`);
      if (!response.ok) throw new Error("Failed to fetch approvals");
      
      const data = await response.json();
      setActions(data.actions || []);
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 30000);
    return () => clearInterval(interval);
  }, [fetchApprovals]);

  const handleApprove = async (actionId: string) => {
    setProcessing(actionId);
    try {
      const response = await fetch(`${API_BASE}/api/approvals/${actionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Failed to approve");
      
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (actionId: string) => {
    setProcessing(actionId);
    try {
      const response = await fetch(`${API_BASE}/api/approvals/${actionId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) throw new Error("Failed to reject");
      
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      create_workflow: "Create Workflow",
      enable_schedule: "Enable Schedule",
      send_emails: "Send Emails",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Approval Queue</h3>
            <p className="text-sm text-slate-400">Actions requiring your approval</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
            {stats.pending} pending
          </span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
            {stats.approved} approved
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {actions.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className="p-4 bg-slate-900/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {getActionTypeLabel(action.action_type)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      action.impact_level === "C" ? "bg-red-500/20 text-red-400" :
                      action.impact_level === "B" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      Class {action.impact_level}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">{action.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(action.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(action.id)}
                    disabled={processing === action.id}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {processing === action.id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(action.id)}
                    disabled={processing === action.id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {processing === action.id ? "..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
