import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { initializeDatabase, checkDatabaseHealth } from './config/database'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'
import habitRoutes from './routes/habit.routes'
import userRoutes from './routes/user.routes'
import pomodoroRoutes from './routes/pomodoro.routes'
import reminderRoutes from './routes/reminder.routes'
import healthRoutes from './routes/health.routes'

// Import middleware
import { errorHandler } from './middlewares/errorHandler'
import { authenticate } from './middlewares/auth'

// Initialize Prisma Client
export let prisma: PrismaClient

// Initialize database
const initDatabase = async () => {
  try {
    prisma = await initializeDatabase()
    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    // Fallback to in-memory SQLite for Vercel
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:memory:?cache=shared'
        }
      }
    })
    console.log('🔄 Using in-memory SQLite as fallback')
  }
}

// Initialize database on startup
initDatabase()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Para Vercel, necesitamos exportar el app
if (process.env.NODE_ENV === 'production') {
  module.exports = app
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  }
}))

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth()
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'NeuroAsistente TDAH API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

// Demo endpoint for Vercel
app.get('/api/demo', (req, res) => {
  res.json({
    message: '¡NeuroAsistente TDAH funcionando en Vercel!',
    features: [
      'Autenticación JWT',
      'Gestión de tareas',
      'Seguimiento de hábitos',
      'Temporizador Pomodoro',
      'PWA instalable'
    ],
    docs: 'https://github.com/cuervoc-openclaw/TDAH-DASHBOARD',
    deploy: 'Vercel + GitHub Actions',
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', authenticate, taskRoutes)
app.use('/api/habits', authenticate, habitRoutes)
app.use('/api/user', authenticate, userRoutes)
app.use('/api/pomodoro', authenticate, pomodoroRoutes)
app.use('/api/reminders', authenticate, reminderRoutes)

// Health check (sin autenticación)
app.use(healthRoutes);

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 NeuroAsistente TDAH API iniciada
📍 Puerto: ${PORT}
📅 ${new Date().toLocaleString()}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
🔗 Health check: http://localhost:${PORT}/health
  `)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received: closing HTTP server...')
  server.close(async () => {
    console.log('HTTP server closed')
    await prisma.$disconnect()
    console.log('Prisma connection closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('SIGINT received: closing HTTP server...')
  server.close(async () => {
    console.log('HTTP server closed')
    await prisma.$disconnect()
    console.log('Prisma connection closed')
    process.exit(0)
  })
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

export default app