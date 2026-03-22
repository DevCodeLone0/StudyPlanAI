import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// GET /users/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    })
    
    if (!user) {
      throw new NotFoundError('User')
    }
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// PATCH /users/me
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body
    
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    })
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// GET /users/me/stats
router.get('/me/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId
    
    const [user, planCount, completedMilestones, badgeCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xp: true,
          level: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),
      prisma.plan.count({ where: { userId } }),
      prisma.milestone.count({
        where: {
          module: { plan: { userId } },
          completedAt: { not: null },
        },
      }),
      prisma.userBadge.count({ where: { userId } }),
    ])
    
    res.json({
      xp: user?.xp || 0,
      level: user?.level || 1,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      plansCount: planCount,
      completedMilestones,
      badgesCount: badgeCount,
    })
  } catch (error) {
    next(error)
  }
})

export { router as userRouter }
