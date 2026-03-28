import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { NotFoundError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

// DELETE /resources/:id
router.delete('/:id', authenticate, async (req, res, next) => {
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

export { router as resourceRouter }
