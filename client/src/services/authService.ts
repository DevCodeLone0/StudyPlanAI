import api from './api'
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User 
} from '@/types'

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },
  
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },
  
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
  
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },
  
  async getMe(): Promise<User> {
    const response = await api.get<User>('/users/me')
    return response.data
  },
  
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/users/me', updates)
    return response.data
  },
}
