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

export function GrowthConsole() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.levqor.ai";
        const response = await fetch(`${apiUrl}/api/metrics/growth-summary`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
        setError(false);
      } catch (err) {
        console.error("Failed to fetch growth summary:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-3 text-purple-900">📊 Growth Console</h2>
        <p className="text-purple-700">Loading growth metrics...</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-3 text-purple-900">📊 Growth Console</h2>
        <p className="text-purple-700">
          Growth metrics unavailable right now. All core systems remain healthy.
        </p>
      </section>
    );
  }

  const getStageBadge = (stage: string) => {
    const badges = {
      early: "bg-blue-100 text-blue-800 border-blue-300",
      growing: "bg-green-100 text-green-800 border-green-300",
      hot: "bg-orange-100 text-orange-800 border-orange-300"
    };
    return badges[stage as keyof typeof badges] || badges.early;
  };

  const getStageEmoji = (stage: string) => {
    const emojis = {
      early: "🌱",
      growing: "📈",
      hot: "🔥"
    };
    return emojis[stage as keyof typeof emojis] || "🌱";
  };

  return (
    <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-purple-900">📊 Growth Console</h2>
        <div className={`px-4 py-2 rounded-full border font-semibold text-sm ${getStageBadge(data.summary.growth_stage)}`}>
          {getStageEmoji(data.summary.growth_stage)} {data.summary.growth_stage.toUpperCase()}
        </div>
      </div>
      
      <p className="text-purple-700 mb-6 italic">
        {data.summary.notes}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">AI Requests</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.ai_requests.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Consultations Booked</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.consultations_booked.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Referrals Created</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.referrals_created.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Pricing CTA Clicks</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.pricing_cta_clicks.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Lifecycle Ticks</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.lifecycle_ticks.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Workflow Templates</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.workflows_templates.toLocaleString()}</div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1">Trial Feedback</div>
          <div className="text-2xl font-bold text-purple-900">{data.kpis.trial_feedback.toLocaleString()}</div>
        </div>
      </div>

      <p className="text-xs text-purple-600 mt-4">
        Last updated: {new Date(data.timestamp).toLocaleString('en-GB')}
      </p>
    </section>
  );
}
