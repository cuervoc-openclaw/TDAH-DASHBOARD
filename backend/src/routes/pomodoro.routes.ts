import { Router } from 'express'
import { prisma } from '../index'
import { authenticate } from '../middlewares/auth'
import { z } from 'zod'

const router = Router()

// Schema de validación
const startPomodoroSchema = z.object({
  type: z.enum(['work', 'short-break', 'long-break']),
  duration: z.number().min(1).max(60),
  taskId: z.string().optional(),
  notes: z.string().max(500).optional()
})

const updatePomodoroSchema = z.object({
  completed: z.boolean().optional(),
  endTime: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
})

// POST /api/pomodoro/start - Iniciar sesión de Pomodoro
router.post('/start', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const validatedData = startPomodoroSchema.parse(req.body)
    
    // Verificar si hay una sesión activa
    const activeSession = await prisma.pomodoroSession.findFirst({
      where: {
        userId,
        completed: false,
        endTime: null
      }
    })
    
    if (activeSession) {
      return res.status(400).json({ 
        error: 'Ya tienes una sesión de Pomodoro activa',
        activeSessionId: activeSession.id
      })
    }
    
    // Verificar taskId si se proporciona
    if (validatedData.taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: validatedData.taskId,
          userId
        }
      })
      
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
      }
    }
    
    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId,
        ...validatedData,
        startTime: new Date()
      }
    })
    
    res.status(201).json(pomodoroSession)
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

// GET /api/pomodoro/active - Obtener sesión activa
router.get('/active', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const activeSession = await prisma.pomodoroSession.findFirst({
      where: {
        userId,
        completed: false,
        endTime: null
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            priority: true
          }
        }
      }
    })
    
    if (!activeSession) {
      return res.status(404).json({ error: 'No hay sesión activa' })
    }
    
    // Calcular tiempo restante
    const startTime = new Date(activeSession.startTime).getTime()
    const now = Date.now()
    const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60))
    const remainingMinutes = Math.max(0, activeSession.duration - elapsedMinutes)
    
    res.json({
      ...activeSession,
      elapsedMinutes,
      remainingMinutes,
      progress: Math.min(100, (elapsedMinutes / activeSession.duration) * 100)
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/pomodoro/:id - Actualizar sesión de Pomodoro
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const validatedData = updatePomodoroSchema.parse(req.body)
    
    const session = await prisma.pomodoroSession.findFirst({
      where: { id, userId }
    })
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }
    
    // Si se marca como completada pero no tiene endTime, agregarlo
    const updateData: any = { ...validatedData }
    if (validatedData.completed && !validatedData.endTime && !session.endTime) {
      updateData.endTime = new Date()
    }
    
    const updatedSession = await prisma.pomodoroSession.update({
      where: { id },
      data: updateData
    })
    
    res.json(updatedSession)
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

// POST /api/pomodoro/:id/complete - Completar sesión
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const session = await prisma.pomodoroSession.findFirst({
      where: { id, userId }
    })
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }
    
    const completedSession = await prisma.pomodoroSession.update({
      where: { id },
      data: {
        completed: true,
        endTime: new Date()
      }
    })
    
    // Si la sesión estaba asociada a una tarea, actualizar tiempo dedicado
    if (session.taskId) {
      const elapsedMinutes = session.endTime 
        ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
        : session.duration
      
      await prisma.task.update({
        where: { id: session.taskId },
        data: {
          timeSpent: {
            increment: elapsedMinutes
          }
        }
      })
    }
    
    res.json(completedSession)
  } catch (error) {
    next(error)
  }
})

// GET /api/pomodoro/history - Historial de sesiones
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { limit = '50', offset = '0', type, startDate, endDate } = req.query
    
    const where: any = { userId }
    
    if (type) {
      where.type = type
    }
    
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    }
    
    const sessions = await prisma.pomodoroSession.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { startTime: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })
    
    // Calcular estadísticas
    const totalSessions = sessions.length
    const totalWorkMinutes = sessions
      .filter(s => s.type === 'work')
      .reduce((sum, session) => sum + session.duration, 0)
    
    const completedSessions = sessions.filter(s => s.completed).length
    const completionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0
    
    res.json({
      sessions,
      stats: {
        totalSessions,
        totalWorkMinutes,
        completedSessions,
        completionRate,
        averageDuration: totalSessions > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions)
          : 0
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/pomodoro/stats/daily - Estadísticas diarias
router.get('/stats/daily', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const { days = '7' } = req.query
    
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string))
    
    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        startTime: { gte: daysAgo }
      },
      orderBy: { startTime: 'asc' }
    })
    
    // Agrupar por día
    const dailyStats: Record<string, {
      date: string
      workSessions: number
      breakSessions: number
      totalMinutes: number
      completedSessions: number
    }> = {}
    
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0]
      
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          workSessions: 0,
          breakSessions: 0,
          totalMinutes: 0,
          completedSessions: 0
        }
      }
      
      if (session.type === 'work') {
        dailyStats[date].workSessions++
      } else {
        dailyStats[date].breakSessions++
      }
      
      dailyStats[date].totalMinutes += session.duration
      
      if (session.completed) {
        dailyStats[date].completedSessions++
      }
    })
    
    // Convertir a array y ordenar por fecha
    const statsArray = Object.values(dailyStats).sort((a, b) => 
      a.date.localeCompare(b.date)
    )
    
    // Calcular promedios
    const totalDays = statsArray.length
    const averages = totalDays > 0 ? {
      dailyWorkSessions: Math.round(statsArray.reduce((sum, day) => sum + day.workSessions, 0) / totalDays),
      dailyMinutes: Math.round(statsArray.reduce((sum, day) => sum + day.totalMinutes, 0) / totalDays),
      completionRate: Math.round(statsArray.reduce((sum, day) => {
        const totalSessions = day.workSessions + day.breakSessions
        return totalSessions > 0 ? sum + (day.completedSessions / totalSessions) * 100 : sum
      }, 0) / totalDays)
    } : {
      dailyWorkSessions: 0,
      dailyMinutes: 0,
      completionRate: 0
    }
    
    res.json({
      dailyStats: statsArray,
      averages,
      totalDays: parseInt(days as string),
      period: {
        start: daysAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/pomodoro/recommendations - Recomendaciones basadas en hábitos
router.get('/recommendations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    // Obtener preferencias de Pomodoro del usuario
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    })
    
    const pomodoroSettings = preferences?.pomodoro as any || {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4
    }
    
    // Obtener tareas pendientes de alta prioridad
    const highPriorityTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: ['pending', 'in-progress'] },
        priority: 1
      },
      orderBy: { dueDate: 'asc' },
      take: 3
    })
    
    // Obtener hábitos que necesitan atención
    const habitsNeedingAttention = await prisma.habit.findMany({
      where: {
        userId,
        streak: { lt: 3 } // Hábitos con racha baja
      },
      orderBy: { streak: 'asc' },
      take: 2
    })
    
    // Analizar patrones de productividad
    const recentSessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        startTime: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
        }
      }
    })
    
    // Calcular mejores horas para trabajo
    const hourCounts: Record<number, number> = {}
    recentSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const bestHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
    
    const recommendations = {
      pomodoroSettings,
      suggestedTasks: highPriorityTasks.map(task => ({
        id: task.id,
        title: task.title,
        estimatedDuration: task.estimatedDuration || pomodoroSettings.workDuration,
        reason: 'Alta prioridad'
      })),
      suggestedHabits: habitsNeedingAttention.map(habit => ({
        id: habit.id,
        name: habit.name,
        reason: `Racha baja (${habit.streak} días)`
      })),
      optimalHours: bestHours.map(hour => ({
        hour,
        display: `${hour}:00 - ${hour + 1}:00`,
        reason: 'Horas de mayor productividad histórica'
      })),
      tips: [
        'Toma un descanso de 5 minutos después de cada Pomodoro',
        'Programa descansos largos cada 4 Pomodoros',
        'Enfócate en una tarea a la vez',
        'Ajusta la duración según tu nivel de energía'
      ]
    }
    
    res.json(recommendations)
  } catch (error) {
    next(error)
  }
})

export default router