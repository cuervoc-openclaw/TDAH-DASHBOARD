import { Router } from 'express'
import { prisma } from '../index'
import { authenticate } from '../middlewares/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const router = Router()

// Schema de validación
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().optional()
})

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
})

const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'high-contrast']).optional(),
  fontSize: z.number().min(12).max(24).optional(),
  reduceMotion: z.boolean().optional(),
  notifications: z.object({
    push: z.boolean().optional(),
    email: z.boolean().optional(),
    whatsapp: z.boolean().optional(),
    quietHours: z.boolean().optional(),
    quietStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  }).optional(),
  pomodoro: z.object({
    workDuration: z.number().min(5).max(60).optional(),
    breakDuration: z.number().min(1).max(15).optional(),
    longBreakDuration: z.number().min(10).max(30).optional(),
    longBreakInterval: z.number().min(2).max(8).optional(),
    autoStartBreaks: z.boolean().optional(),
    autoStartPomodoros: z.boolean().optional(),
    soundEnabled: z.boolean().optional()
  }).optional()
})

// GET /api/user/profile - Obtener perfil del usuario
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// PATCH /api/user/profile - Actualizar perfil
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const validatedData = updateProfileSchema.parse(req.body)
    
    // Verificar que el email no esté en uso por otro usuario
    if (validatedData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          id: { not: userId }
        }
      })
      
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está en uso' })
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    res.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      })
    }
    next(error)
  }
})

// PATCH /api/user/password - Cambiar contraseña
router.patch('/password', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const validatedData = updatePasswordSchema.parse(req.body)
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    )
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' })
    }
    
    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    
    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      })
    }
    next(error)
  }
})

// GET /api/user/preferences - Obtener preferencias
router.get('/preferences', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    })
    
    if (!preferences) {
      // Crear preferencias por defecto si no existen
      const defaultPreferences = await prisma.userPreferences.create({
        data: {
          userId,
          theme: 'light',
          fontSize: 16,
          reduceMotion: false,
          notifications: {
            push: true,
            email: false,
            whatsapp: false,
            quietHours: true,
            quietStart: '22:00',
            quietEnd: '08:00'
          },
          pomodoro: {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: true,
            autoStartPomodoros: false,
            soundEnabled: true
          }
        }
      })
      
      return res.json(defaultPreferences)
    }
    
    res.json(preferences)
  } catch (error) {
    next(error)
  }
})

// PATCH /api/user/preferences - Actualizar preferencias
router.patch('/preferences', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const validatedData = updatePreferencesSchema.parse(req.body)
    
    // Verificar si existen preferencias
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId }
    })
    
    let preferences
    if (existingPreferences) {
      // Actualizar preferencias existentes
      preferences = await prisma.userPreferences.update({
        where: { userId },
        data: validatedData
      })
    } else {
      // Crear nuevas preferencias con valores por defecto
      const defaultData = {
        theme: 'light' as const,
        fontSize: 16,
        reduceMotion: false,
        notifications: {
          push: true,
          email: false,
          whatsapp: false,
          quietHours: true,
          quietStart: '22:00',
          quietEnd: '08:00'
        },
        pomodoro: {
          workDuration: 25,
          breakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          autoStartBreaks: true,
          autoStartPomodoros: false,
          soundEnabled: true
        },
        ...validatedData
      }
      
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          ...defaultData
        }
      })
    }
    
    res.json(preferences)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      })
    }
    next(error)
  }
})

// GET /api/user/stats - Estadísticas del usuario
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    // Obtener conteos
    const [
      totalTasks,
      completedTasks,
      totalHabits,
      activeHabits,
      totalPomodoros
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'completed' } }),
      prisma.habit.count({ where: { userId } }),
      prisma.habit.count({ where: { userId, streak: { gt: 0 } } }),
      prisma.pomodoroSession.count({ where: { userId } })
    ])
    
    // Obtener hábitos con mejor racha
    const bestHabits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { bestStreak: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        bestStreak: true,
        color: true
      }
    })
    
    // Obtener tareas recientemente completadas
    const recentCompletedTasks = await prisma.task.findMany({
      where: { 
        userId,
        status: 'completed',
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        priority: true
      }
    })
    
    // Calcular productividad semanal
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    
    const weeklyCompletion = await prisma.task.groupBy({
      by: ['status'],
      where: {
        userId,
        updatedAt: { gte: weekStart }
      },
      _count: true
    })
    
    const weeklyStats = weeklyCompletion.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<string, number>)
    
    res.json({
      overview: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalHabits,
        activeHabits,
        totalPomodoros
      },
      bestHabits,
      recentCompletedTasks,
      weeklyStats,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/user/export - Exportar datos del usuario
router.get('/export', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const [user, tasks, habits, preferences] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          timezone: true,
          avatarUrl: true,
          createdAt: true
        }
      }),
      prisma.task.findMany({
        where: { userId },
        include: {
          subtasks: true
        }
      }),
      prisma.habit.findMany({
        where: { userId },
        include: {
          tracking: true
        }
      }),
      prisma.userPreferences.findUnique({
        where: { userId }
      })
    ])
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      user,
      tasks,
      habits,
      preferences,
      summary: {
        totalTasks: tasks.length,
        totalHabits: habits.length,
        totalTrackings: habits.reduce((sum, habit) => sum + habit.tracking.length, 0)
      }
    }
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="neuroasistente-export.json"')
    
    res.send(JSON.stringify(exportData, null, 2))
  } catch (error) {
    next(error)
  }
})

// DELETE /api/user/account - Eliminar cuenta
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { confirm } = req.body
    
    if (!confirm || confirm !== 'ELIMINAR MI CUENTA') {
      return res.status(400).json({ 
        error: 'Confirmación requerida. Envía "ELIMINAR MI CUENTA" para confirmar.' 
      })
    }
    
    // Iniciar transacción para eliminar todos los datos
    await prisma.$transaction(async (tx) => {
      // Eliminar subtareas primero
      await tx.subtask.deleteMany({
        where: { task: { userId } }
      })
      
      // Eliminar tareas
      await tx.task.deleteMany({
        where: { userId }
      })
      
      // Eliminar tracking de hábitos
      await tx.habitTracking.deleteMany({
        where: { habit: { userId } }
      })
      
      // Eliminar hábitos
      await tx.habit.deleteMany({
        where: { userId }
      })
      
      // Eliminar sesiones pomodoro
      await tx.pomodoroSession.deleteMany({
        where: { userId }
      })
      
      // Eliminar preferencias
      await tx.userPreferences.deleteMany({
        where: { userId }
      })
      
      // Eliminar usuario
      await tx.user.delete({
        where: { id: userId }
      })
    })
    
    res.json({ 
      message: 'Cuenta eliminada exitosamente. Todos tus datos han sido borrados.' 
    })
  } catch (error) {
    next(error)
  }
})

export default router