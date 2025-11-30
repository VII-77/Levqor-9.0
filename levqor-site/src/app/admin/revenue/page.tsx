'use client'

import { useEffect, useState } from 'react'
import { getApiBase } from '@/lib/api-config'

interface RevenueData {
  mrr: number
  arr: number
  arpu: number
  active_subscriptions: number
  trial_count: number
  churn_rate: number
  revenue_trend: Array<{ date: string; amount: number }>
  currency: string
  timestamp: string
}

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    fetchRevenue()
  }, [range])

  async function fetchRevenue() {
    setLoading(true)
    try {
      const apiBase = getApiBase()
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const res = await fetch(`${apiBase}/api/admin/revenue?range=${range}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (res.ok) {
        setRevenue(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch revenue:', err)
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
          <h1 className="text-2xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-slate-400 mt-1">Financial metrics and subscription data (READ-ONLY)</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((r) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RevenueCard
          title="Monthly Recurring Revenue"
          value={`£${(revenue?.mrr ?? 0).toFixed(2)}`}
          icon="💷"
          color="green"
        />
        <RevenueCard
          title="Annual Recurring Revenue"
          value={`£${(revenue?.arr ?? 0).toFixed(2)}`}
          icon="📈"
          color="blue"
        />
        <RevenueCard
          title="Avg Revenue Per User"
          value={`£${(revenue?.arpu ?? 0).toFixed(2)}`}
          icon="👤"
          color="purple"
        />
        <RevenueCard
          title="Churn Rate"
          value={`${((revenue?.churn_rate ?? 0) * 100).toFixed(1)}%`}
          icon="📉"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Subscriptions
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold">Active Subscriptions</div>
                <div className="text-slate-400 text-sm">Paying customers</div>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {revenue?.active_subscriptions ?? 0}
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-white font-semibold">Active Trials</div>
                <div className="text-slate-400 text-sm">7-day trial period</div>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {revenue?.trial_count ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💰</span> Revenue Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Currency</span>
              <span className="text-white">{revenue?.currency || 'GBP'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Data Range</span>
              <span className="text-white">{range.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Last Updated</span>
              <span className="text-slate-300 text-sm">
                {revenue?.timestamp ? new Date(revenue.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📈</span> Revenue Trend
        </h2>
        <div className="h-64 flex items-center justify-center text-slate-500">
          {revenue?.revenue_trend && revenue.revenue_trend.length > 0 ? (
            <div className="w-full">
              {revenue.revenue_trend.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <span className="text-slate-400 w-24">{point.date}</span>
                  <div className="flex-1 bg-slate-800 rounded h-4">
                    <div 
                      className="bg-blue-500 rounded h-4"
                      style={{ width: `${Math.min((point.amount / (revenue.mrr || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white w-20 text-right">£{point.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Revenue trend data will appear as subscriptions are processed</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>Note:</strong> All data shown is READ-ONLY. Revenue modifications, refunds, and billing adjustments require Stripe Dashboard access and founder approval.
        </p>
      </div>
    </div>
  )
}

function RevenueCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colorClasses = {
    green: 'bg-green-500/10 border-green-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
  }
  
  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-slate-400 text-sm">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}
