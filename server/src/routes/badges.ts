import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'
import { checkAndUnlockBadges, getBadgesForUser } from '../services/badgeService.js'

const router = Router()

const shareBadgeSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'whatsapp']),
})

// GET /badges
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const badges = await getBadgesForUser(userId)

    res.json(badges)
  } catch (error) {
    next(error)
  }
})

// GET /badges/earned
router.get('/earned', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    })

    res.json(userBadges)
  } catch (error) {
    next(error)
  }
})

// POST /badges/:id/share
router.post('/:id/share', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const data = shareBadgeSchema.parse(req.body)

    const userBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: id,
      },
      include: { badge: true },
    })

    if (!userBadge) {
      throw new NotFoundError('Badge not earned')
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=Just earned the ${userBadge.badge.name} badge on StudyPlanAI! 🎉&url=https://studyplan.ai`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://studyplan.ai`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=https://studyplan.ai&quote=Just earned the ${userBadge.badge.name} badge on StudyPlanAI!`,
      whatsapp: `https://wa.me/?text=Just earned the ${userBadge.badge.name} badge on StudyPlanAI! 🎉 https://studyplan.ai`,
    }

    res.json({
      shareUrl: shareUrls[data.platform],
      badge: userBadge.badge,
    })
  } catch (error) {
    next(error)
  }
})

// POST /badges/check
router.post('/check', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const unlockedBadges = await checkAndUnlockBadges(userId)

    res.json({
      unlockedBadges,
      count: unlockedBadges.length,
    })
  } catch (error) {
    next(error)
  }
})

export { router as badgeRouter }
