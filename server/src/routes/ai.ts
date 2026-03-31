import { Router } from 'express'
import axios from 'axios'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

const PLAN_GENERATION_PROMPT = `You are an expert curriculum designer. Create a personalized study plan based on:
- Goal: {goal}
- Duration: {duration}
- Daily time available: {dailyTime}
- Topics: {topics}

Return a JSON plan with:
{
  "title": "Plan title",
  "modules": [{
    "title": "Module name",
    "description": "Brief description",
    "milestones": [{
      "title": "Milestone name",
      "description": "What to accomplish",
      "estimatedDuration": "X days"
    }]
  }]
}

Rules:
- 6-12 modules
- 3-5 milestones per module
- Progressive difficulty
- Practical, achievable milestones
- Return ONLY valid JSON, no markdown or explanation`

// POST /ai/generate-plan
router.post('/generate-plan', authenticate, async (req, res, next) => {
  try {
    const { goal, duration, dailyTime, topics } = req.body
    
    const prompt = PLAN_GENERATION_PROMPT
      .replace('{goal}', goal)
      .replace('{duration}', duration)
      .replace('{dailyTime}', dailyTime)
      .replace('{topics}', topics?.join(', ') || 'General topics')
    
    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          { role: 'system', content: 'You are a helpful curriculum designer.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const content = response.data.choices[0]?.message?.content || '{}'
    
    // Parse the JSON response
    let planData
    try {
      // Try to extract JSON from the response (might have markdown)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/(\{[\s\S]*\})/)
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content
      planData = JSON.parse(jsonStr)
    } catch {
      // If parsing fails, return a default structure
      planData = {
        title: goal,
        modules: [
          {
            title: 'Getting Started',
            description: 'Introduction to your study plan',
            milestones: [
              { title: 'Set up your learning environment', description: 'Prepare all necessary materials', estimatedDuration: '1 day' },
            ],
          },
        ],
      }
    }
    
    res.json({
      plan: planData,
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  } catch (error: any) {
    console.error('AI generation error:', error.response?.data || error.message)
    
    // Return a mock plan if API fails (for development)
    res.json({
      plan: {
        title: goal || 'My Study Plan',
        modules: [
          {
            title: 'Introduction',
            description: 'Getting started with your learning journey',
            milestones: [
              { title: 'Set up goals', description: 'Define clear objectives', estimatedDuration: '1 day' },
              { title: 'Create schedule', description: 'Plan your study time', estimatedDuration: '1 day' },
            ],
          },
          {
            title: 'Foundation',
            description: 'Build your foundation knowledge',
            milestones: [
              { title: 'Core concepts', description: 'Learn the basics', estimatedDuration: '3 days' },
              { title: 'Practice exercises', description: 'Apply what you learned', estimatedDuration: '2 days' },
            ],
          },
        ],
      },
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }
})

// POST /ai/chat
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { message, context } = req.body
    
    const systemPrompt = `You are a friendly, encouraging AI tutor named "TutorAI". 
You help students with their study plans. Be:
- Supportive and motivating
- Clear and concise (under 200 words)
- Patient with questions
- Able to provide examples
- Aware of the student's current plan context

Current context: ${context?.currentModule ? `Currently studying: ${context.currentModule}` : 'No active module'}`

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const reply = response.data.choices[0]?.message?.content || 
      "I'm here to help! Try asking about your current study topic or any concepts you're struggling with."
    
    res.json({ message: reply })
  } catch (error: any) {
    console.error('AI chat error:', error.response?.data || error.message)
    
    // Return a fallback response
    res.json({
      message: "I'm here to help with your studies! In the full version, I'll be able to provide detailed explanations. For now, try asking specific questions about your study material. 📚",
    })
  }
})

// POST /ai/adjust
router.post('/adjust', authenticate, async (req, res, next) => {
  try {
    const { planId, feedback } = req.body
    
    // TODO: Implement plan adjustment logic
    // For now, return success
    res.json({ message: 'Plan adjustment feature coming soon!' })
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
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const totalMilestones = plan.modules.reduce(
      (acc, module) => acc + module.milestones.length,
      0
    )
    const completedMilestones = plan.modules.reduce(
      (acc, module) =>
        acc + module.milestones.filter((m) => m.completedAt).length,
      0
    )

    res.json({
      planId: plan.id,
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      milestonesCompleted: completedMilestones,
      totalMilestones,
      timeStudied: '0 hours',
      streakStatus: { current: 0, changed: false },
      insights:
        completedMilestones > 0
          ? ['Great progress! Keep it up!']
          : ['Start with small milestones to build momentum'],
      recommendations:
        completedMilestones < totalMilestones
          ? ['Try to complete at least one milestone per day']
          : ['Consider advancing to the next module'],
    })
  } catch (error) {
    next(error)
  }
})

// GET /ai/context - Get user's plan context for AI
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
              orderBy: { order: 'asc' },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const activePlan = user.plans[0]
    const totalMilestones =
      activePlan?.modules.reduce(
        (acc, module) => acc + module.milestones.length,
        0
      ) || 0

    const completedMilestones =
      activePlan?.modules.reduce(
        (acc, module) =>
          acc + module.milestones.filter((m) => m.completedAt).length,
        0
      ) || 0

    const progressPercentage =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0

    const context = {
      user: {
        name: user.name,
        level: user.level,
        xp: user.xp,
        currentStreak: user.currentStreak,
      },
      plan: activePlan
        ? {
            title: activePlan.title,
            goal: activePlan.goal,
            progress: progressPercentage,
            totalMilestones,
            completedMilestones,
            modules: activePlan.modules.map((m) => ({
              title: m.title,
              status: m.status,
              milestones: m.milestones.map((ms) => ({
                title: ms.title,
                completed: !!ms.completedAt,
              })),
            })),
          }
        : null,
      recentActivities: user.activities.slice(0, 5).map((a) => ({
        type: a.type,
        createdAt: a.createdAt,
        metadata: a.metadata,
      })),
    }

    res.json(context)
  } catch (error) {
    next(error)
  }
})

// POST /ai/analyze-progress - Analyze user progress
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
              orderBy: { order: 'asc' },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
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
      (acc, module) =>
        acc + module.milestones.filter((m) => m.completedAt).length,
      0
    )

    const progressPercentage =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0

    const milestoneCompletionRate = completedMilestones / totalMilestones || 0
    const daysSinceCreation =
      (Date.now() - new Date(user.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
    const xpPerDay = user.xp / (daysSinceCreation || 1)
    const projectedLevel = Math.floor(user.xp / 1000) + 1
    const needsMotivation =
      progressPercentage < 30 && completedMilestones < totalMilestones * 0.5

    const analysis = {
      progress: {
        percentage: progressPercentage,
        completed: completedMilestones,
        total: totalMilestones,
      },
      pace: {
        xpPerDay: Math.round(xpPerDay * 10) / 10,
        projectedLevel,
        onTrack: milestoneCompletionRate > 0.5,
      },
      recommendations: [
        milestoneCompletionRate < 0.3
          ? "¡Vamos! Completá los primeros hitos para ganar impulso."
          : "¡Gran progreso! Seguí así.",
      ],
      motivation: needsMotivation
        ? "Noto que podrías necesitar un impulso. ¿Qué te parece si completás un hito hoy?"
        : "¡Excelente ritmo! Seguí así.",
    }

    await prisma.activity.create({
      data: {
        userId,
        type: 'PLAN_ADJUSTED',
        metadata: {
          action: 'progress_analyzed',
          progress: progressPercentage,
        },
      },
    })

    res.json(analysis)
  } catch (error) {
    next(error)
  }
})

export { router as aiRouter }
