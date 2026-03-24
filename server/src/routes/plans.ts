import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const updatePlanSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  goal: z.string().optional(),
  duration: z.string().optional(),
  dailyTime: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
})

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

// PATCH /plans/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const data = updatePlanSchema.parse(req.body)

    const plan = await prisma.plan.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const updated = await prisma.plan.update({
      where: { id: req.params.id },
      data,
      include: {
        modules: {
          include: { milestones: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// DELETE /plans/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    await prisma.plan.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Plan deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// GET /plans/:id/history
router.get('/:id/history', authenticate, async (req, res, next) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const versions = await prisma.planVersion.findMany({
      where: { planId: req.params.id },
      orderBy: { version: 'desc' },
    })

    res.json(versions)
  } catch (error) {
    next(error)
  }
})

// POST /plans/:planId/restore/:version
router.post('/:planId/restore/:version', authenticate, async (req, res, next) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.user!.userId,
      },
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const planVersion = await prisma.planVersion.findFirst({
      where: {
        planId: req.params.planId,
        version: Number(req.params.version),
      },
    })

    if (!planVersion) {
      throw new NotFoundError('Plan version')
    }

    const restored = await prisma.plan.update({
      where: { id: req.params.planId },
      data: {
        version: { increment: 1 },
      },
      include: {
        modules: {
          include: { milestones: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    res.json(restored)
  } catch (error) {
    next(error)
  }
})

// POST /plans/:planId/modules/reorder
router.post('/:planId/modules/reorder', authenticate, async (req, res, next) => {
  try {
    const { moduleIds } = req.body as { moduleIds: string[] }

    if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
      throw new BadRequestError('moduleIds must be a non-empty array')
    }

    const plan = await prisma.plan.findFirst({
      where: {
        id: req.params.planId,
        userId: req.user!.userId,
      },
    })

    if (!plan) {
      throw new NotFoundError('Plan')
    }

    const updates = moduleIds.map((moduleId, index) =>
      prisma.module.update({
        where: { id: moduleId },
        data: { order: index + 1 },
      })
    )

    await prisma.$transaction(updates)

    const updatedModules = await prisma.module.findMany({
      where: { planId: req.params.planId },
      orderBy: { order: 'asc' },
      include: { milestones: true },
    })

    res.json(updatedModules)
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

// DELETE /resources/:id
router.delete('/resources/:id', authenticate, async (req, res, next) => {
  try {
    const resource = await prisma.resource.findFirst({
      where: {
        id: req.params.id,
        milestone: {
          module: {
            plan: { userId: req.user!.userId },
          },
        },
      },
    })

    if (!resource) {
      throw new NotFoundError('Resource')
    }

    await prisma.resource.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export { router as planRouter }
