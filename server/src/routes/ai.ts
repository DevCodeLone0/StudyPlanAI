import { Router } from 'express'
import axios from 'axios'
import { authenticate } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js'
import {
  PLAN_GENERATION_SYSTEM_PROMPT,
  TUTOR_SYSTEM_PROMPT,
  TUTOR_FALLBACK_RESPONSES,
  buildPlanPrompt,
  buildTutorPrompt
} from '../prompts/planPrompts.js'
import {
  validatePlan,
  isPlanTooGeneric,
  getPlanQualityMessage,
  type PlanData
} from '../services/planValidationService.js'

const router = Router()

interface NvidiaAIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

async function callNvidiaAI(
  messages: Array<{ role: string; content: string }>,
  options: {
    maxTokens?: number
    temperature?: number
    topP?: number
  } = {}
): Promise<NvidiaAIResponse> {
  const apiUrl = process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions'
  const apiKey = process.env.NVIDIA_API_KEY
  const model = process.env.NVIDIA_MODEL || 'z-ai/glm5'

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY not configured')
  }

  const { maxTokens = 500, temperature = 0.5, topP = 0.9 } = options

  const response = await axios.post(
    apiUrl,
    {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 second timeout
    }
  )

  const content = response.data.choices[0]?.message?.content || ''
  const usage = response.data.usage

  return { content, usage }
}

function parsePlanJSON(content: string): PlanData | null {
  try {
    // Try to extract JSON from response (might have markdown or extra text)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : content.trim()
    
    const parsed = JSON.parse(jsonStr)
    return parsed
  } catch {
    return null
  }
}

function generateFallbackPlan(goal: string, duration: string, dailyTime: string): PlanData {
  const durationDays = parseInt(duration) || 90
  const moduleCount = Math.min(8, Math.max(4, Math.floor(durationDays / 14)))
  
  return {
    title: `Study Plan: ${goal}`,
    description: `A structured ${duration} learning path for ${goal}, designed for ${dailyTime} daily study sessions.`,
    modules: [
      {
        title: 'Module 1: Foundation & Setup',
        description: 'Establish the groundwork and essential concepts needed to begin your learning journey.',
        estimatedDays: Math.floor(durationDays * 0.15),
        milestones: [
          {
            title: 'Set up your learning environment',
            description: 'Prepare all necessary tools, resources, and workspace for effective learning.',
            estimatedDuration: '1-2 days'
          },
          {
            title: 'Learn core concepts and terminology',
            description: 'Understand the fundamental vocabulary and basic principles.',
            estimatedDuration: '2-3 days'
          },
          {
            title: 'Complete initial practice exercises',
            description: 'Apply basic concepts through guided exercises and activities.',
            estimatedDuration: '2-3 days'
          }
        ]
      },
      {
        title: 'Module 2: Core Knowledge Development',
        description: 'Build comprehensive understanding of the main subject matter.',
        estimatedDays: Math.floor(durationDays * 0.25),
        milestones: [
          {
            title: 'Study primary concepts in depth',
            description: 'Deep dive into the essential topics and theories.',
            estimatedDuration: '4-5 days'
          },
          {
            title: 'Practice with real examples',
            description: 'Apply knowledge through practical exercises and case studies.',
            estimatedDuration: '3-4 days'
          },
          {
            title: 'Complete intermediate project',
            description: 'Build a small project that demonstrates core understanding.',
            estimatedDuration: '3-4 days'
          }
        ]
      },
      {
        title: 'Module 3: Advanced Concepts',
        description: 'Explore complex topics and advanced techniques.',
        estimatedDays: Math.floor(durationDays * 0.30),
        milestones: [
          {
            title: 'Learn advanced techniques',
            description: 'Master sophisticated methods and approaches.',
            estimatedDuration: '5-6 days'
          },
          {
            title: 'Solve challenging problems',
            description: 'Tackle complex scenarios that require combining multiple concepts.',
            estimatedDuration: '4-5 days'
          },
          {
            title: 'Build advanced project',
            description: 'Create a comprehensive project showcasing advanced skills.',
            estimatedDuration: '5-6 days'
          }
        ]
      },
      {
        title: 'Module 4: Practical Application',
        description: 'Apply all knowledge to real-world scenarios and projects.',
        estimatedDays: Math.floor(durationDays * 0.20),
        milestones: [
          {
            title: 'Work on capstone project',
            description: 'Plan and begin a comprehensive final project.',
            estimatedDuration: '4-5 days'
          },
          {
            title: 'Complete and present final project',
            description: 'Finish, review, and present your capstone work.',
            estimatedDuration: '4-5 days'
          }
        ]
      },
      {
        title: 'Module 5: Review & Mastery',
        description: 'Consolidate learning and prepare for future growth.',
        estimatedDays: Math.floor(durationDays * 0.10),
        milestones: [
          {
            title: 'Review all concepts',
            description: 'Systematically review and reinforce key learnings.',
            estimatedDuration: '2-3 days'
          },
          {
            title: 'Document your learning journey',
            description: 'Create notes, portfolio, or resources for future reference.',
            estimatedDuration: '2-3 days'
          }
        ]
      }
    ]
  }
}

// POST /ai/generate-plan
router.post('/generate-plan', authenticate, async (req, res, next) => {
  try {
    const { goal, duration, dailyTime, topics } = req.body

    if (!goal || !duration || !dailyTime) {
      throw new BadRequestError('Missing required fields: goal, duration, dailyTime')
    }

    const prompt = buildPlanPrompt({ goal, duration, dailyTime, topics })

    let planData: PlanData | null = null
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts && (!planData || isPlanTooGeneric(planData))) {
      attempts++

      console.log(`[AI] Generating plan, attempt ${attempts}/${maxAttempts}`)

      try {
        const result = await callNvidiaAI(
          [
            { role: 'system', content: PLAN_GENERATION_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          {
            maxTokens: 4000,
            temperature: attempts === 1 ? 0.4 : 0.6, // Slightly higher on retry
            topP: 0.9
          }
        )

        console.log(`[AI] Response received, tokens used: ${result.usage?.total_tokens || 'unknown'}`)

        planData = parsePlanJSON(result.content)

        if (!planData) {
          console.log('[AI] Failed to parse JSON from response')
          continue
        }

        const validation = validatePlan(planData)
        console.log(`[AI] Plan validation score: ${validation.score}/100`)

        if (!validation.isValid) {
          console.log('[AI] Plan validation issues:', validation.issues.slice(0, 3))
        }

        if (validation.score >= 60) {
          break // Good enough
        }

      } catch (apiError: any) {
        console.error('[AI] API error:', apiError.message)
        if (attempts === maxAttempts) {
          throw apiError
        }
      }
    }

    // If AI generation failed or plan is too generic, use fallback
    if (!planData || isPlanTooGeneric(planData)) {
      console.log('[AI] Using fallback plan due to poor quality')
      planData = generateFallbackPlan(goal, duration, dailyTime)
    }

    // Ensure plan has required structure
    if (!planData.title) {
      planData.title = `Study Plan: ${goal}`
    }
    if (!planData.description) {
      planData.description = `A ${duration} learning path for ${goal}`
    }
    if (!planData.modules || planData.modules.length === 0) {
      planData = generateFallbackPlan(goal, duration, dailyTime)
    }

    const validation = validatePlan(planData)

    res.json({
      plan: planData,
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quality: {
        score: validation.score,
        message: getPlanQualityMessage(validation.score)
      }
    })

  } catch (error: any) {
    console.error('[AI] Plan generation error:', error.response?.data || error.message)
    
    // Return fallback plan on error
    const { goal, duration, dailyTime } = req.body
    const fallbackPlan = generateFallbackPlan(goal || 'General Learning', duration || '3 months', dailyTime || '1 hour')

    res.json({
      plan: fallbackPlan,
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quality: {
        score: 50,
        message: 'Generated fallback plan due to API issues'
      }
    })
  }
})

// POST /ai/chat
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { message, context } = req.body

    if (!message || typeof message !== 'string') {
      throw new BadRequestError('Message is required')
    }

    const contextStr = context?.currentModule 
      ? `Currently studying: ${context.currentModule}. Progress: ${context.progress || 0}%`
      : 'No active module'

    const systemPrompt = buildTutorPrompt(message, contextStr)

    const result = await callNvidiaAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      {
        maxTokens: 300, // Shorter for chat
        temperature: 0.6,
        topP: 0.9
      }
    )

    const reply = result.content.trim()

    if (!reply || reply.length < 5) {
      res.json({ message: TUTOR_FALLBACK_RESPONSES.general })
      return
    }

    res.json({ message: reply })

  } catch (error: any) {
    console.error('[AI] Chat error:', error.response?.data || error.message)
    res.json({ 
      message: TUTOR_FALLBACK_RESPONSES.general 
    })
  }
})

// POST /ai/adjust
router.post('/adjust', authenticate, async (req, res, next) => {
  try {
    const { planId, feedback } = req.body
    const userId = req.user!.userId

    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
      include: {
        modules: {
          include: { milestones: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const prompt = `The user wants to adjust their study plan. 
Current plan: "${plan.title}" with ${plan.modules.length} modules.
User feedback: "${feedback}"

Suggest specific adjustments to the plan structure, pacing, or content. 
Return a JSON object with:
{
  "suggestions": ["list of specific adjustments"],
  "reasoning": "why these changes make sense"
}`

    const result = await callNvidiaAI(
      [
        { role: 'system', content: 'You are a helpful study plan advisor. Respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      { maxTokens: 800, temperature: 0.5 }
    )

    let adjustments
    try {
      adjustments = JSON.parse(result.content)
    } catch {
      adjustments = {
        suggestions: ['Consider breaking down complex modules', 'Add more practice time'],
        reasoning: 'Based on general best practices'
      }
    }

    res.json({
      message: 'Plan adjustment suggestions generated',
      adjustments
    })

  } catch (error) {
    next(error)
  }
})

// GET /ai/summary/:planId
router.get('/summary/:planId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId
    const { planId } = req.params

    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
      include: {
        modules: {
          include: { milestones: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const totalMilestones = plan.modules.reduce(
      (acc, module) => acc + module.milestones.length,
      0
    )
    const completedMilestones = plan.modules.reduce(
      (acc, module) => acc + module.milestones.filter((m) => m.completedAt).length,
      0
    )

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentActivities = await prisma.activity.count({
      where: {
        userId,
        createdAt: { gte: weekAgo }
      }
    })

    res.json({
      planId: plan.id,
      weekStart: weekAgo.toISOString().split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      milestonesCompleted: completedMilestones,
      totalMilestones,
      timeStudied: `${Math.round(recentActivities * 0.5)} hours`,
      streakStatus: { current: 0, changed: false },
      insights: completedMilestones > 0
        ? ['Great progress! Keep it up!', `You've completed ${completedMilestones} milestones.`]
        : ['Start with small milestones to build momentum'],
      recommendations: completedMilestones < totalMilestones
        ? ['Try to complete at least one milestone per day']
        : ['Consider advancing to a new module or plan']
    })
  } catch (error) {
    next(error)
  }
})

// GET /ai/context
router.get('/context', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plans: {
          where: { isActive: true },
          include: {
            modules: {
              include: { milestones: true },
              orderBy: { order: 'asc' }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const activePlan = user.plans[0]
    const totalMilestones = activePlan?.modules.reduce(
      (acc, module) => acc + module.milestones.length,
      0
    ) || 0

    const completedMilestones = activePlan?.modules.reduce(
      (acc, module) => acc + module.milestones.filter((m) => m.completedAt).length,
      0
    ) || 0

    const progressPercentage = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0

    const currentModule = activePlan?.modules.find(m => m.status === 'IN_PROGRESS')

    const context = {
      user: {
        name: user.name,
        level: user.level,
        xp: user.xp,
        currentStreak: user.currentStreak
      },
      plan: activePlan ? {
        title: activePlan.title,
        goal: activePlan.goal,
        progress: progressPercentage,
        totalMilestones,
        completedMilestones,
        currentModule: currentModule?.title || null,
        modules: activePlan.modules.map((m) => ({
          title: m.title,
          status: m.status,
          milestones: m.milestones.map((ms) => ({
            title: ms.title,
            completed: !!ms.completedAt
          }))
        }))
      } : null,
      recentActivities: user.activities.slice(0, 5).map((a) => ({
        type: a.type,
        createdAt: a.createdAt,
        metadata: a.metadata
      }))
    }

    res.json(context)
  } catch (error) {
    next(error)
  }
})

// POST /ai/analyze-progress
router.post('/analyze-progress', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plans: {
          where: { isActive: true },
          include: {
            modules: {
              include: { milestones: true },
              orderBy: { order: 'asc' }
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const activePlan = user.plans[0]

    if (!activePlan) {
      throw new BadRequestError('No active plan found')
    }

    const totalMilestones = activePlan.modules.reduce(
      (acc, module) => acc + module.milestones.length,
      0
    )

    const completedMilestones = activePlan.modules.reduce(
      (acc, module) => acc + module.milestones.filter((m) => m.completedAt).length,
      0
    )

    const progressPercentage = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0

    const milestoneCompletionRate = totalMilestones > 0 
      ? completedMilestones / totalMilestones 
      : 0

    const daysSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    const xpPerDay = user.xp / (daysSinceCreation || 1)
    const projectedLevel = Math.floor(user.xp / 1000) + 1
    const needsMotivation = progressPercentage < 30 && completedMilestones < totalMilestones * 0.5

    await prisma.activity.create({
      data: {
        userId,
        type: 'PLAN_ADJUSTED',
        metadata: {
          action: 'progress_analyzed',
          progress: progressPercentage
        }
      }
    })

    res.json({
      progress: {
        percentage: progressPercentage,
        completed: completedMilestones,
        total: totalMilestones
      },
      pace: {
        xpPerDay: Math.round(xpPerDay * 10) / 10,
        projectedLevel,
        onTrack: milestoneCompletionRate > 0.5
      },
      recommendations: [
        milestoneCompletionRate < 0.3
          ? "¡Vamos! Completá los primeros hitos para ganar impulso."
          : "¡Gran progreso! Seguí así."
      ],
      motivation: needsMotivation
        ? "Noto que podrías necesitar un impulso. ¿Qué te parece si completás un hito hoy?"
        : "¡Excelente ritmo! Seguí así."
    })
  } catch (error) {
    next(error)
  }
})

export { router as aiRouter }
