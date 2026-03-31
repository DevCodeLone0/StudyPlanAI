import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

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

		// First get user data
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				xp: true,
				level: true,
				currentStreak: true,
				longestStreak: true,
			},
		})

		if (!user) {
			throw new NotFoundError('User')
		}

		const [
			planCount,
			milestoneStats,
			badgeCount,
			modulesCompleted,
			completedMilestones,
			totalUsers,
			usersWithLessXP,
		] = await Promise.all([
			prisma.plan.count({ where: { userId } }),
			prisma.milestone.aggregate({
				where: { module: { plan: { userId } } },
				_count: { _all: true },
			}),
			prisma.userBadge.count({ where: { userId } }),
			prisma.module.count({
				where: {
					plan: { userId },
					status: 'COMPLETED',
				},
			}),
			prisma.milestone.count({
				where: {
					module: { plan: { userId } },
					completedAt: { not: null },
				},
			}),
			prisma.user.count(),
			prisma.user.count({
				where: { xp: { lt: user.xp } },
			}),
		])

		// Calculate percentile (what percentage of users have less XP)
		const percentile = totalUsers > 1 ? Math.round((usersWithLessXP / (totalUsers - 1)) * 100) : 100

		res.json({
			xp: user.xp,
			level: user.level,
			currentStreak: user.currentStreak,
			longestStreak: user.longestStreak,
			plansCount: planCount,
			completedMilestones,
			totalMilestones: milestoneStats._count._all,
			badgesCount: badgeCount,
			modulesCompleted,
			percentile,
		})
	} catch (error) {
		next(error)
	}
})

export { router as userRouter }
