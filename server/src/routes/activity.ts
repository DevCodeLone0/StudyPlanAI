import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const historyQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || '1')),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || '20'), 100)),
  type: z.string().optional(),
})

// GET /activity/calendar
router.get('/calendar', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const calendarData: Record<string, Record<string, number>> = {}

    for (const activity of activities) {
      const dateKey = activity.createdAt.toISOString().split('T')[0]

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {}
      }

      if (!calendarData[dateKey][activity.type]) {
        calendarData[dateKey][activity.type] = 0
      }

      calendarData[dateKey][activity.type]++
    }

    const result = Object.entries(calendarData).map(([date, types]) => {
      const entries = Object.entries(types)
      const total = entries.reduce((sum, [, count]) => sum + count, 0)

      return {
        date,
        count: total,
        types: entries.map(([type, count]) => ({ type, count })),
      }
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

// GET /activity/history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId

    const query = historyQuerySchema.parse(req.query)

    const where: any = { userId }

    if (query.type) {
      where.type = query.type
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.activity.count({ where }),
    ])

    res.json({
      activities,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

export { router as activityRouter }
