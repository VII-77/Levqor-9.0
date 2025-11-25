"use client";

import { useState, useEffect, useCallback } from "react";

interface ReadinessCheck {
  name: string;
  status: "pass" | "fail" | "loading" | "unknown";
  message?: string;
}

interface LaunchReadiness {
  ready: boolean;
  checks: Record<string, boolean>;
  timestamp: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const checkNames: Record<string, string> = {
  health_ok: "System Health",
  templates_exist: "Templates Available",
  workflows_api_ok: "Workflows API",
  brain_api_ok: "Brain Builder API",
  approvals_api_ok: "Approvals API",
  stripe_configured: "Payment System",
  docs_exist: "Documentation"
};

export default function LaunchReadinessPanel({ className = "" }: { className?: string }) {
  const [readiness, setReadiness] = useState<LaunchReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadiness = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/system/launch-readiness`);
      if (!response.ok) {
        throw new Error("Failed to fetch launch readiness");
      }
      const data = await response.json();
      setReadiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check readiness");
      setReadiness({
        ready: false,
        checks: {
          health_ok: false,
          templates_exist: false,
          workflows_api_ok: false,
          brain_api_ok: false,
          approvals_api_ok: false,
          stripe_configured: false,
          docs_exist: false
        },
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  const passCount = readiness ? Object.values(readiness.checks).filter(Boolean).length : 0;
  const totalCount = readiness ? Object.keys(readiness.checks).length : 0;
  const allPassing = readiness?.ready ?? false;

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            allPassing ? "bg-green-100" : "bg-amber-100"
          }`}>
            {allPassing ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Launch Readiness</h3>
            <p className="text-sm text-gray-500">
              {loading ? "Checking..." : `${passCount}/${totalCount} checks passing`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchReadiness}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Refresh checks"
        >
          <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="divide-y">
        {readiness && Object.entries(readiness.checks).map(([key, passing]) => (
          <div key={key} className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">{checkNames[key] || key}</span>
            <span className={`flex items-center gap-1.5 text-sm font-medium ${
              passing ? "text-green-600" : "text-red-600"
            }`}>
              {passing ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pass
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Fail
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className={`p-4 border-t ${allPassing ? "bg-green-50" : "bg-amber-50"}`}>
        <p className={`text-sm font-medium ${allPassing ? "text-green-700" : "text-amber-700"}`}>
          {allPassing 
            ? "All systems ready for launch!" 
            : "Some checks are failing. Review before launch."}
        </p>
      </div>
    </div>
  );
}
