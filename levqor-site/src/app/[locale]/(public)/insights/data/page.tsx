'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface InsightsData {
  period_days: number;
  generated_at: string;
  revenue: {
    total: number;
    mrr: number;
  };
  api_usage: {
    calls: number;
    users: number;
    avg_per_user: number;
  };
  integrity_runs: {
    count: number;
    pass_rate: number;
  };
  uptime_avg: number;
  net_margin_est: number;
}

export default function DataInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [driveLink, setDriveLink] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      const res = await fetch('/api/insights/preview');
      const json = await res.json();
      
      if (json.ok) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to load insights');
      }
    } catch (err) {
      setError('Network error loading insights');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const res = await fetch('/api/insights/report', { method: 'POST' });
      const json = await res.json();
      
      if (json.ok) {
        setDriveLink(json.drive_link || '');
        setData(json.kpis);
      } else {
        setError(json.message || 'Failed to generate report');
      }
    } catch (err) {
      setError('Network error generating report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/insights" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Operational Insights
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Data Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Anonymized metrics and performance data from the Levqor platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Metrics Grid */}
        {data && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={`$${data.revenue.total.toLocaleString()}`}
              subtitle={`Last ${data.period_days} days`}
              icon="💰"
            />
            <MetricCard
              title="Monthly Recurring Revenue"
              value={`$${data.revenue.mrr.toLocaleString()}`}
              subtitle="Current MRR"
              icon="📈"
            />
            <MetricCard
              title="API Calls"
              value={data.api_usage.calls.toLocaleString()}
              subtitle={`${data.api_usage.users} active users`}
              icon="🔌"
            />
            <MetricCard
              title="Average Uptime"
              value={`${data.uptime_avg.toFixed(2)}%`}
              subtitle="System reliability"
              icon="✅"
            />
            <MetricCard
              title="Integrity Runs"
              value={data.integrity_runs.count.toLocaleString()}
              subtitle="Quality checks performed"
              icon="🔍"
            />
            <MetricCard
              title="Net Margin (Est.)"
              value={`$${data.net_margin_est.toLocaleString()}`}
              subtitle="Revenue minus costs"
              icon="💵"
            />
          </div>
        )}

        {/* Report Generation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quarterly Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate a comprehensive PDF report with detailed insights and metrics
          </p>
          
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating Report...' : 'Generate Quarterly PDF'}
          </button>
          
          {driveLink && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                ✅ Report generated successfully!
              </p>
              <a
                href={driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Open Report in Google Drive →
              </a>
            </div>
          )}
        </div>

        {/* Data Transparency Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 Data Transparency
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            All metrics displayed are anonymized and aggregated. No personally identifiable information (PII) is included in these insights. 
            Data is collected from our platform telemetry, Stripe billing, and operational monitoring systems.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</div>
    </div>
  );
}
