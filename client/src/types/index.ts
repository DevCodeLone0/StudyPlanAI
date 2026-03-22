// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ADMIN'
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// ============================================
// PLAN & MODULES
// ============================================

export interface Plan {
  id: string
  title: string
  description?: string
  goal: string
  duration: string
  dailyTime: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED'
  isActive: boolean
  version: number
  modules?: Module[]
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  title: string
  description?: string
  order: number
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED'
  estimatedDays?: number
  milestones?: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description?: string
  order: number
  xpReward: number
  dueDate?: string
  completedAt?: string
  resources?: Resource[]
}

export interface Resource {
  id: string
  type: 'LINK' | 'NOTE' | 'FILE'
  title: string
  url?: string
  content?: string
}

// ============================================
// AI
// ============================================

export interface GeneratePlanRequest {
  goal: string
  duration: string
  dailyTime: string
  topics?: string[]
}

export interface GeneratePlanResponse {
  plan: Plan
  estimatedCompletion: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  context?: {
    currentModule?: string
    currentMilestone?: string
  }
}

// ============================================
// GAMIFICATION
// ============================================

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
}

export interface UserBadge {
  id: string
  earnedAt: string
  badge: Badge
}

export interface CompleteMilestoneResponse {
  milestone: Milestone
  xpEarned: number
  totalXp: number
  levelUp: boolean
  newBadge: UserBadge | null
  streakUpdated: {
    current: number
    longest: number
  }
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ============================================
// ADMIN
// ============================================

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ADMIN'
  xp: number
  level: number
  currentStreak: number
  plansCount: number
  lastActiveAt?: string
  createdAt: string
}

export interface Analytics {
  totalUsers: number
  activeUsers: number
  totalPlans: number
  averageCompletionRate: number
  averageStreak: number
  topBadges: Badge[]
}
