import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError, BadRequestError, ConflictError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /rewards
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const rewards = await prisma.reward.findMany({
      orderBy: { cost: 'asc' },
    })

    const purchasedRewards = await prisma.userReward.findMany({
      where: { userId },
      select: { rewardId: true },
    })

    const purchasedRewardIds = new Set(purchasedRewards.map((ur) => ur.rewardId))

    const rewardsWithStatus = rewards.map((reward) => ({
      ...reward,
      purchased: purchasedRewardIds.has(reward.id),
    }))

    res.json(rewardsWithStatus)
  } catch (error) {
    next(error)
  }
})

// GET /rewards/purchased
router.get('/purchased', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const userRewards = await prisma.userReward.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { purchasedAt: 'desc' },
    })

    res.json(userRewards)
  } catch (error) {
    next(error)
  }
})

// POST /rewards/:id/purchase
router.post('/:id/purchase', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const reward = await prisma.reward.findUnique({
      where: { id },
    })

    if (!reward) {
      throw new NotFoundError('Reward')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        xp: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    if (user.xp < reward.cost) {
      throw new BadRequestError('Insufficient XP to purchase this reward')
    }

    const existingPurchase = await prisma.userReward.findUnique({
      where: {
        userId_rewardId: {
          userId,
          rewardId: id,
        },
      },
    })

    if (existingPurchase) {
      throw new ConflictError('Reward already purchased')
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: { decrement: reward.cost },
        },
      }),
      prisma.userReward.create({
        data: {
          userId,
          rewardId: id,
        },
      }),
    ])

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        xp: true,
        level: true,
      },
    })

    res.json({
      message: 'Reward purchased successfully',
      reward,
      remainingXp: updatedUser!.xp,
      level: updatedUser!.level,
    })
  } catch (error) {
    next(error)
  }
})

export { router as rewardRouter }
