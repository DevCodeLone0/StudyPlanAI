import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

// POST /streaks/check
router.post('/check', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId
    const now = new Date()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lastActiveAt: true,
        currentStreak: true,
        longestStreak: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const lastActive = user.lastActiveAt
    let streakUpdated = false
    let streakBroken = false

    if (!lastActive) {
      // First activity - start streak at 1
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveAt: now,
          currentStreak: 1,
          longestStreak: 1,
        },
      })

      await prisma.activity.create({
        data: {
          userId,
          type: 'STREAK_MAINTENED',
          metadata: { streak: 1 },
        },
      })

      streakUpdated = true
    } else {
      // Calculate time difference in hours
      const diffHours = Math.abs(now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)

      if (diffHours < 24) {
        // Same day - streak maintained, no change needed
        res.json({
          streakMaintained: true,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          lastActiveAt: user.lastActiveAt,
        })
        return
      } else if (diffHours >= 24 && diffHours < 48) {
        // Next day - increment streak
        const newStreak = user.currentStreak + 1
        const newLongest = Math.max(newStreak, user.longestStreak)

        await prisma.user.update({
          where: { id: userId },
          data: {
            lastActiveAt: now,
            currentStreak: newStreak,
            longestStreak: newLongest,
          },
        })

        await prisma.activity.create({
          data: {
            userId,
            type: 'STREAK_MAINTENED',
            metadata: { streak: newStreak },
          },
        })

        streakUpdated = true
      } else {
        // Streak broken (more than 48 hours)
        await prisma.user.update({
          where: { id: userId },
          data: {
            lastActiveAt: now,
            currentStreak: 1,
          },
        })

        await prisma.activity.create({
          data: {
            userId,
            type: 'STREAK_BROKEN',
            metadata: {
              previousStreak: user.currentStreak,
              longestStreak: user.longestStreak,
            },
          },
        })

        streakBroken = true
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lastActiveAt: true,
        currentStreak: true,
        longestStreak: true,
      },
    })

    res.json({
      streakUpdated,
      streakBroken,
      currentStreak: updatedUser!.currentStreak,
      longestStreak: updatedUser!.longestStreak,
      lastActiveAt: updatedUser!.lastActiveAt,
    })
  } catch (error) {
    next(error)
  }
})

// GET /streaks/history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const streakActivities = await prisma.activity.findMany({
      where: {
        userId,
        type: { in: ['STREAK_MAINTENED', 'STREAK_BROKEN'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    res.json(streakActivities)
  } catch (error) {
    next(error)
  }
})

export { router as streakRouter }
