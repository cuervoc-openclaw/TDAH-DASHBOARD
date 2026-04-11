import { PrismaClient } from '@prisma/client'

// Configuración para diferentes entornos
const getDatabaseUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    // En Vercel, usa SQLite en memoria o variable de entorno
    return process.env.DATABASE_URL || 'file:./dev.db'
  }
  
  // Desarrollo local
  return process.env.DATABASE_URL || 'file:./dev.db'
}

// Configurar Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error']
})

// Función para inicializar base de datos
export const initializeDatabase = async () => {
  try {
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Base de datos conectada exitosamente')
    
    // Crear tablas si no existen (solo para SQLite)
    if (getDatabaseUrl().includes('file:')) {
      await prisma.$executeRaw`PRAGMA foreign_keys = ON`
      console.log('✅ Foreign keys habilitadas')
    }
    
    return prisma
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error)
    
    // En producción, intentar con SQLite en memoria como fallback
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Intentando con SQLite en memoria...')
      const memoryPrisma = new PrismaClient({
        datasources: {
          db: {
            url: 'file:memory:?cache=shared'
          }
        }
      })
      
      try {
        await memoryPrisma.$connect()
        console.log('✅ Conectado a SQLite en memoria')
        return memoryPrisma
      } catch (memoryError) {
        console.error('❌ Error con SQLite en memoria:', memoryError)
        throw error
      }
    }
    
    throw error
  }
}

// Middleware para logging
prisma.$use(async (params, next) => {
  const start = Date.now()
  const result = await next(params)
  const duration = Date.now() - start
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Query ${params.model}.${params.action} tomó ${duration}ms`)
  }
  
  return result
})

// Exportar Prisma Client
export { prisma }

// Función para limpiar base de datos (solo desarrollo)
export const cleanupDatabase = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Eliminar todos los datos (cuidado en producción!)
      const models = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))
      
      for (const model of models) {
        try {
          // @ts-ignore
          await prisma[model].deleteMany({})
        } catch (error) {
          // Ignorar errores si la tabla no existe
        }
      }
      
      console.log('🧹 Base de datos limpiada')
    } catch (error) {
      console.error('Error limpiando base de datos:', error)
    }
  }
}

// Función para verificar estado de la base de datos
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Base de datos conectada' }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Configuración para Vercel específicamente
export const vercelDatabaseConfig = {
  // SQLite en memoria para Vercel (no persistente)
  memory: 'file:memory:?cache=shared',
  
  // SQLite con archivo temporal
  temp: 'file:/tmp/dev.db',
  
  // Configuración recomendada para demo
  demo: process.env.DATABASE_URL || 'file:/tmp/neuroasistente.db'
}