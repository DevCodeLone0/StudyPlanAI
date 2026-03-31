import { prisma } from '../lib/prisma.js'

/**
 * AI Context Service
 * Aggregates user study context for AI Tutor
 */

export interface AIContext {
  plan: {
    id: string
    title: string
    status: string
  } | null
  currentModule: {
    id: string
    title: string
    order: number
    status: string
  } | null
  progress: {
    completedMilestones: number
    totalMilestones: number
    percentage: number
  }
  streak: {
    current: number
    longest: number
  }
  recentActivity: {
    lastActiveAt: string | null
    daysSinceActive: number
    lastActivities: Array<{
      type: string
      createdAt: Date
      metadata: any
    }>
  }
}

/**
 * Get AI context for a user
 * Aggregates plan, module, milestone, streak, and activity data
 */
export async function getAIContext(userId: string): Promise<AIContext> {
  // Get user with streak info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveAt: true,
    },
  })

  if (!user) {
    return getEmptyContext()
  }

  // Get active plan with modules and milestones
  const activePlan = await prisma.plan.findFirst({
    where: {
      userId,
      isActive: true,
      status: 'ACTIVE',
    },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          milestones: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  // Calculate milestone progress
  let completedMilestones = 0
  let totalMilestones = 0
  let currentModule: AIContext['currentModule'] = null

  if (activePlan) {
    for (const mod of activePlan.modules) {
      for (const ms of mod.milestones) {
        totalMilestones++
        if (ms.completedAt) {
          completedMilestones++
        }
      }

      // Find current module (first IN_PROGRESS or next LOCKED)
      if (!currentModule) {
        if (mod.status === 'IN_PROGRESS') {
          currentModule = {
            id: mod.id,
            title: mod.title,
            order: mod.order,
            status: mod.status,
          }
        } else if (mod.status === 'LOCKED' && !currentModule) {
          // Keep track of first locked module as fallback
          currentModule = {
            id: mod.id,
            title: mod.title,
            order: mod.order,
            status: mod.status,
          }
        }
      }
    }
  }

  // Get recent activities (last 5)
  const recentActivities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      type: true,
      createdAt: true,
      metadata: true,
    },
  })

  // Calculate days since last active
  const lastActiveAt = user.lastActiveAt
  const daysSinceActive = lastActiveAt
    ? Math.floor((Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  return {
    plan: activePlan
      ? {
          id: activePlan.id,
          title: activePlan.title,
          status: activePlan.status,
        }
      : null,
    currentModule,
    progress: {
      completedMilestones,
      totalMilestones,
      percentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
    },
    streak: {
      current: user.currentStreak,
      longest: user.longestStreak,
    },
    recentActivity: {
      lastActiveAt: lastActiveAt?.toISOString() || null,
      daysSinceActive,
      lastActivities: recentActivities.map((a) => ({
        type: a.type,
        createdAt: a.createdAt,
        metadata: a.metadata,
      })),
    },
  }
}

/**
 * Build context-aware system prompt for TutorAI
 */
export function buildTutorSystemPrompt(context: AIContext): string {
  const planInfo = context.plan
    ? `Plan: ${context.plan.title}`
    : 'No active plan'

  const moduleInfo = context.currentModule
    ? `${context.currentModule.title} (${context.currentModule.status})`
    : 'Not started'

  const progressInfo = `${context.progress.completedMilestones}/${context.progress.totalMilestones} milestones (${context.progress.percentage}%)`

  const streakInfo = context.streak.current > 0
    ? `${context.streak.current} days (best: ${context.streak.longest})`
    : 'No active streak'

  const activitySummary = context.recentActivity.lastActivities.length > 0
    ? context.recentActivity.lastActivities
        .map((a) => `${a.type.replace(/_/g, ' ').toLowerCase()}`)
        .join(', ')
    : 'No recent activity'

  return `You are "TutorAI", a friendly and encouraging study companion.

## Student Context
- Active Plan: ${planInfo}
- Current Module: ${moduleInfo}
- Progress: ${progressInfo}
- Streak: ${streakInfo}
- Recent activity: ${activitySummary}

## Your Role
1. First, detect the student's sentiment from their message. Respond with ONLY one of: FRUSTRATED, MOTIVATED, NEUTRAL, CONFUSED
2. Adjust your tone accordingly:
   - FRUSTRATED: Be patient, validate feelings, offer specific help
   - MOTIVATED: Celebrate, suggest next challenges
   - NEUTRAL: Be friendly and informative
   - CONFUSED: Break things down simply, use examples
3. Provide context-aware help related to their current module
4. Keep responses under 200 words

## Response Format
After your response, include a brief sentiment assessment on a new line:
[SENTIMENT: DETECTED_SENTIMENT]`
}

/**
 * Parse sentiment from AI response
 */
export function parseSentiment(response: string): {
  sentiment: 'FRUSTRATED' | 'MOTIVATED' | 'NEUTRAL' | 'CONFUSED' | null
  cleanResponse: string
} {
  const sentimentMatch = response.match(/\[SENTIMENT:\s*(FRUSTRATED|MOTIVATED|NEUTRAL|CONFUSED)\]/i)

  if (sentimentMatch) {
    const sentiment = sentimentMatch[1].toUpperCase() as 'FRUSTRATED' | 'MOTIVATED' | 'NEUTRAL' | 'CONFUSED'
    const cleanResponse = response.replace(sentimentMatch[0], '').trim()
    return { sentiment, cleanResponse }
  }

  return { sentiment: null, cleanResponse: response }
}

/**
 * Return empty context for users without data
 */
function getEmptyContext(): AIContext {
  return {
    plan: null,
    currentModule: null,
    progress: {
      completedMilestones: 0,
      totalMilestones: 0,
      percentage: 0,
    },
    streak: {
      current: 0,
      longest: 0,
    },
    recentActivity: {
      lastActiveAt: null,
      daysSinceActive: 999,
      lastActivities: [],
    },
  }
}
