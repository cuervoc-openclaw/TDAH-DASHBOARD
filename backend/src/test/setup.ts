import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { randomBytes } from 'crypto'

// Configurar entorno de testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'
process.env.JWT_SECRET = 'test-secret-key-123'

// Crear cliente Prisma para testing
const prisma = new PrismaClient()

// Función para limpiar base de datos
export const cleanupDatabase = async () => {
  const models = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))
  
  for (const model of models) {
    try {
      // @ts-ignore
      await prisma[model].deleteMany({})
    } catch (error) {
      // Ignorar errores si la tabla no existe
    }
  }
}

// Función para crear usuario de prueba
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: `test-${randomBytes(8).toString('hex')}@example.com`,
    name: 'Test User',
    password: 'password123'
  }
  
  return await prisma.user.create({
    data: { ...defaultUser, ...userData },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })
}

// Función para crear tarea de prueba
export const createTestTask = async (userId: string, taskData = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test task description',
    priority: 2,
    status: 'pending' as const,
    isChunked: false,
    tags: ['test'],
    timeSpent: 0
  }
  
  return await prisma.task.create({
    data: {
      ...defaultTask,
      ...taskData,
      userId
    }
  })
}

// Función para crear hábito de prueba
export const createTestHabit = async (userId: string, habitData = {}) => {
  const defaultHabit = {
    name: 'Test Habit',
    description: 'Test habit description',
    frequency: 'daily' as const,
    color: '#3b82f6'
  }
  
  return await prisma.habit.create({
    data: {
      ...defaultHabit,
      ...habitData,
      userId
    }
  })
}

// Setup global antes de todos los tests
beforeAll(async () => {
  // Limpiar base de datos
  await cleanupDatabase()
})

// Cleanup después de todos los tests
afterAll(async () => {
  await prisma.$disconnect()
})

// Exportar utilities
export { prisma }