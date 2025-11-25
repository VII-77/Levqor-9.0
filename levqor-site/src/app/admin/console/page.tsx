'use client'

import { useEffect, useState } from 'react'

interface HealthData {
  app_up: boolean
  db_ok: boolean
  stripe_ok: boolean
  status: string
  timestamp: number
}

interface AutopilotStatus {
  guardian_active: boolean
  growth_engine_active: boolean
  compliance_active: boolean
  last_health_check: string | null
  pending_approvals: number
}

export default function AdminConsolePage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [autopilot, setAutopilot] = useState<AutopilotStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningCheck, setRunningCheck] = useState(false)
  const [checkOutput, setCheckOutput] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://levqor-backend.replit.app'
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const headers = { 'Authorization': `Bearer ${adminToken}` }
      
      const [healthRes, autopilotRes] = await Promise.all([
        fetch(`${apiBase}/api/health/summary`).catch(() => null),
        fetch(`${apiBase}/api/admin/autopilot-status`, { headers }).catch(() => null)
      ])
      
      if (healthRes?.ok) setHealth(await healthRes.json())
      if (autopilotRes?.ok) {
        const data = await autopilotRes.json()
        setAutopilot(data.autopilot)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
    } finally {
      setLoading(false)
    }
  }

  async function runHealthCheck() {
    setRunningCheck(true)
    setCheckOutput(null)
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://levqor-backend.replit.app'
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const res = await fetch(`${apiBase}/api/admin/health-check`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setCheckOutput(data.output || 'Health check completed')
        fetchStatus()
      } else {
        setCheckOutput('Health check failed')
      }
    } catch (err) {
      setCheckOutput('Error running health check')
    } finally {
      setRunningCheck(false)
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
        <h1 className="text-2xl font-bold text-white">Founder Command Console</h1>
        <p className="text-slate-400 mt-1">System controls and monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏥</span> Health Summary
          </h2>
          <div className="space-y-3">
            <HealthRow label="Application" ok={health?.app_up ?? false} />
            <HealthRow label="Database" ok={health?.db_ok ?? false} />
            <HealthRow label="Stripe" ok={health?.stripe_ok ?? false} />
            <div className="pt-2 border-t border-slate-800 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Overall Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  health?.status === 'healthy' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {health?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🛡️</span> Guardian-Autopilot Mode
          </h2>
          <div className="space-y-3">
            <ModuleRow name="Guardian Monitor" active={autopilot?.guardian_active ?? false} />
            <ModuleRow name="Growth Engine" active={autopilot?.growth_engine_active ?? false} />
            <ModuleRow name="Compliance Monitor" active={autopilot?.compliance_active ?? false} />
            <div className="pt-2 border-t border-slate-800 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pending Approvals</span>
                <span className="text-white font-semibold">{autopilot?.pending_approvals ?? 0}</span>
              </div>
              {autopilot?.last_health_check && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-400">Last Check</span>
                  <span className="text-slate-300 text-sm">{autopilot.last_health_check}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🎮</span> Safe Controls
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          These controls trigger read-only operations. No destructive actions will be performed.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runHealthCheck}
            disabled={runningCheck}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {runningCheck ? (
              <>
                <span className="animate-spin">⏳</span>
                Running...
              </>
            ) : (
              <>
                <span>🔍</span>
                Run Full Health Check
              </>
            )}
          </button>
          
          <button
            onClick={fetchStatus}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh Status
          </button>
          
          <a
            href="/api/admin/report"
            download
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📥</span>
            Download System Report
          </a>
        </div>
      </div>

      {checkOutput && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Health Check Output
          </h2>
          <pre className="bg-slate-950 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap">
            {checkOutput}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
          <span>⚠️</span> Actions Requiring Approval
        </h3>
        <p className="text-slate-400 text-sm">
          The following actions are gated and require explicit founder approval:
        </p>
        <ul className="text-slate-400 text-sm mt-2 list-disc list-inside">
          <li>Pricing changes</li>
          <li>Email campaigns to full userbase</li>
          <li>Database migrations</li>
          <li>Production redeploys</li>
          <li>Legal/compliance updates</li>
        </ul>
      </div>
    </div>
  )
}

function HealthRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={`flex items-center gap-2 ${ok ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {ok ? 'OK' : 'DOWN'}
      </span>
    </div>
  )
}

function ModuleRow({ name, active }: { name: string; active: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{name}</span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
      }`}>
        {active ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </div>
  )
}
