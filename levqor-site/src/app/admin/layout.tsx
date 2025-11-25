'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/console', label: 'Command Console', icon: '🎮' },
  { href: '/admin/revenue', label: 'Revenue', icon: '💰' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/activity', label: 'Activity', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/signin?callbackUrl=/admin')
      return
    }

    const userEmail = session.user?.email
    const isAdminUser = session.user?.name === 'Admin' || 
                        (userEmail && ADMIN_EMAIL && userEmail === ADMIN_EMAIL)

    if (!isAdminUser) {
      router.push('/dashboard?message=admin_required')
      return
    }

    setIsAdmin(true)
  }, [session, status, router])

  if (status === 'loading' || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 fixed left-0 top-0 pt-16">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                Admin Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">Founder Access Only</p>
            </div>
            
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            
            <div className="mt-8 pt-4 border-t border-slate-800">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 ml-64 pt-16 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
