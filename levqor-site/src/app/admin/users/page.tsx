'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  created_at: string | null
  status: string
  plan: string
  last_seen_at: string | null
}

interface UsersData {
  users: User[]
  total: number
  page: number
  limit: number
  pages: number
}

interface UserDetail {
  id: string
  email: string
  created_at: string | null
  status: string
  plan: string
  last_seen_at: string | null
  has_stripe: boolean
  workflows_count: number
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [planFilter, setPlanFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page, planFilter, statusFilter])

  async function fetchUsers() {
    setLoading(true)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://levqor-backend.replit.app'
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (planFilter) params.set('plan', planFilter)
      if (statusFilter) params.set('status', statusFilter)
      
      const res = await fetch(`${apiBase}/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  async function viewUserDetail(userId: string) {
    setLoadingDetail(true)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://levqor-backend.replit.app'
      const adminToken = localStorage.getItem('admin_token') || ''
      
      const res = await fetch(`${apiBase}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      
      if (res.ok) {
        const result = await res.json()
        setSelectedUser(result.user)
      }
    } catch (err) {
      console.error('Failed to fetch user detail:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">View user accounts and subscription status (READ-ONLY)</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="launch">Launch</option>
          <option value="growth">Growth</option>
          <option value="agency">Agency</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left text-slate-400 text-sm font-medium px-4 py-3">Email</th>
                <th className="text-left text-slate-400 text-sm font-medium px-4 py-3">Plan</th>
                <th className="text-left text-slate-400 text-sm font-medium px-4 py-3">Status</th>
                <th className="text-left text-slate-400 text-sm font-medium px-4 py-3">Created</th>
                <th className="text-left text-slate-400 text-sm font-medium px-4 py-3">Last Seen</th>
                <th className="text-left text-slate-400 text-sm font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : data?.users && data.users.length > 0 ? (
                data.users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-white">{user.email}</td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={user.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewUserDetail(user.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data && data.pages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-800">
            <span className="text-slate-400 text-sm">
              Showing {((page - 1) * (data.limit || 20)) + 1} - {Math.min(page * (data.limit || 20), data.total)} of {data.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            {loadingDetail ? (
              <div className="py-8 text-center text-slate-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                <DetailRow label="Email" value={selectedUser.email} />
                <DetailRow label="Plan" value={<PlanBadge plan={selectedUser.plan} />} />
                <DetailRow label="Status" value={<StatusBadge status={selectedUser.status} />} />
                <DetailRow label="Workflows" value={String(selectedUser.workflows_count)} />
                <DetailRow label="Stripe Connected" value={selectedUser.has_stripe ? 'Yes' : 'No'} />
                <DetailRow label="Created" value={selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'} />
                <DetailRow label="Last Seen" value={selectedUser.last_seen_at ? new Date(selectedUser.last_seen_at).toLocaleDateString() : 'Never'} />
              </div>
            )}
            
            <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-xs">
                This is a read-only view. User modifications are not available from this dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: 'bg-slate-500/20 text-slate-400',
    starter: 'bg-blue-500/20 text-blue-400',
    launch: 'bg-green-500/20 text-green-400',
    growth: 'bg-purple-500/20 text-purple-400',
    agency: 'bg-orange-500/20 text-orange-400',
  }
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[plan.toLowerCase()] || colors.free}`}>
      {plan.toUpperCase()}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    trialing: 'bg-blue-500/20 text-blue-400',
    past_due: 'bg-red-500/20 text-red-400',
    canceled: 'bg-slate-500/20 text-slate-400',
    free: 'bg-slate-500/20 text-slate-400',
  }
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status.toLowerCase()] || colors.free}`}>
      {status.toUpperCase()}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
