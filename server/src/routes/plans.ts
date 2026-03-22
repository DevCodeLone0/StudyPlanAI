import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// GET /plans
router.get('/', authenticate, async (req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { userId: req.user!.userId },
      include: {
        modules: {
          include: {
            milestones: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    res.json(plans)
  } catch (error) {
    next(error)
  }
})

// GET /plans/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        modules: {
          include: {
            milestones: {
              include: {
                resources: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })
    
    if (!plan) {
      throw new NotFoundError('Plan')
    }
    
    res.json(plan)
  } catch (error) {
    next(error)
  }
})

// POST /plans/:id/activate
router.post('/:id/activate', authenticate, async (req, res, next) => {
  try {
    // Deactivate current active plan
    await prisma.plan.updateMany({
      where: {
        userId: req.user!.userId,
        isActive: true,
      },
      data: { isActive: false },
    })
    
    // Activate selected plan
    const plan = await prisma.plan.update({
      where: { id: req.params.id },
      data: {
        isActive: true,
        status: 'ACTIVE',
      },
      include: {
        modules: {
          include: { milestones: true },
          orderBy: { order: 'asc' },
        },
      },
    })
    
    res.json(plan)
  } catch (error) {
    next(error)
  }
})

// POST /plans/:id/modules
router.post('/:id/modules', authenticate, async (req, res, next) => {
  try {
    const { title, description, order } = req.body
    
    const module = await prisma.module.create({
      data: {
        title,
        description,
        order: order || 1,
        planId: req.params.id,
      },
      include: { milestones: true },
    })
    
    res.status(201).json(module)
  } catch (error) {
    next(error)
  }
})

// PATCH /modules/:id
router.patch('/modules/:id', authenticate, async (req, res, next) => {
  try {
    const module = await prisma.module.update({
      where: { id: req.params.id },
      data: req.body,
      include: { milestones: true },
    })
    
    res.json(module)
  } catch (error) {
    next(error)
  }
})

// POST /modules/:moduleId/milestones
router.post('/modules/:moduleId/milestones', authenticate, async (req, res, next) => {
  try {
    const { title, description, order, xpReward, dueDate } = req.body
    
    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        order: order || 1,
        xpReward: xpReward || 50,
        dueDate: dueDate ? new Date(dueDate) : null,
        moduleId: req.params.moduleId,
      },
    })
    
    res.status(201).json(milestone)
  } catch (error) {
    next(error)
  }
})

// POST /milestones/:id/complete
router.post('/milestones/:id/complete', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId
    
    // Get milestone and verify ownership
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: req.params.id,
        module: {
          plan: { userId },
        },
      },
      include: {
        module: {
          include: { plan: true },
        },
      },
    })
    
    if (!milestone) {
      throw new NotFoundError('Milestone')
    }
    
    // Update milestone
    await prisma.milestone.update({
      where: { id: req.params.id },
      data: { completedAt: new Date() },
    })
    
    // Update user XP
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: milestone.xpReward },
      },
    })
    
    // Check for level up
    const oldLevel = milestone.module.plan.userId ? Math.floor(user.xp / 1000) + 1 : 1
    
    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'MILESTONE_COMPLETED',
        metadata: {
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          xpEarned: milestone.xpReward,
        },
      },
    })
    
    res.json({
      milestone,
      xpEarned: milestone.xpReward,
      totalXp: user.xp,
      levelUp: false, // TODO: Implement level up logic
      newBadge: null,
      streakUpdated: {
        current: user.currentStreak,
        longest: user.longestStreak,
      },
    })
  } catch (error) {
    next(error)
  }
})

export { router as planRouter }
