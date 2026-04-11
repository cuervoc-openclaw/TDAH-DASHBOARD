import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../index'
import { generateToken, authenticate } from '../middlewares/auth'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional()
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional()
})

// Register new user
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con este email'
      })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name || validatedData.email.split('@')[0],
        preferences: {
          create: {
            theme: 'light',
            fontSize: 16,
            reduceMotion: false,
            notificationTypes: { push: true, email: false, whatsapp: false },
            quietHours: { start: '22:00', end: '08:00' },
            pomodoroDuration: 25,
            breakDuration: 5,
            chunkingEnabled: true
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // Generate token
    const token = generateToken(user.id)
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: error.errors.map(e => e.message).join(', ')
      })
    }
    
    console.error('Error en registro:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al registrar usuario'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      })
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      })
    }
    
    // Generate token
    const token = generateToken(user.id)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: error.errors.map(e => e.message).join(', ')
      })
    }
    
    console.error('Error en login:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al iniciar sesión'
    })
  }
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        preferences: true
      }
    })
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      })
    }
    
    res.json(user)
    
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al obtener información del usuario'
    })
  }
})

// Update user profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body)
    
    // Check if email is being updated and if it's already taken
    if (validatedData.email && validatedData.email !== req.user!.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Email ya en uso',
          message: 'Ya existe un usuario con este email'
        })
      }
    }
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    res.json({
      message: 'Perfil actualizado exitosamente',
      user
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validación fallida',
        message: error.errors.map(e => e.message).join(', ')
      })
    }
    
    console.error('Error actualizando perfil:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al actualizar perfil'
    })
  }
})

// Logout (client-side only, but we can invalidate tokens if needed)
router.post('/logout', authenticate, async (req, res) => {
  // In a real app, you might want to invalidate the token
  // For now, we'll just return success
  res.json({ message: 'Logout exitoso' })
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Token requerido',
        message: 'Refresh token es requerido'
      })
    }
    
    // In a real app, you would verify the refresh token
    // and issue a new access token
    // For now, we'll return an error since we're not implementing refresh tokens yet
    res.status(501).json({
      error: 'No implementado',
      message: 'Refresh tokens no implementados aún'
    })
    
  } catch (error) {
    console.error('Error refrescando token:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al refrescar token'
    })
  }
})

// Request password reset
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        error: 'Email requerido',
        message: 'Email es requerido para resetear contraseña'
      })
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
      })
    }
    
    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link
    
    res.json({
      message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
    })
    
  } catch (error) {
    console.error('Error solicitando reset de contraseña:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al solicitar reset de contraseña'
    })
  }
})

// Reset password with token
router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { token, password } = req.body
    
    if (!token || !password) {
      return res.status(400).json({
        error: 'Datos requeridos',
        message: 'Token y nueva contraseña son requeridos'
      })
    }
    
    // In a real app, you would:
    // 1. Verify the reset token
    // 2. Check expiration
    // 3. Update password
    
    res.status(501).json({
      error: 'No implementado',
      message: 'Reset de contraseña no implementado aún'
    })
    
  } catch (error) {
    console.error('Error reseteando contraseña:', error)
    res.status(500).json({
      error: 'Error interno',
      message: 'Error al resetear contraseña'
    })
  }
})

export default router