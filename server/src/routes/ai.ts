import { Router } from 'express'
import axios from 'axios'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

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
