'use client'

import { useEffect, useState } from 'react'
import { getApiBase } from '@/lib/api-config'

interface ActivitySummary {
  workflow_runs: number
  errors: number
  approvals: number
  logins: number
  signups: number
}

interface ActivityEvent {
  type: string
  message: string
  timestamp: string
}

interface ActivityData {
  events: ActivityEvent[]
  summary: ActivitySummary
  range: string
  hourly_distribution: Array<{ hour: number; count: number }>
  timestamp: string
}

export default function AdminActivityPage() {
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('24h')

  useEffect(() => {
    fetchActivity()
  }, [range])

  async function fetchActivity() {
    setLoading(true)
    try {
      const apiBase = getApiBase()
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const res = await fetch(`${apiBase}/api/admin/activity?range=${range}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err)
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">System Activity</h1>
          <p className="text-slate-400 mt-1">Events, errors, and usage patterns (READ-ONLY)</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                range === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard title="Workflow Runs" value={data?.summary.workflow_runs ?? 0} icon="⚡" />
        <SummaryCard title="Errors" value={data?.summary.errors ?? 0} icon="⚠️" />
        <SummaryCard title="Approvals" value={data?.summary.approvals ?? 0} icon="✅" />
        <SummaryCard title="Logins" value={data?.summary.logins ?? 0} icon="🔐" />
        <SummaryCard title="Signups" value={data?.summary.signups ?? 0} icon="👤" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Hourly Activity Heatmap
          </h2>
          <div className="grid grid-cols-12 gap-1">
            {(data?.hourly_distribution || Array(24).fill({ hour: 0, count: 0 })).map((item, idx) => {
              const intensity = item.count > 0 ? Math.min(item.count / 10, 1) : 0
              return (
                <div
                  key={idx}
                  className="aspect-square rounded flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: intensity > 0 
                      ? `rgba(59, 130, 246, ${intensity})` 
                      : 'rgb(30, 41, 59)'
                  }}
                  title={`Hour ${idx}: ${item.count} events`}
                >
                  {idx}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📈</span> Activity Breakdown
          </h2>
          <div className="space-y-4">
            <ActivityBar label="Workflow Runs" value={data?.summary.workflow_runs ?? 0} max={100} color="blue" />
            <ActivityBar label="Errors" value={data?.summary.errors ?? 0} max={50} color="red" />
            <ActivityBar label="Approvals" value={data?.summary.approvals ?? 0} max={20} color="green" />
            <ActivityBar label="Signups" value={data?.summary.signups ?? 0} max={50} color="purple" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📋</span> Recent Events
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data?.events && data.events.length > 0 ? (
            data.events.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                <EventIcon type={event.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate">{event.message}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8">No recent events</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-slate-400 text-sm">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
    </div>
  )
}

function ActivityBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color as keyof typeof colors]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function EventIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    autopilot: '🛡️',
    workflow: '⚡',
    error: '⚠️',
    login: '🔐',
    signup: '👤',
  }
  
  return (
    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
      <span>{icons[type] || '📋'}</span>
    </div>
  )
}
