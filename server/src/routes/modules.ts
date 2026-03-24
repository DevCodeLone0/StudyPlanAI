import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const createModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
})

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  status: z.enum(['LOCKED', 'IN_PROGRESS', 'COMPLETED']).optional(),
})

// GET /modules/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const module = await prisma.module.findFirst({
      where: {
        id: req.params.id,
        plan: { userId: req.user!.userId },
      },
      include: {
        milestones: {
          include: { resources: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!module) {
      throw new NotFoundError('Module')
    }

    res.json(module)
  } catch (error) {
    next(error)
  }
})

// PATCH /modules/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const data = updateModuleSchema.parse(req.body)

    const module = await prisma.module.update({
      where: { id: req.params.id },
      data,
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    })

    res.json(module)
  } catch (error) {
    next(error)
  }
})

// DELETE /modules/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    // Verify ownership
    const existing = await prisma.module.findFirst({
      where: {
        id: req.params.id,
        plan: { userId: req.user!.userId },
      },
    })

    if (!existing) {
      throw new NotFoundError('Module')
    }

    await prisma.module.delete({
      where: { id: req.params.id },
    })

    res.json({ message: 'Module deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// GET /modules/:moduleId/milestones
router.get('/:moduleId/milestones', authenticate, async (req, res, next) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: {
        moduleId: req.params.moduleId,
        module: {
          plan: { userId: req.user!.userId },
        },
      },
      include: { resources: true },
      orderBy: { order: 'asc' },
    })

    res.json(milestones)
  } catch (error) {
    next(error)
  }
})

// POST /modules/:moduleId/milestones
router.post('/:moduleId/milestones', authenticate, async (req, res, next) => {
  try {
    const data = createModuleSchema.merge(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      order: z.number().optional(),
      xpReward: z.number().optional(),
      dueDate: z.string().optional(),
    })).parse(req.body)

    // Verify module ownership
    const module = await prisma.module.findFirst({
      where: {
        id: req.params.moduleId,
        plan: { userId: req.user!.userId },
      },
    })

    if (!module) {
      throw new NotFoundError('Module')
    }

    const milestone = await prisma.milestone.create({
      data: {
        title: data.title,
        description: data.description,
        order: data.order || 1,
        xpReward: data.xpReward || 50,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        moduleId: req.params.moduleId,
      },
    })

    res.status(201).json(milestone)
  } catch (error) {
    next(error)
  }
})

export { router as moduleRouter }
