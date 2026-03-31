import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError } from '../middleware/errorHandler.js'

const router = Router()
const prisma = new PrismaClient()

// GET /gamification/badges - Get all available badges
router.get('/badges', authenticate, async (req, res, next) => {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        users: {
          where: { userId: req.user!.userId },
        },
      },
    })

    const userBadges = badges.map((badge) => ({
      ...badge,
      earned: badge.users.length > 0,
      earnedAt: badge.users[0]?.earnedAt,
    }))

    res.json(userBadges)
  } catch (error) {
    next(error)
  }
})

// GET /gamification/progress - Get user's gamification progress
router.get('/progress', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: {
            badge: true,
          },
        },
        plans: {
          where: { isActive: true },
          include: {
            modules: {
              include: { milestones: true },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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

    res.json({
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      badges: user.badges.map((b) => ({
        code: b.badge.code,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        earnedAt: b.earnedAt,
      })),
      progress: {
        completedMilestones,
        totalMilestones,
        percentage:
          totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0,
      },
      recentActivities: user.activities.map((a) => ({
        type: a.type,
        createdAt: a.createdAt,
        metadata: a.metadata,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// POST /gamification/check-badges - Check and award badges
router.post('/check-badges', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        plans: {
          include: {
            modules: {
              include: { milestones: true },
            },
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const earnedBadgeIds = user.badges.map((b) => b.badgeId)
    const allBadges = await prisma.badge.findMany()
    const newBadges: any[] = []

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue

      const requirement = badge.requirement as any
      let shouldAward = false

      if (requirement.type === 'xp') {
        shouldAward = user.xp >= requirement.value
      } else if (requirement.type === 'milestones') {
        const totalMilestones = user.plans.reduce(
          (acc, plan) =>
            acc +
            plan.modules.reduce(
              (a, m) =>
                a +
                m.milestones.filter((ms) => ms.completedAt).length,
              0
            ),
          0
        )
        shouldAward = totalMilestones >= requirement.value
      } else if (requirement.type === 'streak') {
        shouldAward = user.currentStreak >= requirement.value
      }

      if (shouldAward) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        })

        newBadges.push({
          code: badge.code,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
        })
      }
    }

    res.json({
      newBadges,
      message:
        newBadges.length > 0
          ? `¡Felicidades! Ganaste ${newBadges.length} nueva(s) medalla(s).`
          : 'No hay nuevas medallas por ahora.',
    })
  } catch (error) {
    next(error)
  }
})

// POST /gamification/daily-challenge - Get daily challenge
router.post('/daily-challenge', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingChallenge = await prisma.activity.findFirst({
      where: {
        userId,
        type: 'MILESTONE_COMPLETED',
        createdAt: {
          gte: today,
        },
      },
    })

    const challenge = {
      title: 'Completá un hito hoy',
      description: 'Completá cualquier hito de tu plan para ganar 50 XP extra',
      xpReward: 50,
      completed: !!existingChallenge,
    }

    res.json(challenge)
  } catch (error) {
    next(error)
  }
})

export { router as gamificationRouter }
