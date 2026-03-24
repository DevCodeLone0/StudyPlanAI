import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { BadRequestError, UnauthorizedError } from '../middleware/errorHandler.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

function generateTokens(user: { id: string; email: string; role: string }) {
  const secret = process.env.JWT_SECRET || 'dev-secret'
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
  
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    refreshSecret,
    { expiresIn: '7d' }
  )
  
  return { accessToken, refreshToken }
}

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)
    
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })
    
    if (existing) {
      throw new BadRequestError('Email already registered')
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
    })
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user)
    
    // Save refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        userId: user.id,
      },
    })
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      accessToken,
    })
  } catch (error) {
    next(error)
  }
})

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }
    
    const validPassword = await bcrypt.compare(data.password, user.passwordHash)
    
    if (!validPassword) {
      throw new UnauthorizedError('Invalid email or password')
    }
    
    const { accessToken, refreshToken } = generateTokens(user)
    
    // Save refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        userId: user.id,
      },
    })
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      accessToken,
    })
  } catch (error) {
    next(error)
  }
})

// POST /auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      
      // Delete refresh token
      await prisma.refreshToken.deleteMany({
        where: { token },
      })
    }
    
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
})

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required')
    }
    
    // Verify refresh token exists and not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }
    
    // Generate new tokens
    const tokens = generateTokens(storedToken.user)
    
    // Rotate refresh token: delete old, create new
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    })
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        expiresAt,
        userId: storedToken.user.id,
      },
    })
    
    res.json({
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        role: storedToken.user.role,
        xp: storedToken.user.xp,
        level: storedToken.user.level,
        currentStreak: storedToken.user.currentStreak,
        longestStreak: storedToken.user.longestStreak,
      },
      accessToken: tokens.accessToken,
    })
  } catch (error) {
    next(error)
  }
})

export { router as authRouter }
