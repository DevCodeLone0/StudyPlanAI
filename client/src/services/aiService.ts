import api from './api'
import type { ChatMessage, ChatRequest, Plan } from '@/types'

export interface AIAdjustmentRequest {
  planId: string
  feedback: string
}

export interface WeeklySummary {
  planId: string
  weekStart: string
  weekEnd: string
  milestonesCompleted: number
  totalMilestones: number
  timeStudied: string
  streakStatus: {
    current: number
    changed: boolean
  }
  insights: string[]
  recommendations: string[]
}

export const aiService = {
  async chat(data: ChatRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/ai/chat', data)
    return response.data
  },
  
  async adjustPlan(data: AIAdjustmentRequest): Promise<Plan> {
    const response = await api.post<Plan>('/ai/adjust', data)
    return response.data
  },
  
  async getWeeklySummary(planId: string): Promise<WeeklySummary> {
    const response = await api.get<WeeklySummary>(`/ai/summary/${planId}`)
    return response.data
  },
  
  // Chat history helpers (local storage for MVP)
  getChatHistory(): ChatMessage[] {
    const history = localStorage.getItem('tutor-chat-history')
    return history ? JSON.parse(history) : []
  },
  
  saveChatHistory(messages: ChatMessage[]): void {
    localStorage.setItem('tutor-chat-history', JSON.stringify(messages))
  },
  
  clearChatHistory(): void {
    localStorage.removeItem('tutor-chat-history')
  },
}
