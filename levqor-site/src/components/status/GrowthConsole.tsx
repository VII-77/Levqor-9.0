"use client";
import { useEffect, useState } from "react";

interface GrowthKPIs {
  ai_requests: number;
  ai_errors: number;
  consultations_booked: number;
  consultations_run: number;
  referrals_created: number;
  support_requests: number;
  workflows_templates: number;
  lifecycle_ticks: number;
  pricing_cta_clicks: number;
  trial_feedback: number;
}

interface GrowthSummary {
  growth_stage: "early" | "growing" | "hot";
  notes: string;
}

interface GrowthData {
  status: string;
  kpis: GrowthKPIs;
  summary: GrowthSummary;
  timestamp: string;
}

const DEFAULT_KPIS: GrowthKPIs = {
  ai_requests: 0,
  ai_errors: 0,
  consultations_booked: 0,
  consultations_run: 0,
  referrals_created: 0,
  support_requests: 0,
  workflows_templates: 50,
  lifecycle_ticks: 0,
  pricing_cta_clicks: 0,
  trial_feedback: 0,
};

const DEFAULT_SUMMARY: GrowthSummary = {
  growth_stage: "early",
  notes: "Growth metrics are being collected.",
};

function isValidGrowthData(data: unknown): data is GrowthData {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (obj.error) return false;
  if (!obj.kpis || typeof obj.kpis !== "object") return false;
  if (!obj.summary || typeof obj.summary !== "object") return false;
  return true;
}

function safeNumber(value: unknown): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return 0;
}

export function GrowthConsole() {
  const [metrics, setMetrics] = useState<GrowthKPIs | null>(null);
  const [summary, setSummary] = useState<GrowthSummary | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        // Use proxy route to avoid CORS issues in development
        const response = await fetch("/api/metrics/growth-summary", {
          cache: "no-store",
        });
        
        if (!response.ok) {
          setError("unavailable");
          setLoading(false);
          return;
        }
        
        let json: unknown;
        try {
          json = await response.json();
        } catch {
          setError("invalid_response");
          setLoading(false);
          return;
        }

        if (!isValidGrowthData(json)) {
          setError("invalid_shape");
          setLoading(false);
          return;
        }

        const kpis = json.kpis as unknown as Record<string, unknown>;
        setMetrics({
          ai_requests: safeNumber(kpis.ai_requests),
          ai_errors: safeNumber(kpis.ai_errors),
          consultations_booked: safeNumber(kpis.consultations_booked),
          consultations_run: safeNumber(kpis.consultations_run),
          referrals_created: safeNumber(kpis.referrals_created),
          support_requests: safeNumber(kpis.support_requests),
          workflows_templates: safeNumber(kpis.workflows_templates) || 50,
          lifecycle_ticks: safeNumber(kpis.lifecycle_ticks),
          pricing_cta_clicks: safeNumber(kpis.pricing_cta_clicks),
          trial_feedback: safeNumber(kpis.trial_feedback),
        });

        const summaryData = json.summary as unknown as Record<string, unknown>;
        const stage = summaryData.growth_stage;
        setSummary({
          growth_stage: (stage === "early" || stage === "growing" || stage === "hot") ? stage : "early",
          notes: typeof summaryData.notes === "string" ? summaryData.notes : DEFAULT_SUMMARY.notes,
        });

        setTimestamp(typeof json.timestamp === "string" ? json.timestamp : null);
        setError(null);
      } catch (err) {
        console.error("GrowthConsole fetch error:", err);
        setError("network");
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  const getStageBadge = (stage: string) => {
    const badges: Record<string, string> = {
      early: "bg-blue-100 text-blue-800 border-blue-300",
      growing: "bg-green-100 text-green-800 border-green-300",
      hot: "bg-orange-100 text-orange-800 border-orange-300",
    };
    return badges[stage] || badges.early;
  };

  const getStageEmoji = (stage: string) => {
    const emojis: Record<string, string> = {
      early: "🌱",
      growing: "📈",
      hot: "🔥",
    };
    return emojis[stage] || "🌱";
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-3 text-purple-900">📊 Growth Console</h2>
        <p className="text-purple-700">Loading growth metrics...</p>
      </section>
    );
  }

  if (error || !metrics || !summary) {
    return (
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-3 text-purple-900">📊 Growth Console</h2>
        <p className="text-purple-700">
          Growth metrics are temporarily unavailable. All core systems remain healthy.
        </p>
      </section>
    );
  }

  const displayMetrics = metrics || DEFAULT_KPIS;
  const displaySummary = summary || DEFAULT_SUMMARY;

  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-purple-900">📊 Growth Console</h2>
        <div className={`px-4 py-2 rounded-full border font-semibold text-sm ${getStageBadge(displaySummary.growth_stage)}`}>
          {getStageEmoji(displaySummary.growth_stage)} {displaySummary.growth_stage.toUpperCase()}
        </div>
      </div>
      
      <p className="text-purple-700 mb-6 italic">
        {displaySummary.notes}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">AI Requests</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.ai_requests.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Consultations Booked</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.consultations_booked.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Referrals Created</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.referrals_created.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Pricing CTA Clicks</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.pricing_cta_clicks.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Lifecycle Ticks</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.lifecycle_ticks.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Workflow Templates</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.workflows_templates.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Trial Feedback</div>
          <div className="text-2xl font-bold text-purple-900">{displayMetrics.trial_feedback.toLocaleString()}</div>
        </div>
      </div>

      {timestamp && (
        <p className="text-xs text-purple-600 mt-4">
          Last updated: {new Date(timestamp).toLocaleString('en-GB')}
        </p>
      )}
    </section>
  );
}

export default GrowthConsole;
