import { describe, it, expect } from 'vitest'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import request from 'supertest'
import { Request, Response } from 'express'

// Create a simple test app with health endpoint
function createTestApp() {
  const app = express()
  
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }))
  
  app.use(cors({
    origin: true,
    credentials: true,
  }))
  
  app.use(express.json())
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
  
  return app
}

describe('Health Endpoint', () => {
  const app = createTestApp()

  it('should return status ok on /health', async () => {
    const response = await request(app).get('/health')
    
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.timestamp).toBeDefined()
  })

  it('should return valid ISO timestamp', async () => {
    const response = await request(app).get('/health')
    
    const timestamp = new Date(response.body.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.getTime()).not.toBeNaN()
  })
})
