"use client";
import { useState, useEffect } from "react";

interface AnalyticsData {
  users: {
    total: number;
    new_7d: number;
    new_30d: number;
  };
  referrals: {
    total_7d: number;
    total_30d: number;
    top_sources: Array<{ source: string; count: number }>;
  };
  timestamp: number;
}

export default function AnalyticsWidget() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const adminToken = sessionStorage.getItem("admin_token");
        if (!adminToken) {
          setError("Admin token required");
          setLoading(false);
          return;
        }

        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics`, {
          headers: {
            "Authorization": `Bearer ${adminToken}`
          }
        });

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

        const analytics = await resp.json();
        setData(analytics);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Analytics Error</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Analytics Dashboard</h3>
        <p className="text-purple-100 text-sm mt-1">Real-time growth metrics</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">Total Users</div>
            <div className="text-3xl font-bold text-blue-900">{data.users.total.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-sm font-medium text-green-600 uppercase tracking-wide mb-1">New (7d)</div>
            <div className="text-3xl font-bold text-green-900">+{data.users.new_7d.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-1">New (30d)</div>
            <div className="text-3xl font-bold text-purple-900">+{data.users.new_30d.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="text-sm font-medium text-orange-600 uppercase tracking-wide mb-1">Referrals (7d)</div>
            <div className="text-3xl font-bold text-orange-900">{data.referrals.total_7d.toLocaleString()}</div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Top Referral Sources (30d)
          </h4>
          {data.referrals.top_sources.length > 0 ? (
            <div className="space-y-2">
              {data.referrals.top_sources.slice(0, 5).map((source, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <span className="font-medium text-gray-800">{source.source}</span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{source.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No referral data yet</p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          Last updated: {new Date(data.timestamp * 1000).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
