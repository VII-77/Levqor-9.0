'use client';

import { useEffect, useState } from 'react';

type IntelligenceData = {
  status?: string;
  timestamp?: string;
  health?: {
    anomalies?: Array<{
      event: string;
      value: number;
      mean: number;
      timestamp: string;
    }>;
    recent_actions?: Array<{
      action: string;
      issue: string;
      success: boolean;
      timestamp: string;
    }>;
  };
  decisions?: Array<{
    type: string;
    priority: string;
    message: string;
    metric: string;
  }>;
  forecasts?: {
    revenue?: {
      predicted_revenue: number;
      daily_average: number;
      confidence: string;
      forecast_days: number;
    };
    churn?: {
      churn_rate: number;
      churned_users: number;
      active_users: number;
      total_users: number;
    };
    partner_health?: {
      health_score: number;
      total_partners: number;
      verified_partners: number;
      total_listings: number;
    };
  };
  risk?: {
    score: number;
    level: string;
    factors: string[];
  };
  scaling?: {
    current?: {
      latency_ms: number;
      queue_length: number;
      scaling_action: string | null;
    };
    history?: Array<{
      action: string;
      reason: string;
      timestamp: string;
    }>;
  };
};

export default function IntelligencePage() {
  const [data, setData] = useState<IntelligenceData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/intelligence/status');
      if (!response.ok) throw new Error('Failed to fetch intelligence data');
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error loading data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🧠 Intelligence Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Risk Score"
          value={data.risk?.score !== undefined ? `${data.risk.score}/100` : 'N/A'}
          subtitle={data.risk?.level || 'N/A'}
          color={
            data.risk?.score !== undefined
              ? data.risk.score >= 80
                ? 'green'
                : data.risk.score >= 60
                ? 'yellow'
                : 'red'
              : 'gray'
          }
        />
        <MetricCard
          title="Revenue Forecast (30d)"
          value={
            data.forecasts?.revenue?.predicted_revenue !== undefined
              ? `$${data.forecasts.revenue.predicted_revenue.toFixed(2)}`
              : 'N/A'
          }
          subtitle={data.forecasts?.revenue?.confidence || 'N/A'}
          color="blue"
        />
        <MetricCard
          title="Partner Health"
          value={
            data.forecasts?.partner_health?.health_score !== undefined
              ? `${data.forecasts.partner_health.health_score}/100`
              : 'N/A'
          }
          subtitle={`${data.forecasts?.partner_health?.total_partners || 0} partners`}
          color="purple"
        />
      </div>

      <Section title="🚨 System Health">
        {data.health?.anomalies && data.health.anomalies.length > 0 ? (
          <div className="space-y-2">
            {data.health.anomalies.map((anomaly, idx) => (
              <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{anomaly.event}</span>
                  <span className="text-sm text-gray-600">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  Current: {anomaly.value.toFixed(0)} | Average: {anomaly.mean.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">✅ No anomalies detected - system healthy</p>
        )}
      </Section>

      <Section title="🔧 Self-Healing Actions">
        {data.health?.recent_actions && data.health.recent_actions.length > 0 ? (
          <div className="space-y-2">
            {data.health.recent_actions.slice(0, 5).map((action, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3 ${
                  action.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {action.success ? '✅' : '❌'} {action.action}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(action.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">Issue: {action.issue}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent self-healing actions</p>
        )}
      </Section>

      <Section title="💡 AI Recommendations">
        {data.decisions && data.decisions.length > 0 ? (
          <div className="space-y-2">
            {data.decisions.map((rec, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-3 ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm uppercase">{rec.priority} Priority</span>
                  <span className="text-xs text-gray-500">{rec.type}</span>
                </div>
                <p className="mt-2 text-gray-800">{rec.message}</p>
                <p className="text-sm text-gray-600 mt-1">{rec.metric}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">✅ No recommendations - system optimized</p>
        )}
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="📊 Forecasts">
          {data.forecasts?.revenue && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">Revenue (30 days)</h4>
              <p className="text-2xl font-bold text-green-600">
                ${data.forecasts.revenue.predicted_revenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Daily avg: ${data.forecasts.revenue.daily_average.toFixed(2)} |{' '}
                {data.forecasts.revenue.confidence} confidence
              </p>
            </div>
          )}
          {data.forecasts?.churn && (
            <div>
              <h4 className="font-semibold text-gray-700">Churn Rate</h4>
              <p className="text-2xl font-bold text-orange-600">
                {data.forecasts.churn.churn_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">
                {data.forecasts.churn.active_users} active / {data.forecasts.churn.total_users}{' '}
                total
              </p>
            </div>
          )}
        </Section>

        <Section title="⚙️ Scaling">
          {data.scaling?.current && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Latency</span>
                <span className="font-mono">{data.scaling.current.latency_ms}ms</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Queue Length</span>
                <span className="font-mono">{data.scaling.current.queue_length}</span>
              </div>
              {data.scaling.current.scaling_action && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-800">
                    🔄 Action: {data.scaling.current.scaling_action}
                  </p>
                </div>
              )}
            </div>
          )}
        </Section>
      </div>

      {data.risk && data.risk.factors && data.risk.factors.length > 0 && (
        <Section title="⚠️ Risk Factors">
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {data.risk.factors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-2xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-75">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-sm opacity-75 mt-1">{subtitle}</p>
    </div>
  );
}
