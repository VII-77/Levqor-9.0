"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/lib/api-config";

interface ExecutiveSummary {
  health_score: number;
  status: string;
  sections: {
    telemetry: { error_count: number; error_rate: number; slow_count: number };
    upgrade_plans: { open_plans: number; high_priority_open: number; top_open_plans: Array<{ title: string; priority: number; category: string }> };
    healing: { summary: { total_suggested_actions: number } };
    heartbeat: { status: string; uptime_seconds: number };
  };
}

interface CEOSummary {
  overall: { health_score: number; status: string };
  priority_matrix: {
    critical: Array<{ title: string; impact: number; category: string }>;
    high: Array<{ title: string; impact: number; category: string }>;
    moderate: Array<{ title: string; impact: number; category: string }>;
  };
  strategy: {
    reliability_actions: Array<{ title: string; reason: string; impact_score: number }>;
    revenue_actions: Array<{ title: string; reason: string; impact_score: number }>;
    ux_actions: Array<{ title: string; reason: string; impact_score: number }>;
  };
  predictions: {
    next_7d: { expected_leads: number; expected_dfy_requests: number };
    confidence: number;
  };
  revenue_snapshot: {
    leads_7d: number;
    dfy_7d: number;
  };
}

interface RevenueSummary {
  leads: {
    last_7_days: number;
    last_30_days: number;
  };
  dfy_requests: {
    last_7_days: number;
    last_30_days: number;
  };
  safe_mode: boolean;
}

interface Props {
  userEmail: string;
}

export default function BrainDashboard({ userEmail }: Props) {
  const [executive, setExecutive] = useState<ExecutiveSummary | null>(null);
  const [ceo, setCeo] = useState<CEOSummary | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [askResult, setAskResult] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const API_URL = getApiBase();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [execRes, ceoRes, revRes] = await Promise.all([
          fetch(`${API_URL}/api/guardian/executive-summary`, { cache: "no-store" }),
          fetch(`${API_URL}/api/guardian/ceo-summary`, { cache: "no-store" }),
          fetch(`${API_URL}/api/guardian/revenue/summary`, { cache: "no-store" })
        ]);

        if (execRes.ok) setExecutive(await execRes.json());
        if (ceoRes.ok) setCeo(await ceoRes.json());
        if (revRes.ok) setRevenue(await revRes.json());
      } catch (err) {
        console.error("Brain fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [API_URL]);

  useEffect(() => {
    if (searchParams.get("action") === "ask" && ceo) {
      generateAskResult();
    }
  }, [searchParams, ceo]);

  function generateAskResult() {
    if (!ceo) return;
    
    const actions: string[] = [];
    
    ceo.priority_matrix.critical?.forEach((a) => {
      actions.push(`[CRITICAL] ${a.title} - Impact: ${a.impact}/10`);
    });
    ceo.priority_matrix.high?.forEach((a) => {
      actions.push(`[HIGH] ${a.title} - Impact: ${a.impact}/10`);
    });
    ceo.strategy.reliability_actions?.slice(0, 2).forEach((a) => {
      actions.push(`[Reliability] ${a.title}: ${a.reason}`);
    });
    ceo.strategy.revenue_actions?.slice(0, 2).forEach((a) => {
      actions.push(`[Revenue] ${a.title}: ${a.reason}`);
    });

    if (actions.length === 0) {
      actions.push("All systems are healthy. Focus on acquiring new leads or expanding your template library.");
    }

    setAskResult(actions.join("\n\n"));
  }

  const healthScore = executive?.health_score ?? ceo?.overall?.health_score ?? 0;
  const healthStatus = executive?.status ?? ceo?.overall?.status ?? "unknown";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-40 bg-gray-200 rounded-lg" />
            <div className="h-40 bg-gray-200 rounded-lg" />
            <div className="h-40 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Brain</h1>
          <p className="text-gray-600">AI-powered insights and strategic recommendations</p>
        </div>
        <button
          onClick={generateAskResult}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What should I do next?
        </button>
      </div>

      {askResult && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Brain Recommendations</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-white/50 rounded p-3">
                {askResult}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div id="health" className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Health Score</h3>
            <div className={`w-3 h-3 rounded-full ${
              healthScore >= 80 ? "bg-green-500" : 
              healthScore >= 60 ? "bg-yellow-500" : "bg-red-500"
            }`} />
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{healthScore}/100</div>
          <div className={`text-sm font-medium ${
            healthStatus === "healthy" ? "text-green-600" : 
            healthStatus === "degraded" ? "text-yellow-600" : "text-red-600"
          }`}>
            {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Errors (1h)</span>
              <span className="font-medium text-gray-900">{executive?.sections?.telemetry?.error_count ?? 0}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Slow requests</span>
              <span className="font-medium text-gray-900">{executive?.sections?.telemetry?.slow_count ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue (7d)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Leads</span>
              <span className="text-2xl font-bold text-gray-900">{revenue?.leads?.last_7_days ?? ceo?.revenue_snapshot?.leads_7d ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">DFY Requests</span>
              <span className="text-2xl font-bold text-gray-900">{revenue?.dfy_requests?.last_7_days ?? ceo?.revenue_snapshot?.dfy_7d ?? 0}</span>
            </div>
          </div>
          <Link
            href={`/${locale}/revenue`}
            className="block mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Revenue Dashboard &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Predictions (7d)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expected Leads</span>
              <span className="text-2xl font-bold text-blue-600">{ceo?.predictions?.next_7d?.expected_leads ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expected DFY</span>
              <span className="text-2xl font-bold text-purple-600">{ceo?.predictions?.next_7d?.expected_dfy_requests ?? 0}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Confidence:</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${(ceo?.predictions?.confidence ?? 0) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {Math.round((ceo?.predictions?.confidence ?? 0) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Priority Matrix</h3>
          <div className="space-y-3">
            {(ceo?.priority_matrix?.critical?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Critical</h4>
                {ceo?.priority_matrix.critical.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm py-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="flex-1">{item.title}</span>
                    <span className="text-xs text-gray-500">Impact: {item.impact}</span>
                  </div>
                ))}
              </div>
            )}
            {(ceo?.priority_matrix?.high?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">High Priority</h4>
                {ceo?.priority_matrix.high.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm py-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="flex-1">{item.title}</span>
                    <span className="text-xs text-gray-500">Impact: {item.impact}</span>
                  </div>
                ))}
              </div>
            )}
            {(ceo?.priority_matrix?.moderate?.length ?? 0) > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-2">Moderate</h4>
                {ceo?.priority_matrix.moderate.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm py-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="flex-1">{item.title}</span>
                    <span className="text-xs text-gray-500">Impact: {item.impact}</span>
                  </div>
                ))}
              </div>
            )}
            {(ceo?.priority_matrix?.critical?.length ?? 0) === 0 && 
             (ceo?.priority_matrix?.high?.length ?? 0) === 0 && 
             (ceo?.priority_matrix?.moderate?.length ?? 0) === 0 && (
              <p className="text-gray-500 text-sm">No priority items. System is running smoothly.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upgrade Plans</h3>
          <div className="space-y-3">
            {executive?.sections?.upgrade_plans?.top_open_plans?.map((plan, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                      plan.priority === 1 ? "bg-red-100 text-red-700" : 
                      plan.priority === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      P{plan.priority}
                    </span>
                    <p className="text-sm text-gray-900 mt-1">{plan.title}</p>
                  </div>
                  <span className="text-xs text-gray-500">{plan.category}</span>
                </div>
              </div>
            ))}
            {(executive?.sections?.upgrade_plans?.top_open_plans?.length ?? 0) === 0 && (
              <p className="text-gray-500 text-sm">No open upgrade plans.</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">Open plans</span>
            <span className="font-medium text-gray-900">{executive?.sections?.upgrade_plans?.open_plans ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Stress-Test Simulation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on current telemetry, here's what would happen if your traffic increased 10x:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {((executive?.sections?.telemetry?.error_rate ?? 0) * 10).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Projected error rate</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {(executive?.sections?.telemetry?.slow_count ?? 0) * 5}+
            </div>
            <div className="text-sm text-gray-600">Slow requests expected</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {executive?.sections?.upgrade_plans?.high_priority_open ?? 0}
            </div>
            <div className="text-sm text-gray-600">Bottlenecks to address</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          This is a simulation based on current metrics. Results may vary under real load conditions.
        </p>
      </div>
    </div>
  );
}
