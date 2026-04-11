import { Router } from 'express'
import { prisma } from '../index'
import { authenticate } from '../middlewares/auth'
import { z } from 'zod'

const router = Router()

// Schema de validación
const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  category: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
})

const updateHabitSchema = createHabitSchema.partial()

const trackHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
  notes: z.string().max(500).optional()
})

// GET /api/habits - Obtener todos los hábitos del usuario
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        tracking: {
          orderBy: { date: 'desc' },
          take: 30 // Últimos 30 días
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(habits)
  } catch (error) {
    next(error)
  }
})

// GET /api/habits/:id - Obtener hábito específico
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const habit = await prisma.habit.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        tracking: {
          orderBy: { date: 'desc' }
        }
      }
    })
    
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }
    
    res.json(habit)
  } catch (error) {
    next(error)
  }
})

// POST /api/habits - Crear nuevo hábito
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const validatedData = createHabitSchema.parse(req.body)
    
    const habit = await prisma.habit.create({
      data: {
        ...validatedData,
        userId,
        streak: 0,
        bestStreak: 0
      }
    })
    
    res.status(201).json(habit)
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

// PATCH /api/habits/:id - Actualizar hábito
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const validatedData = updateHabitSchema.parse(req.body)
    
    const habit = await prisma.habit.findFirst({
      where: { id, userId }
    })
    
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }
    
    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: validatedData
    })
    
    res.json(updatedHabit)
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

// DELETE /api/habits/:id - Eliminar hábito
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const habit = await prisma.habit.findFirst({
      where: { id, userId }
    })
    
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }
    
    // Eliminar tracking primero
    await prisma.habitTracking.deleteMany({
      where: { habitId: id }
    })
    
    // Eliminar hábito
    await prisma.habit.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// POST /api/habits/:id/track - Registrar tracking de hábito
router.post('/:id/track', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const validatedData = trackHabitSchema.parse(req.body)
    
    const habit = await prisma.habit.findFirst({
      where: { id, userId }
    })
    
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }
    
    // Buscar tracking existente para esta fecha
    const existingTracking = await prisma.habitTracking.findFirst({
      where: {
        habitId: id,
        date: validatedData.date
      }
    })
    
    let tracking
    if (existingTracking) {
      // Actualizar tracking existente
      tracking = await prisma.habitTracking.update({
        where: { id: existingTracking.id },
        data: validatedData
      })
    } else {
      // Crear nuevo tracking
      tracking = await prisma.habitTracking.create({
        data: {
          ...validatedData,
          habitId: id
        }
      })
    }
    
    // Recalcular streak
    await calculateAndUpdateStreak(id)
    
    res.status(201).json(tracking)
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

// GET /api/habits/:id/tracking - Obtener tracking de hábito
router.get('/:id/tracking', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const { startDate, endDate } = req.query
    
    const habit = await prisma.habit.findFirst({
      where: { id, userId }
    })
    
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }
    
    const where: any = { habitId: id }
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate as string,
        lte: endDate as string
      }
    }
    
    const tracking = await prisma.habitTracking.findMany({
      where,
      orderBy: { date: 'desc' }
    })
    
    res.json(tracking)
  } catch (error) {
    next(error)
  }
})

// GET /api/habits/:id/stats - Obtener estadísticas del hábito
router.get('/:id/stats', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
      include: {
        tracking: {
          orderBy: { date: 'desc' },
          take: 365 // Último año
        }
      }
    })
    
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }
    
    const totalDays = habit.tracking.length
    const completedDays = habit.tracking.filter(t => t.completed).length
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    
    // Calcular racha actual
    const currentStreak = await calculateCurrentStreak(id)
    
    res.json({
      streak: currentStreak,
      bestStreak: habit.bestStreak,
      completionRate,
      totalCompleted: completedDays,
      totalDays
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/habits/stats/overall - Estadísticas generales
router.get('/stats/overall', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        tracking: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          }
        }
      }
    })
    
    if (habits.length === 0) {
      return res.json({
        totalHabits: 0,
        totalStreak: 0,
        averageCompletionRate: 0,
        bestHabit: null,
        needsImprovement: null
      })
    }
    
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0)
    
    // Calcular tasa de completitud promedio
    const completionRates = habits.map(habit => {
      const total = habit.tracking.length
      const completed = habit.tracking.filter(t => t.completed).length
      return total > 0 ? (completed / total) * 100 : 0
    })
    
    const averageCompletionRate = completionRates.length > 0
      ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
      : 0
    
    // Encontrar mejor hábito y que necesita mejora
    let bestHabit = habits[0]
    let needsImprovement = habits[0]
    let bestRate = 0
    let worstRate = 100
    
    for (const habit of habits) {
      const total = habit.tracking.length
      const completed = habit.tracking.filter(t => t.completed).length
      const rate = total > 0 ? (completed / total) * 100 : 0
      
      if (rate > bestRate) {
        bestRate = rate
        bestHabit = habit
      }
      
      if (rate < worstRate) {
        worstRate = rate
        needsImprovement = habit
      }
    }
    
    res.json({
      totalHabits: habits.length,
      totalStreak,
      averageCompletionRate,
      bestHabit: {
        id: bestHabit.id,
        name: bestHabit.name,
        completionRate: Math.round(bestRate)
      },
      needsImprovement: {
        id: needsImprovement.id,
        name: needsImprovement.name,
        completionRate: Math.round(worstRate)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Helper functions
async function calculateCurrentStreak(habitId: string): Promise<number> {
  const tracking = await prisma.habitTracking.findMany({
    where: { 
      habitId,
      completed: true 
    },
    orderBy: { date: 'desc' },
    take: 365 // Último año
  })
  
  if (tracking.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  
  // Ordenar por fecha descendente
  const sortedTracking = tracking.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  for (const track of sortedTracking) {
    const trackDate = new Date(track.date)
    const diffDays = Math.floor((currentDate.getTime() - trackDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === streak) {
      streak++
    } else {
      break
    }
    currentDate = trackDate
  }
  
  return streak
}

async function calculateAndUpdateStreak(habitId: string): Promise<void> {
  const currentStreak = await calculateCurrentStreak(habitId)
  
  const habit = await prisma.habit.findUnique({
    where: { id: habitId }
  })
  
  if (!habit) return
  
  const bestStreak = Math.max(habit.bestStreak, currentStreak)
  
  await prisma.habit.update({
    where: { id: habitId },
    data: {
      streak: currentStreak,
      bestStreak
    }
  })
}

export default router