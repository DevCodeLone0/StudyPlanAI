import { Router } from 'express'
import axios from 'axios'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { getAIContext, buildTutorSystemPrompt, parseSentiment } from '../services/aiContextService.js'

const router = Router()

// AI Configuration - supports both OpenRouter and NVIDIA NIM
const AI_CONFIG = {
  // NVIDIA NIM API (default)
  nvidia: {
    baseUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: process.env.NVIDIA_API_KEY,
    model: process.env.AI_MODEL || 'z-ai/glm5',
  },
  // OpenRouter API (alternative)
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.AI_MODEL || 'meta-llama/llama-3-8b-instruct',
  },
}

// Determine which provider to use
const getAIConfig = () => {
  if (process.env.NVIDIA_API_KEY) {
    console.log('🤖 AI Provider: NVIDIA NIM')
    console.log('📦 Model:', process.env.AI_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct')
    return AI_CONFIG.nvidia
  }
  if (process.env.OPENROUTER_API_KEY) {
    console.log('🤖 AI Provider: OpenRouter')
    return AI_CONFIG.openrouter
  }
  console.log('⚠️ No AI API key configured!')
  return null // No API key configured
}

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
    
    // Call AI API
    const aiConfig = getAIConfig()
    
    if (!aiConfig) {
      throw new Error('No AI API key configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY')
    }

    const response = await axios.post(
      aiConfig.baseUrl,
      {
        model: aiConfig.model,
        messages: [
          { role: 'system', content: 'You are a helpful curriculum designer.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${aiConfig.apiKey}`,
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
      }
    }
    
    // Save plan to database
    const savedPlan = await prisma.plan.create({
      data: {
        title: planData.title || goal,
        description: planData.description,
        goal,
        duration,
        dailyTime,
        status: 'DRAFT',
        isActive: false,
        userId: req.user!.userId,
        modules: {
          create: planData.modules?.map((mod: any, modIndex: number) => ({
            title: mod.title,
            description: mod.description,
            order: modIndex + 1,
            status: 'LOCKED',
            milestones: {
              create: mod.milestones?.map((ms: any, msIndex: number) => ({
                title: ms.title,
                description: ms.description,
                order: msIndex + 1,
                xpReward: 50,
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        modules: {
          include: {
            milestones: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    res.json({
      plan: savedPlan,
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  } catch (error: any) {
    console.error('AI generation error:', error.response?.data || error.message)
    
    // Get goal from body in case of error
    const { goal: errorGoal, duration: errorDuration, dailyTime: errorDailyTime } = req.body
    
    // Return a mock plan if API fails (for development)
    const mockPlanData = {
      title: errorGoal || 'My Study Plan',
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
    }

    // Save mock plan to database
    const savedMockPlan = await prisma.plan.create({
      data: {
        title: mockPlanData.title,
        goal: errorGoal || 'Study Plan',
        duration: errorDuration || '3 months',
        dailyTime: errorDailyTime || '1 hour',
        status: 'DRAFT',
        isActive: false,
        userId: req.user!.userId,
        modules: {
          create: mockPlanData.modules.map((mod: any, modIndex: number) => ({
            title: mod.title,
            description: mod.description,
            order: modIndex + 1,
            status: 'LOCKED',
            milestones: {
              create: mod.milestones.map((ms: any, msIndex: number) => ({
                title: ms.title,
                description: ms.description,
                order: msIndex + 1,
                xpReward: 50,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: {
            milestones: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    res.json({
      plan: savedMockPlan,
      estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }
})

// GET /ai/context - Get user's AI context
router.get('/context', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId
    const context = await getAIContext(userId)
    res.json(context)
  } catch (error) {
    next(error)
  }
})

// POST /ai/chat
router.post('/chat', authenticate, async (req, res, next) => {
  console.log('📩 AI Chat request received:', req.body.message?.substring(0, 50))

  try {
    const { message } = req.body
    const userId = req.user!.userId

    const aiConfig = getAIConfig()

    if (!aiConfig) {
      console.log('❌ No AI config available')
      return res.json({
        message: "I'm here to help with your studies! However, the AI service is not configured. Please contact the administrator to set up the AI API key.",
      })
    }

    // Fetch context for the user
    console.log('🔄 Fetching AI context for user:', userId)
    const context = await getAIContext(userId)

    // Build context-aware system prompt
    const systemPrompt = buildTutorSystemPrompt(context)

    console.log('🔄 Calling AI API:', aiConfig.baseUrl)

    const response = await axios.post(
      aiConfig.baseUrl,
      {
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${aiConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ AI API response received')
    const rawReply = response.data.choices[0]?.message?.content || "I'm here to help! Try asking about your current study topic or any concepts you're struggling with."

    // Parse sentiment from response
    const { sentiment, cleanResponse } = parseSentiment(rawReply)

    res.json({
      message: cleanResponse,
      sentiment,
      context: {
        plan: context.plan,
        currentModule: context.currentModule,
        progress: context.progress,
        streak: context.streak,
      },
    })
  } catch (error: any) {
    console.error('❌ AI chat error:', error.response?.data || error.message)

    // Return a fallback response
    res.json({
      message: "I'm having trouble connecting to the AI service right now. Please try again in a moment. 🔧",
      sentiment: null,
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
    // TODO: Implement weekly summary generation
    res.json({
      planId: req.params.planId,
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weekEnd: new Date().toISOString().split('T')[0],
      milestonesCompleted: 0,
      totalMilestones: 0,
      timeStudied: '0 hours',
      streakStatus: { current: 0, changed: false },
      insights: ['Keep up the great work!'],
      recommendations: ['Try to complete at least one milestone per day'],
    })
  } catch (error) {
    next(error)
  }
})

export { router as aiRouter }
