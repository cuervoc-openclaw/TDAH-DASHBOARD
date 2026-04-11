import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name?: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Token de autenticación requerido' 
      })
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET
    
    if (!secret) {
      throw new Error('JWT_SECRET no configurado')
    }

    const decoded = jwt.verify(token, secret) as { userId: string }
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Usuario no encontrado' 
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token de autenticación ha expirado' 
      })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Token de autenticación inválido' 
      })
    }

    console.error('Error en autenticación:', error)
    return res.status(500).json({ 
      error: 'Error interno',
      message: 'Error al verificar autenticación' 
    })
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET
    
    if (!secret) {
      return next()
    }

    const decoded = jwt.verify(token, secret) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    })

    if (user) {
      req.user = user
    }
    
    next()
  } catch (error) {
    // Si hay error en el token, continuar sin autenticación
    next()
  }
}

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Autenticación requerida' 
      })
    }

    // Aquí podrías verificar roles si los implementas
    // Por ahora, todos los usuarios autenticados tienen acceso
    next()
  }
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  
  if (!secret) {
    throw new Error('JWT_SECRET no configurado')
  }

  return jwt.sign({ userId }, secret, { expiresIn })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return null
    
    return jwt.verify(token, secret) as { userId: string }
  } catch (error) {
    return null
  }
}