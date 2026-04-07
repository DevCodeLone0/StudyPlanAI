import api from './api'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ADMIN'
  xp: number
  level: number
  currentStreak: number
  plansCount: number
  createdAt: string
}

export interface Analytics {
  totalUsers: number
  activeUsers: number
  totalPlans: number
  averageCompletionRate: number
  averageStreak: number
  topBadges: Array<{ code: string; name: string; count: number }>
}

export interface PaginatedUsers {
  data: AdminUser[]
  total: number
  page: number
  pageSize: number
}

export const adminService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedUsers> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.search) query.append('search', params.search)
    const response = await api.get<PaginatedUsers>(`/admin/users?${query}`)
    return response.data
  },

  async updateUserRole(userId: string, role: 'STUDENT' | 'ADMIN'): Promise<AdminUser> {
    const response = await api.patch<AdminUser>(`/admin/users/${userId}`, { role })
    return response.data
  },

  async getAnalytics(): Promise<Analytics> {
    const response = await api.get<Analytics>('/admin/analytics')
    return response.data
  },

  async deactivateUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`)
  },
}
