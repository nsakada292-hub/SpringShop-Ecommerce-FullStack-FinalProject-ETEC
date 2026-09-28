import { useState, useEffect, useMemo } from 'react'
import { Search, Shield, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInitials } from '@/shared/utils/cn'
import { usersApi } from '@/shared/api/users.api'
import type { User } from '@/shared/types'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Badge } from '@/shared/components/ui/Badge'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const PAGE_SIZE = 8

export default function CustomerPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleTarget, setRoleTarget] = useState<User | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await usersApi.getAll()
      setUsers(data)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.id).includes(q)
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const isPromoting = roleTarget?.role === 'USER'

  const confirmRoleChange = async () => {
    if (!roleTarget) return
    setUpdating(true)
    const newRole = roleTarget.role === 'USER' ? 'ADMIN' : 'USER'
    try {
      await usersApi.updateRole(roleTarget.id, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === roleTarget.id ? { ...u, role: newRole } : u))
      )
      toast.success(`${roleTarget.name} is now ${newRole === 'ADMIN' ? 'an admin' : 'a regular user'}`)
      setRoleTarget(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(
        message ??
          'Failed to update role. The backend may not support changing roles. Please check the server configuration.'
      )
      setRoleTarget(null)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Customers</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">View and manage user accounts</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all"
        />
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Customer</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Email</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">ID</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Role</th>
                    <th className="text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((u) => (
                    <tr key={u.id} className="border-b border-surface-200 dark:border-surface-800/50 last:border-0 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-800 text-xs font-bold text-brand-aqua">
                            {getInitials(u.name)}
                          </div>
                          <span className="text-sm font-medium text-surface-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">{u.email}</td>
                      <td className="py-3 px-4 text-sm text-surface-500">#{u.id}</td>
                      <td className="py-3 px-4">
                        {u.role === 'ADMIN' ? (
                          <Badge variant="info">ADMIN</Badge>
                        ) : (
                          <Badge>USER</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRoleTarget(u)}
                          >
                            {u.role === 'ADMIN' ? (
                              <>
                                <ShieldOff size={14} />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield size={14} />
                                Make Admin
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-surface-500 dark:text-surface-400 text-sm">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-800">
                <p className="text-sm text-surface-500 dark:text-surface-400">Page {current} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={current === totalPages}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!roleTarget}
        title={isPromoting ? 'Make Admin' : 'Remove Admin'}
        message={
          isPromoting
            ? `This will give ${roleTarget?.name} full dashboard access. Continue?`
            : `This will remove admin access from ${roleTarget?.name}. They will no longer be able to access the dashboard. Continue?`
        }
        confirmLabel={isPromoting ? 'Make Admin' : 'Remove Admin'}
        variant={isPromoting ? 'warning' : 'danger'}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleTarget(null)}
        isLoading={updating}
      />
    </div>
  )
}
