import api from './api'
import type {
  Badge,
  UserBadge,
} from '@/types'

// ============================================
// TYPES FOR GAMIFICATION FEATURES
// ============================================

export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  category: 'theme' | 'avatar' | 'title' | 'effect'
}

export interface UserReward {
  id: string
  purchasedAt: string
  reward: Reward
}

export interface ActivityCalendarData {
  date: string
  count: number
  types: Array<{ type: string; count: number }>
}

export interface StreakHistory {
  id: string
  type: 'STREAK_MAINTENED' | 'STREAK_BROKEN'
  metadata: any
  createdAt: string
}

export interface BadgeWithStatus extends Badge {
  earned: boolean
  earnedAt: string | null
}

// Re-export Badge and UserBadge types for components
export type { Badge, UserBadge }

// ============================================
// GAMIFICATION SERVICE
// ============================================

export const gamificationService = {
  // ============================================
  // BADGES
  // ============================================

  /**
   * Get all badges with earned/locked status
   */
  async getBadges(): Promise<BadgeWithStatus[]> {
    const response = await api.get<BadgeWithStatus[]>('/badges')
    return response.data
  },

  /**
   * Get only earned badges
   */
  async getEarnedBadges(): Promise<UserBadge[]> {
    const response = await api.get<UserBadge[]>('/badges/earned')
    return response.data
  },

  /**
   * Generate share URL for a badge
   */
  async shareBadge(badgeId: string): Promise<{ shareUrl: string }> {
    const response = await api.post<{ shareUrl: string }>(`/badges/${badgeId}/share`)
    return response.data
  },

  // ============================================
  // REWARDS
  // ============================================

  /**
   * Get all available rewards
   */
  async getRewards(): Promise<Reward[]> {
    const response = await api.get<Reward[]>('/rewards')
    return response.data
  },

  /**
   * Get purchased rewards for current user
   */
  async getPurchasedRewards(): Promise<UserReward[]> {
    const response = await api.get<UserReward[]>('/rewards/purchased')
    return response.data
  },

  /**
   * Purchase a reward with XP
   */
  async purchaseReward(rewardId: string): Promise<UserReward> {
    const response = await api.post<UserReward>(`/rewards/${rewardId}/purchase`)
    return response.data
  },

  // ============================================
  // ACTIVITY CALENDAR
  // ============================================

  /**
   * Get activity calendar data for heatmap
   * @param days - Number of days to fetch (default: 30)
   */
  async getActivityCalendar(days: number = 30): Promise<ActivityCalendarData[]> {
    const response = await api.get<ActivityCalendarData[]>(`/activity/calendar?days=${days}`)
    return response.data
  },

  /**
   * Get activity history with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20, max: 100)
   * @param type - Filter by activity type (optional)
   */
  async getActivityHistory(
    page: number = 1,
    limit: number = 20,
    type?: string
  ): Promise<{
    activities: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (type) {
      params.append('type', type)
    }

    const response = await api.get(`/activity/history?${params}`)
    return response.data
  },

  // ============================================
  // STREAKS
  // ============================================

  /**
   * Get streak history
   */
  async getStreakHistory(): Promise<StreakHistory[]> {
    const response = await api.get<StreakHistory[]>('/streaks/history')
    return response.data
  },

  /**
   * Check and update streak status
   * Call this after completing milestones or other activities
   */
  async checkStreak(): Promise<{
    streakUpdated: boolean
    streakBroken: boolean
    currentStreak: number
    longestStreak: number
    lastActiveAt: string | null
  }> {
    const response = await api.post('/streaks/check')
    return response.data
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate XP progress to next level
 */
export const getLevelProgress = (xp: number, level: number) => {
  // XP required for each level (exponential growth)
  const XP_PER_LEVEL = (lvl: number) => Math.floor(100 * Math.pow(1.2, lvl - 1))

  let remainingXP = xp
  let currentLevel = 1

  while (currentLevel < level) {
    remainingXP -= XP_PER_LEVEL(currentLevel)
    currentLevel++
  }

  const needed = XP_PER_LEVEL(level)
  const progress = Math.min(remainingXP / needed, 1)

  return {
    current: remainingXP,
    needed,
    progress,
    percentage: Math.round(progress * 100),
  }
}

/**
 * Format activity type for display
 */
export const formatActivityType = (type: string): string => {
  const typeMap: Record<string, string> = {
    MILESTONE_COMPLETED: 'Milestone Completed',
    PLAN_CREATED: 'Plan Created',
    PLAN_COMPLETED: 'Plan Completed',
    STREAK_MAINTENED: 'Streak Maintained',
    STREAK_BROKEN: 'Streak Broken',
    BADGE_EARNED: 'Badge Earned',
    LEVEL_UP: 'Level Up',
    PLAN_ADJUSTED: 'Plan Adjusted',
  }

  return typeMap[type] || type
}

/**
 * Get color for activity type
 */
export const getActivityTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    MILESTONE_COMPLETED: 'bg-green-500',
    PLAN_CREATED: 'bg-blue-500',
    PLAN_COMPLETED: 'bg-purple-500',
    STREAK_MAINTENED: 'bg-orange-500',
    STREAK_BROKEN: 'bg-red-500',
    BADGE_EARNED: 'bg-yellow-500',
    LEVEL_UP: 'bg-indigo-500',
    PLAN_ADJUSTED: 'bg-cyan-500',
  }

  return colorMap[type] || 'bg-gray-500'
}

/**
 * Get heatmap color based on activity count
 */
export const getHeatmapColor = (count: number): string => {
  if (count === 0) return 'bg-gray-100'
  if (count <= 2) return 'bg-green-200'
  if (count <= 5) return 'bg-green-400'
  if (count <= 10) return 'bg-green-600'
  return 'bg-green-800'
}

/**
 * Check if user can afford a reward
 */
export const canAffordReward = (userXP: number, rewardCost: number): boolean => {
  return userXP >= rewardCost
}

/**
 * Calculate days until streak milestone
 */
export const getDaysUntilStreakMilestone = (
  currentStreak: number,
  milestone: number
): number | null => {
  if (currentStreak >= milestone) return null
  return milestone - currentStreak
}

/**
 * Get streak milestone message
 */
export const getStreakMilestoneMessage = (currentStreak: number): string | null => {
  const milestones = [7, 14, 30, 60, 100, 365]

  for (const milestone of milestones) {
    if (currentStreak === milestone - 1) {
      return `🔥 You're 1 day away from a ${milestone}-day streak!`
    }
  }

  return null
}
