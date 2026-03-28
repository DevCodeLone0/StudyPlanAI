import { prisma } from '../lib/prisma.js'

export interface BadgeCheckResult {
  unlocked: boolean
  badgeId?: string
  badgeName?: string
}

export async function checkAndUnlockBadges(userId: string): Promise<BadgeCheckResult[]> {
  const results: BadgeCheckResult[] = []

  // Get user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      xp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
    },
  })

  if (!user) {
    return results
  }

  // Get completed milestones count
  const completedMilestones = await prisma.milestone.count({
    where: {
      module: { plan: { userId } },
      completedAt: { not: null },
    },
  })

  // Get completed plans count
  const completedPlans = await prisma.plan.count({
    where: {
      userId,
      status: 'COMPLETED',
    },
  })

  // Get already earned badges
  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badgeId))

  // Check each badge
  const badges = await prisma.badge.findMany()

  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) {
      continue
    }

    let unlocked = false

    switch (badge.code) {
      case 'FIRST_STEPS':
        unlocked = completedMilestones >= 1
        break

      case 'WEEK_WARRIOR':
        unlocked = user.longestStreak >= 7
        break

      case 'MONTH_MASTER':
        unlocked = user.longestStreak >= 30
        break

      case 'LEVEL_UP_5':
        unlocked = user.level >= 5
        break

      case 'LEVEL_UP_10':
        unlocked = user.level >= 10
        break

      case 'PLAN_MASTER':
        unlocked = completedPlans >= 1
        break

      case 'MILESTONE_10':
        unlocked = completedMilestones >= 10
        break

      case 'MILESTONE_50':
        unlocked = completedMilestones >= 50
        break

      default:
        unlocked = false
    }

    if (unlocked) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      })

      await prisma.activity.create({
        data: {
          userId,
          type: 'BADGE_EARNED',
          metadata: {
            badgeId: badge.id,
            badgeCode: badge.code,
            badgeName: badge.name,
          },
        },
      })

      results.push({
        unlocked: true,
        badgeId: badge.id,
        badgeName: badge.name,
      })
    }
  }

  return results
}

export async function getBadgesForUser(userId: string) {
  const badges = await prisma.badge.findMany({
    orderBy: { code: 'asc' },
  })

  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  })

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId))

  return badges.map((badge) => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.id),
    earnedAt: userBadges.find((ub) => ub.badgeId === badge.id)?.earnedAt || null,
  }))
}
