'use client'

import { useEffect, useState, useCallback } from 'react'

interface SystemToggles {
  low_cost_mode: boolean
  growth_paused: boolean
  maintenance_mode: boolean
  ai_enabled: boolean
  marketing_autopilot: boolean
}

interface CostMetrics {
  today: number
  yesterday: number
  mtd: number
  budget: number
  spike_detected: boolean
}

interface ApprovalItem {
  id: string
  type: string
  title: string
  impact: string
  timestamp: string
}

interface LogEntry {
  level: string
  message: string
  timestamp: string
  source: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://levqor-backend.replit.app'

export default function AdminPowerPanel() {
  const [toggles, setToggles] = useState<SystemToggles>({
    low_cost_mode: false,
    growth_paused: false,
    maintenance_mode: false,
    ai_enabled: true,
    marketing_autopilot: false
  })
  const [costs, setCosts] = useState<CostMetrics | null>(null)
  const [approvals, setApprovals] = useState<ApprovalItem[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('admin_token') || ''
      const headers = { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }

      const [togglesRes, costsRes, approvalsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/system-toggles`, { headers }).catch(() => null),
        fetch(`${API_BASE}/api/admin/cost-metrics`, { headers }).catch(() => null),
        fetch(`${API_BASE}/api/admin/pending-approvals`, { headers }).catch(() => null),
        fetch(`${API_BASE}/api/admin/recent-logs`, { headers }).catch(() => null)
      ])

      if (togglesRes?.ok) {
        const data = await togglesRes.json()
        setToggles(data.toggles || toggles)
      }
      if (costsRes?.ok) {
        const data = await costsRes.json()
        setCosts(data.costs || null)
      }
      if (approvalsRes?.ok) {
        const data = await approvalsRes.json()
        setApprovals(data.approvals || [])
      }
      if (logsRes?.ok) {
        const data = await logsRes.json()
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Failed to fetch power panel data:', err)
    } finally {
      setLoading(false)
    }
  }, [toggles])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleToggle = async (key: keyof SystemToggles) => {
    setActionLoading(key)
    try {
      const adminToken = localStorage.getItem('admin_token') || ''
      const newValue = !toggles[key]
      
      const res = await fetch(`${API_BASE}/api/admin/toggle`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value: newValue })
      })

      if (res.ok) {
        setToggles(prev => ({ ...prev, [key]: newValue }))
      }
    } catch (err) {
      console.error('Failed to toggle:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(`approval-${id}`)
    try {
      const adminToken = localStorage.getItem('admin_token') || ''
      
      await fetch(`${API_BASE}/api/admin/approval/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })

      setApprovals(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Failed to process approval:', err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          Admin Power Panel
        </h1>
        <p className="text-slate-400 mt-1">V10 System Controls - Real-time toggles, costs, approvals, and logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎚️</span> System Toggles
          </h2>
          <div className="space-y-4">
            <ToggleRow 
              label="Low-Cost Mode" 
              description="Reduce API calls, disable non-essential features"
              checked={toggles.low_cost_mode} 
              onToggle={() => handleToggle('low_cost_mode')}
              loading={actionLoading === 'low_cost_mode'}
              color="yellow"
            />
            <ToggleRow 
              label="Growth Engine Paused" 
              description="Pause autonomous growth activities"
              checked={toggles.growth_paused} 
              onToggle={() => handleToggle('growth_paused')}
              loading={actionLoading === 'growth_paused'}
              color="orange"
            />
            <ToggleRow 
              label="Maintenance Mode" 
              description="Show maintenance page to users"
              checked={toggles.maintenance_mode} 
              onToggle={() => handleToggle('maintenance_mode')}
              loading={actionLoading === 'maintenance_mode'}
              color="red"
            />
            <ToggleRow 
              label="AI Features Enabled" 
              description="Enable Brain AI features"
              checked={toggles.ai_enabled} 
              onToggle={() => handleToggle('ai_enabled')}
              loading={actionLoading === 'ai_enabled'}
              color="purple"
            />
            <ToggleRow 
              label="Marketing Autopilot" 
              description="Auto-generate and queue marketing content"
              checked={toggles.marketing_autopilot} 
              onToggle={() => handleToggle('marketing_autopilot')}
              loading={actionLoading === 'marketing_autopilot'}
              color="blue"
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Cost Monitor
          </h2>
          {costs ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CostBox label="Today" value={costs.today} budget={costs.budget / 30} />
                <CostBox label="Yesterday" value={costs.yesterday} budget={costs.budget / 30} />
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Month-to-Date</span>
                  <span className="text-white font-semibold">${costs.mtd.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      (costs.mtd / costs.budget) > 0.8 ? 'bg-red-500' : 
                      (costs.mtd / costs.budget) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((costs.mtd / costs.budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$0</span>
                  <span>Budget: ${costs.budget}</span>
                </div>
              </div>
              {costs.spike_detected && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-red-400 text-sm">Spike detected! Cost increased 50%+ from yesterday</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">
              Cost data unavailable
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Pending Approvals
            {approvals.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                {approvals.length}
              </span>
            )}
          </h2>
          {approvals.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {approvals.map(item => (
                <div key={item.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {item.type} | Impact: {item.impact}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApproval(item.id, 'approve')}
                        disabled={actionLoading === `approval-${item.id}`}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white text-sm rounded transition-colors"
                      >
                        {actionLoading === `approval-${item.id}` ? '...' : '✓'}
                      </button>
                      <button 
                        onClick={() => handleApproval(item.id, 'reject')}
                        disabled={actionLoading === `approval-${item.id}`}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white text-sm rounded transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">
              No pending approvals
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📜</span> Recent Logs
            <button 
              onClick={fetchData}
              className="ml-auto text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors"
            >
              Refresh
            </button>
          </h2>
          {logs.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 p-2 bg-slate-800/50 rounded">
                  <span className={`flex-shrink-0 px-1.5 py-0.5 rounded ${
                    log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                    log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-600/50 text-slate-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-slate-300 truncate">{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">
              No recent logs
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton 
            icon="🔄" 
            label="Sync All Data" 
            onClick={() => console.log('sync')}
          />
          <QuickActionButton 
            icon="🧹" 
            label="Clear Cache" 
            onClick={() => console.log('clear cache')}
          />
          <QuickActionButton 
            icon="📊" 
            label="Export Report" 
            onClick={() => window.location.href = `${API_BASE}/api/admin/report`}
          />
          <QuickActionButton 
            icon="🔔" 
            label="Test Alerts" 
            onClick={() => console.log('test alerts')}
          />
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ 
  label, 
  description, 
  checked, 
  onToggle, 
  loading,
  color
}: { 
  label: string
  description: string
  checked: boolean
  onToggle: () => void
  loading: boolean
  color: string
}) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? colors[color] || 'bg-blue-500' : 'bg-slate-600'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <span 
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  )
}

function CostBox({ label, value, budget }: { label: string; value: number; budget: number }) {
  const percentage = (value / budget) * 100
  const isHigh = percentage > 80
  
  return (
    <div className={`p-4 rounded-lg ${isHigh ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50'}`}>
      <div className="text-slate-400 text-sm">{label}</div>
      <div className={`text-xl font-bold ${isHigh ? 'text-red-400' : 'text-white'}`}>
        ${value.toFixed(2)}
      </div>
      <div className="text-xs text-slate-500">
        {percentage.toFixed(0)}% of daily budget
      </div>
    </div>
  )
}

function QuickActionButton({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: string
  label: string
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-center"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-slate-300">{label}</div>
    </button>
  )
}
