"use client";

import { useState, useEffect, useCallback } from "react";

interface HealthData {
  status: "healthy" | "warning" | "degraded" | "critical";
  app_up: boolean;
  db_ok: boolean;
  stripe_ok: boolean;
  error_count_24h: number;
  last_incident_time: string | null;
  timestamp: number;
}

const STATUS_COLORS = {
  healthy: { bg: "bg-green-100", text: "text-green-700", icon: "text-green-500" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "text-yellow-500" },
  degraded: { bg: "bg-orange-100", text: "text-orange-700", icon: "text-orange-500" },
  critical: { bg: "bg-red-100", text: "text-red-700", icon: "text-red-500" }
};

export default function HealthOverview({ className = "" }: { className?: string }) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    const startTime = performance.now();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/health/summary`, {
        cache: "no-store"
      });
      
      if (!res.ok) {
        throw new Error(`Health check failed: ${res.status}`);
      }
      
      const data = await res.json();
      setHealth(data);
      setError(null);
      
      const duration = performance.now() - startTime;
      if (duration > 2000) {
        console.warn(`[Perf] HealthOverview fetch slow: ${duration.toFixed(0)}ms`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch health status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Health status unavailable</span>
        </div>
      </div>
    );
  }

  const colors = STATUS_COLORS[health.status] || STATUS_COLORS.warning;

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">System Health</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatusTile 
          label="App" 
          ok={health.app_up} 
        />
        <StatusTile 
          label="Database" 
          ok={health.db_ok} 
        />
        <StatusTile 
          label="Billing" 
          ok={health.stripe_ok} 
        />
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-500">Errors (24h)</span>
          <span className={`text-xs font-medium ${health.error_count_24h > 10 ? 'text-orange-600' : 'text-gray-700'}`}>
            {health.error_count_24h}
          </span>
        </div>
      </div>

      {health.last_incident_time && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last incident: {new Date(health.last_incident_time).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusTile({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
      <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-medium ml-auto ${ok ? 'text-green-600' : 'text-red-600'}`}>
        {ok ? 'OK' : 'Error'}
      </span>
    </div>
  );
}
