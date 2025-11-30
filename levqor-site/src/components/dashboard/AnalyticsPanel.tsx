"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiBase } from "@/lib/api-config";

interface AnalyticsData {
  workflows_count: number;
  runs_last_7d: number;
  runs_last_30d: number;
  failure_rate: number;
  avg_steps_per_workflow: number;
}

const API_BASE = getApiBase();

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/analytics/overview`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setAnalytics({
        workflows_count: 0,
        runs_last_7d: 0,
        runs_last_30d: 0,
        failure_rate: 0,
        avg_steps_per_workflow: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Workflows",
      value: analytics?.workflows_count ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Runs (7 days)",
      value: analytics?.runs_last_7d ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Runs (30 days)",
      value: analytics?.runs_last_30d ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      label: "Failure Rate",
      value: `${((analytics?.failure_rate ?? 0) * 100).toFixed(1)}%`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: (analytics?.failure_rate ?? 0) > 0.1 ? "text-red-400" : "text-green-400",
      bgColor: (analytics?.failure_rate ?? 0) > 0.1 ? "bg-red-500/10" : "bg-green-500/10"
    }
  ];

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Workflow Analytics</h3>
          <p className="text-sm text-slate-400">Performance overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-lg ${stat.bgColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={stat.color}>{stat.icon}</span>
              <span className="text-sm text-slate-400">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {analytics && analytics.avg_steps_per_workflow > 0 && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <p className="text-sm text-slate-400">
            Average steps per workflow: <span className="text-white font-medium">{analytics.avg_steps_per_workflow.toFixed(1)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
