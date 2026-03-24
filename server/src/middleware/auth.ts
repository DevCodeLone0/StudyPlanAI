import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError, ForbiddenError } from './errorHandler.js'
import { prisma } from '../lib/prisma.js'

export interface JWTPayload {
  userId: string
  email: string
  role: 'STUDENT' | 'ADMIN'
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }
    
    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'dev-secret'
    
    const payload = jwt.verify(token, secret) as JWTPayload
    req.user = payload
    
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'))
    } else {
      next(error)
    }
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'ADMIN') {
    next(new ForbiddenError('Admin access required'))
    return
  }
  next()
}
