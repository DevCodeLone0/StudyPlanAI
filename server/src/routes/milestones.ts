import { Router } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  xpReward: z.number().optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : null),
})

// GET /milestones/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: req.params.id,
        module: {
          plan: { userId: req.user!.userId },
        },
      },
      include: {
        module: {
          include: { plan: true },
        },
        resources: true,
      },
    })

    if (!milestone) {
      throw new NotFoundError('Milestone')
    }

    res.json(milestone)
  } catch (error) {
    next(error)
  }
})

// PATCH /milestones/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const data = updateMilestoneSchema.parse(req.body)

    const milestone = await prisma.milestone.update({
      where: { id: req.params.id },
      data,
      include: { resources: true },
    })

    res.json(milestone)
  } catch (error) {
    next(error)
  }
})

// DELETE /milestones/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const existing = await prisma.milestone.findFirst({
      where: {
        id: req.params.id,
        module: {
          plan: { userId: req.user!.userId },
        },
      },
    })

    if (!existing) {
      throw new NotFoundError('Milestone')
    }

    await prisma.milestone.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Milestone deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// POST /milestones/:id/complete
router.post('/:id/complete', authenticate, async (req, res, next) => {
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

    if (milestone.completedAt) {
      return res.json({
        message: 'Milestone already completed',
        milestone,
      })
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

    // Calculate level (1000 XP per level)
    const newLevel = Math.floor(user.xp / 1000) + 1
    const currentLevel = Math.floor((user.xp - milestone.xpReward) / 1000) + 1
    const leveledUp = newLevel > currentLevel

    if (leveledUp) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      })

      await prisma.activity.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          metadata: { newLevel, totalXp: user.xp },
        },
      })
    }

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
      milestone: { ...milestone, completedAt: new Date() },
      xpEarned: milestone.xpReward,
      totalXp: user.xp,
      levelUp: leveledUp,
      newLevel: leveledUp ? newLevel : null,
      newBadge: null, // TODO: Check for badge unlocks
      streakUpdated: {
        current: user.currentStreak,
        longest: user.longestStreak,
      },
    })
  } catch (error) {
    next(error)
  }
})

// POST /milestones/:id/resources
router.post('/:id/resources', authenticate, async (req, res, next) => {
  try {
    const { type, title, url, content } = req.body

    // Verify ownership
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: req.params.id,
        module: {
          plan: { userId: req.user!.userId },
        },
      },
    })

    if (!milestone) {
      throw new NotFoundError('Milestone')
    }

    const resource = await prisma.resource.create({
      data: {
        type,
        title,
        url,
        content,
        milestoneId: req.params.id,
      },
    })

    res.status(201).json(resource)
  } catch (error) {
    next(error)
  }
})

export { router as milestoneRouter }
