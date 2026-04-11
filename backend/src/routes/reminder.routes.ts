import { Router } from 'express'
import { prisma } from '../index'
import { authenticate } from '../middlewares/auth'
import { z } from 'zod'
import cronParser from 'cron-parser'

const router = Router()

// Schema de validación
const createReminderSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum(['task', 'habit', 'custom']),
  relatedId: z.string().optional(),
  
  // Programación
  schedule: z.object({
    cron: z.string(),
    timezone: z.string().default('America/Santiago')
  }),
  
  // Canales de notificación
  channels: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(false),
    whatsapp: z.boolean().default(false)
  }).default({})
})

const updateReminderSchema = createReminderSchema.partial()

// Helper para calcular próximo trigger
function calculateNextTrigger(cronExpression: string, timezone: string): Date {
  try {
    const interval = cronParser.parseExpression(cronExpression, {
      tz: timezone
    })
    return interval.next().toDate()
  } catch (error) {
    // Fallback: en 1 hora
    const date = new Date()
    date.setHours(date.getHours() + 1)
    return date
  }
}

// GET /api/reminders - Obtener todos los recordatorios
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { nextTrigger: 'asc' }
    })
    
    res.json(reminders)
  } catch (error) {
    next(error)
  }
})

// GET /api/reminders/active - Recordatorios activos
router.get('/active', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    const activeReminders = await prisma.reminder.findMany({
      where: {
        userId,
        nextTrigger: {
          lte: new Date() // Ya deberían haberse disparado
        }
      },
      orderBy: { nextTrigger: 'asc' }
    })
    
    res.json(activeReminders)
  } catch (error) {
    next(error)
  }
})

// GET /api/reminders/:id - Obtener recordatorio específico
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const reminder = await prisma.reminder.findFirst({
      where: { id, userId }
    })
    
    if (!reminder) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' })
    }
    
    res.json(reminder)
  } catch (error) {
    next(error)
  }
})

// POST /api/reminders - Crear nuevo recordatorio
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    const validatedData = createReminderSchema.parse(req.body)
    
    // Verificar relatedId si se proporciona
    if (validatedData.relatedId) {
      if (validatedData.type === 'task') {
        const task = await prisma.task.findFirst({
          where: {
            id: validatedData.relatedId,
            userId
          }
        })
        
        if (!task) {
          return res.status(404).json({ error: 'Tarea no encontrada' })
        }
      } else if (validatedData.type === 'habit') {
        const habit = await prisma.habit.findFirst({
          where: {
            id: validatedData.relatedId,
            userId
          }
        })
        
        if (!habit) {
          return res.status(404).json({ error: 'Hábito no encontrado' })
        }
      }
    }
    
    // Calcular próximo trigger
    const nextTrigger = calculateNextTrigger(
      validatedData.schedule.cron,
      validatedData.schedule.timezone
    )
    
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        ...validatedData,
        nextTrigger
      }
    })
    
    res.status(201).json(reminder)
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

// PATCH /api/reminders/:id - Actualizar recordatorio
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const validatedData = updateReminderSchema.parse(req.body)
    
    const reminder = await prisma.reminder.findFirst({
      where: { id, userId }
    })
    
    if (!reminder) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' })
    }
    
    // Recalcular nextTrigger si se actualiza el schedule
    let updateData: any = { ...validatedData }
    if (validatedData.schedule) {
      updateData.nextTrigger = calculateNextTrigger(
        validatedData.schedule.cron,
        validatedData.schedule.timezone || 'America/Santiago'
      )
    }
    
    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: updateData
    })
    
    res.json(updatedReminder)
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

// DELETE /api/reminders/:id - Eliminar recordatorio
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const reminder = await prisma.reminder.findFirst({
      where: { id, userId }
    })
    
    if (!reminder) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' })
    }
    
    await prisma.reminder.delete({
      where: { id }
    })
    
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// POST /api/reminders/:id/trigger - Disparar recordatorio manualmente
router.post('/:id/trigger', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const reminder = await prisma.reminder.findFirst({
      where: { id, userId }
    })
    
    if (!reminder) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' })
    }
    
    // Aquí se integraría con el sistema de notificaciones
    // Por ahora, solo actualizamos el próximo trigger
    
    const nextTrigger = calculateNextTrigger(
      reminder.schedule.cron as string,
      reminder.schedule.timezone as string || 'America/Santiago'
    )
    
    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: { nextTrigger }
    })
    
    res.json({
      message: 'Recordatorio disparado',
      reminder: updatedReminder,
      notification: {
        title: reminder.title,
        message: reminder.message,
        channels: reminder.channels
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/reminders/suggestions - Sugerencias de recordatorios
router.get('/suggestions', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id
    
    // Obtener tareas con fecha de vencimiento próxima
    const upcomingTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: ['pending', 'in-progress'] },
        dueDate: {
          not: null,
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Próximos 3 días
        }
      },
      take: 5
    })
    
    // Obtener hábitos con recordatorios configurados
    const habitsWithReminders = await prisma.habit.findMany({
      where: {
        userId,
        reminderTime: { not: null }
      },
      take: 5
    })
    
    const suggestions = {
      taskReminders: upcomingTasks.map(task => ({
        type: 'task' as const,
        title: `Recordatorio: ${task.title}`,
        message: `Tu tarea "${task.title}" vence pronto`,
        relatedId: task.id,
        schedule: {
          cron: '0 9 * * *', // Todos los días a las 9 AM
          timezone: 'America/Santiago'
        },
        reason: 'Tarea próxima a vencer'
      })),
      
      habitReminders: habitsWithReminders.map(habit => ({
        type: 'habit' as const,
        title: `Recordatorio: ${habit.name}`,
        message: `Es hora de tu hábito "${habit.name}"`,
        relatedId: habit.id,
        schedule: {
          cron: `0 ${habit.reminderTime?.split(':')[0]} * * *`, // Hora específica del hábito
          timezone: 'America/Santiago'
        },
        reason: 'Hábito con recordatorio configurado'
      })),
      
      dailyReminders: [
        {
          type: 'custom' as const,
          title: 'Revisión diaria',
          message: 'Revisa tus tareas y hábitos para hoy',
          schedule: {
            cron: '0 8 * * *', // 8 AM diario
            timezone: 'America/Santiago'
          },
          reason: 'Revisión matutina recomendada'
        },
        {
          type: 'custom' as const,
          title: 'Planificación nocturna',
          message: 'Planifica tus tareas para mañana',
          schedule: {
            cron: '0 20 * * *', // 8 PM diario
            timezone: 'America/Santiago'
          },
          reason: 'Planificación nocturna recomendada'
        }
      ]
    }
    
    res.json(suggestions)
  } catch (error) {
    next(error)
  }
})

// POST /api/reminders/process - Procesar recordatorios pendientes (para cron job)
router.post('/process', async (req, res, next) => {
  try {
    // Este endpoint sería llamado por un cron job
    // Verificar API key o autenticación especial
    const apiKey = req.headers['x-api-key']
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    
    const now = new Date()
    
    // Obtener recordatorios que deberían haberse disparado
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        nextTrigger: { lte: now }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            preferences: true
          }
        }
      }
    })
    
    if (pendingReminders.length === 0) {
      return res.json({ 
        message: 'No hay recordatorios pendientes',
        processed: 0 
      })
    }
    
    const processedReminders = []
    
    for (const reminder of pendingReminders) {
      // Aquí se integraría con sistemas de notificación:
      // 1. Notificaciones push (Firebase, OneSignal)
      // 2. Email (Nodemailer, SendGrid)
      // 3. WhatsApp (Twilio, API propia)
      
      const channels = reminder.channels as any
      const notificationsSent = []
      
      if (channels?.push) {
        notificationsSent.push('push')
        // Lógica para enviar notificación push
      }
      
      if (channels?.email && reminder.user.email) {
        notificationsSent.push('email')
        // Lógica para enviar email
      }
      
      if (channels?.whatsapp) {
        notificationsSent.push('whatsapp')
        // Lógica para enviar WhatsApp
      }
      
      // Calcular próximo trigger
      const nextTrigger = calculateNextTrigger(
        reminder.schedule.cron as string,
        reminder.schedule.timezone as string || 'America/Santiago'
      )
      
      // Actualizar recordatorio
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { nextTrigger }
      })
      
      processedReminders.push({
        id: reminder.id,
        title: reminder.title,
        userId: reminder.userId,
        notificationsSent,
        nextTrigger
      })
    }
    
    res.json({
      message: 'Recordatorios procesados',
      processed: processedReminders.length,
      reminders: processedReminders,
      timestamp: now.toISOString()
    })
  } catch (error) {
    next(error)
  }
})

export default router