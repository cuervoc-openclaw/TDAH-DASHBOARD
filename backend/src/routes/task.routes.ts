import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { AuthRequest } from '../middlewares/auth'

const router = Router()

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional(),
  priority: z.number().int().min(1).max(3).default(2),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).default('pending'),
  isChunked: z.boolean().default(false),
  parentTaskId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().max(50).optional()
})

const updateTaskSchema = createTaskSchema.partial()

const chunkTaskSchema = z.object({
  subtasks: z.array(z.string()).min(2, 'Debe haber al menos 2 subtareas')
})

// Get all tasks for current user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        subtasks: true
      }
    })
    
    res.json(tasks)
    
  } catch (error) {
    console.error('Error obteniendo tareas:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al obtener tareas'
    })
  }
})

// Get task by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        subtasks: true,
        parentTask: true
      }
    })
    
    if (!task) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe o no tienes permiso para verla'
      })
    }
    
    res.json(task)
    
  } catch (error) {
    console.error('Error obteniendo tarea:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al obtener tarea'
    })
  }
})

// Create new task
router.post('/', async (req: AuthRequest, res) => {
  try {
    const validatedData = createTaskSchema.parse(req.body)
    
    const task = await prisma.task.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      },
      include: {
        subtasks: true
      }
    })
    
    res.status(201).json(task)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: error.errors.map(e => e.message).join(', ')
      })
    }
    
    console.error('Error creando tarea:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al crear tarea'
    })
  }
})

// Update task
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    })
    
    if (!existingTask) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe o no tienes permiso para modificarla'
      })
    }
    
    const validatedData = updateTaskSchema.parse(req.body)
    
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      },
      include: {
        subtasks: true
      }
    })
    
    res.json(task)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: error.errors.map(e => e.message).join(', ')
      })
    }
    
    console.error('Error actualizando tarea:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al actualizar tarea'
    })
  }
})

// Delete task
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    })
    
    if (!existingTask) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe o no tienes permiso para eliminarla'
      })
    }
    
    // Delete task and its subtasks
    await prisma.task.delete({
      where: { id: req.params.id }
    })
    
    res.status(204).send()
    
  } catch (error) {
    console.error('Error eliminando tarea:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al eliminar tarea'
    })
  }
})

// Chunk task into subtasks
router.post('/:id/chunk', async (req: AuthRequest, res) => {
  try {
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    })
    
    if (!existingTask) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe o no tienes permiso para modificarla'
      })
    }
    
    const validatedData = chunkTaskSchema.parse(req.body)
    
    // Update main task to be chunked
    await prisma.task.update({
      where: { id: req.params.id },
      data: { isChunked: true }
    })
    
    // Create subtasks
    const subtasks = await Promise.all(
      validatedData.subtasks.map((title, index) =>
        prisma.task.create({
          data: {
            title,
            userId: req.user!.id,
            parentTaskId: req.params.id,
            priority: existingTask.priority,
            status: 'pending',
            isChunked: false,
            tags: existingTask.tags,
            category: existingTask.category,
            estimatedDuration: existingTask.estimatedDuration 
              ? Math.floor(existingTask.estimatedDuration / validatedData.subtasks.length)
              : undefined
          }
        })
      )
    )
    
    res.status(201).json(subtasks)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: error.errors.map(e => e.message).join(', ')
      })
    }
    
    console.error('Error dividiendo tarea:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al dividir tarea'
    })
  }
})

// Get tasks by filter
router.get('/filter/:filter', async (req: AuthRequest, res) => {
  try {
    const { filter } = req.params
    const { status, priority, tag, category, search } = req.query
    
    const where: any = { userId: req.user!.id }
    
    // Apply filters based on route parameter
    switch (filter) {
      case 'today':
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        where.dueDate = {
          gte: today,
          lt: tomorrow
        }
        break
        
      case 'upcoming':
        const now = new Date()
        where.dueDate = {
          gt: now
        }
        break
        
      case 'overdue':
        const currentDate = new Date()
        where.dueDate = {
          lt: currentDate
        }
        where.status = {
          not: 'completed'
        }
        break
        
      case 'completed':
        where.status = 'completed'
        break
        
      case 'pending':
        where.status = 'pending'
        break
        
      case 'in-progress':
        where.status = 'in-progress'
        break
    }
    
    // Apply query filters
    if (status) {
      where.status = status
    }
    
    if (priority) {
      where.priority = parseInt(priority as string)
    }
    
    if (tag) {
      where.tags = {
        has: tag
      }
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }
    
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        subtasks: true
      }
    })
    
    res.json(tasks)
    
  } catch (error) {
    console.error('Error filtrando tareas:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al filtrar tareas'
    })
  }
})

// Update task time spent
router.patch('/:id/time', async (req: AuthRequest, res) => {
  try {
    const { timeSpent } = req.body
    
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      return res.status(400).json({
        error: 'Tiempo inválido',
        message: 'El tiempo debe ser un número positivo'
      })
    }
    
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    })
    
    if (!existingTask) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe o no tienes permiso para modificarla'
      })
    }
    
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        timeSpent: existingTask.timeSpent + timeSpent
      }
    })
    
    res.json(task)
    
  } catch (error) {
    console.error('Error actualizando tiempo:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al actualizar tiempo'
    })
  }
})

export default router