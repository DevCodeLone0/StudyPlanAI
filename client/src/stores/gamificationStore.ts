import { create } from 'zustand'
import type { UserBadge } from '@/types'

interface GamificationState {
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  badges: UserBadge[]
  recentXPChange: number | null
  
  setXP: (xp: number) => void
  setLevel: (level: number) => void
  setStreak: (current: number, longest: number) => void
  setBadges: (badges: UserBadge[]) => void
  addBadge: (badge: UserBadge) => void
  addXP: (amount: number) => void
  showXPChange: (amount: number) => void
  clearXPChange: () => void
}

// XP required for each level (exponential growth)
const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1))

export const useGamificationStore = create<GamificationState>((set) => ({
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  badges: [],
  recentXPChange: null,
  
  setXP: (xp) => set({ xp }),
  setLevel: (level) => set({ level }),
  setStreak: (current, longest) => set({ 
    currentStreak: current, 
    longestStreak: longest 
  }),
  setBadges: (badges) => set({ badges }),
  
  addBadge: (badge) => set((state) => ({
    badges: [...state.badges, badge]
  })),
  
  addXP: (amount) => set((state) => {
    const newXP = state.xp + amount
    let newLevel = state.level
    let remainingXP = newXP
    
    // Check for level ups
    while (remainingXP >= XP_PER_LEVEL(newLevel)) {
      remainingXP -= XP_PER_LEVEL(newLevel)
      newLevel++
    }
    
    return {
      xp: newXP,
      level: newLevel,
      recentXPChange: amount,
    }
  }),
  
  showXPChange: (amount) => set({ recentXPChange: amount }),
  clearXPChange: () => set({ recentXPChange: null }),
}))

// Helper to calculate progress to next level
export const getLevelProgress = (xp: number, level: number) => {
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
