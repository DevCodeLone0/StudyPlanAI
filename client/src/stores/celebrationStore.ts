import { create } from 'zustand'
import type { Badge } from '@/types'

export type CelebrationType = 'level_up' | 'badge_earned' | 'streak_milestone' | 'module_complete'

export interface CelebrationEvent {
  id: string
  type: CelebrationType
  data: {
    level?: number
    badge?: Badge
    streak?: number
    xpEarned?: number
    moduleName?: string
  }
}

interface CelebrationState {
  queue: CelebrationEvent[]
  currentEvent: CelebrationEvent | null
  
  triggerCelebration: (type: CelebrationType, data: CelebrationEvent['data']) => void
  processNext: () => void
  dismissCurrent: () => void
  clearQueue: () => void
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365]

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  queue: [],
  currentEvent: null,

  triggerCelebration: (type, data) => {
    const event: CelebrationEvent = {
      id: `${type}-${Date.now()}`,
      type,
      data,
    }

    set((state) => {
      if (!state.currentEvent) {
        return { currentEvent: event }
      }
      return { queue: [...state.queue, event] }
    })
  },

  processNext: () => {
    set((state) => {
      const [next, ...remaining] = state.queue
      return {
        currentEvent: next || null,
        queue: remaining,
      }
    })
  },

  dismissCurrent: () => {
    get().processNext()
  },

  clearQueue: () => {
    set({ queue: [], currentEvent: null })
  },
}))

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak)
}
