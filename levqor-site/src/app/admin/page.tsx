'use client'

import { useEffect, useState } from 'react'

interface AdminSummary {
  total_users: number
  active_users_7d: number
  workflows_count: number
  templates_count: number
  error_rate: number
  health_status: string
  autopilot_status: string
  timestamp: string
}

interface RevenueData {
  mrr: number
  arr: number
  active_subscriptions: number
  trial_count: number
}

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://levqor-backend.replit.app'
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const headers = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
      
      const [summaryRes, revenueRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/summary`, { headers }).catch(() => null),
        fetch(`${apiBase}/api/admin/revenue`, { headers }).catch(() => null)
      ])
      
      if (summaryRes?.ok) {
        setSummary(await summaryRes.json())
      }
      if (revenueRes?.ok) {
        setRevenue(await revenueRes.json())
      }
    } catch (err) {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 mt-1">System health and key metrics at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Users"
          value={summary?.total_users ?? 0}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Active (7d)"
          value={summary?.active_users_7d ?? 0}
          icon="🔥"
          color="green"
        />
        <MetricCard
          title="Workflows"
          value={summary?.workflows_count ?? 0}
          icon="⚡"
          color="purple"
        />
        <MetricCard
          title="Templates"
          value={summary?.templates_count ?? 0}
          icon="📋"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏥</span> System Health
          </h2>
          <div className="space-y-3">
            <StatusRow label="Backend Status" status={summary?.health_status || 'unknown'} />
            <StatusRow label="Autopilot" status={summary?.autopilot_status || 'unknown'} />
            <StatusRow label="Error Rate" status={`${(summary?.error_rate ?? 0).toFixed(1)}%`} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Revenue Snapshot
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">MRR</span>
              <span className="text-white font-semibold">£{revenue?.mrr?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">ARR</span>
              <span className="text-white font-semibold">£{revenue?.arr?.toFixed(2) ?? '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Subscriptions</span>
              <span className="text-white font-semibold">{revenue?.active_subscriptions ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Trials</span>
              <span className="text-white font-semibold">{revenue?.trial_count ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🛡️</span> Guardian-Autopilot Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AutopilotModule name="Guardian Monitor" active={true} />
          <AutopilotModule name="Growth Engine" active={true} />
          <AutopilotModule name="Compliance Monitor" active={true} />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  }
  
  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-sm opacity-80">{title}</div>
    </div>
  )
}

function StatusRow({ label, status }: { label: string; status: string }) {
  const isHealthy = ['healthy', 'active', 'ok'].includes(status.toLowerCase())
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        isHealthy ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
      }`}>
        {status.toUpperCase()}
      </span>
    </div>
  )
}

function AutopilotModule({ name, active }: { name: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
      <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500' : 'bg-slate-500'}`}></div>
      <span className="text-slate-300">{name}</span>
    </div>
  )
}
