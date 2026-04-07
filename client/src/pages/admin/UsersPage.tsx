import { useState, useEffect } from 'react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { adminService, type AdminUser, type Analytics } from '@/services/adminService'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [page, search])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [usersData, analyticsData] = await Promise.all([
        adminService.getUsers({ page, limit: 10, search: search || undefined }),
        adminService.getAnalytics(),
      ])
      setUsers(usersData.data)
      setTotal(usersData.total)
      setAnalytics(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, currentRole: 'STUDENT' | 'ADMIN') => {
    const newRole = currentRole === 'STUDENT' ? 'ADMIN' : 'STUDENT'
    setUpdatingId(userId)
    try {
      const updated = await adminService.updateUserRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? { ...u, role: updated.role } : u))
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadData()
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPlans}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Avg Streak</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageStreak)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-gray-500">Total Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.topBadges?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          {error && (
            <div className="p-3 bg-danger-50 text-danger-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Level</th>
                    <th className="pb-3">XP</th>
                    <th className="pb-3">Plans</th>
                    <th className="pb-3">Streak</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-4">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </td>
                      <td className="py-4">{user.level}</td>
                      <td className="py-4">{user.xp.toLocaleString()}</td>
                      <td className="py-4">{user.plansCount}</td>
                      <td className="py-4">{user.currentStreak} days</td>
                      <td className="py-4">
                        <Badge variant={user.role === 'ADMIN' ? 'primary' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRoleChange(user.id, user.role)}
                          disabled={updatingId === user.id}
                        >
                          {updatingId === user.id ? (
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                          ) : user.role === 'ADMIN' ? (
                            'Demote'
                          ) : (
                            'Promote'
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {users.length} of {total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
