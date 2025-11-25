"use client";

import { useState, useEffect, useCallback } from "react";

interface Segment {
  name: string;
  count: number;
  description: string;
}

interface PendingCampaign {
  id: string;
  segment: string;
  action: string;
  template: string;
  priority: string;
  created_at: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const segmentIcons: Record<string, string> = {
  new_signups: "🆕",
  active_trials: "🔄",
  inactive_users: "💤",
  churned: "📤",
  power_users: "⚡"
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700"
};

export default function MarketingPanel({ className = "" }: { className?: string }) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const segmentData: Segment[] = [
        { name: "new_signups", count: 0, description: "Users signed up in last 7 days" },
        { name: "active_trials", count: 0, description: "Users currently in trial period" },
        { name: "inactive_users", count: 0, description: "Users with no activity in 14 days" }
      ];

      try {
        const res = await fetch(`${API_BASE}/api/marketing/segments`);
        if (res.ok) {
          const data = await res.json();
          if (data.segments) {
            setSegments(data.segments);
          } else {
            setSegments(segmentData);
          }
          setLastRunTime(data.last_run || null);
        } else {
          setSegments(segmentData);
        }
      } catch {
        setSegments(segmentData);
      }

      try {
        const res = await fetch(`${API_BASE}/api/approvals?action_type=marketing_campaign`);
        if (res.ok) {
          const data = await res.json();
          const marketingActions = (data.actions || []).filter(
            (a: { action_type?: string }) => a.action_type === "marketing_campaign"
          );
          setCampaigns(marketingActions);
        }
      } catch {
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitCampaign = async (campaignId: string) => {
    setSubmitting(campaignId);
    try {
      const res = await fetch(`${API_BASE}/api/approvals/${campaignId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      }
    } catch (err) {
      console.error("Failed to approve campaign:", err);
    } finally {
      setSubmitting(null);
    }
  };

  const handleRejectCampaign = async (campaignId: string) => {
    setSubmitting(campaignId);
    try {
      const res = await fetch(`${API_BASE}/api/approvals/${campaignId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      }
    } catch (err) {
      console.error("Failed to reject campaign:", err);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Marketing Engine</h3>
              <p className="text-sm text-gray-500">
                {lastRunTime ? `Last run: ${new Date(lastRunTime).toLocaleString()}` : "View segments and campaigns"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 border-b">
        <h4 className="text-sm font-medium text-gray-700 mb-3">User Segments</h4>
        <div className="grid grid-cols-3 gap-3">
          {segments.map((segment) => (
            <div key={segment.name} className="bg-gray-50 rounded-lg p-3 text-center">
              <span className="text-2xl">{segmentIcons[segment.name] || "👥"}</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{segment.count}</p>
              <p className="text-xs text-gray-500 capitalize">{segment.name.replace("_", " ")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Pending Campaigns (Class C)
          {campaigns.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
              {campaigns.length}
            </span>
          )}
        </h4>

        {campaigns.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            <p>No pending marketing campaigns</p>
            <p className="text-xs mt-1">
              Run <code className="bg-gray-100 px-1">auto_marketing_cycle.py</code> to generate suggestions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[campaign.priority] || "bg-gray-100 text-gray-700"}`}>
                      {campaign.priority}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {segmentIcons[campaign.segment]} {campaign.segment}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">{campaign.action}</p>
                <p className="text-xs text-gray-500 mt-1">Template: {campaign.template}</p>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleSubmitCampaign(campaign.id)}
                    disabled={submitting === campaign.id}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting === campaign.id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleRejectCampaign(campaign.id)}
                    disabled={submitting === campaign.id}
                    className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
