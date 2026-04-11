import { api } from './api'
import { User } from '../stores/authStore'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ValidationError {
  field: string
  message: string
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', { email, password })
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', { email, password, name })
  }

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  }

  async logout(): Promise<void> {
    return api.post('/auth/logout')
  }

  async refreshToken(): Promise<{ token: string }> {
    return api.post<{ token: string }>('/auth/refresh')
  }

  async requestPasswordReset(email: string): Promise<void> {
    return api.post('/auth/password-reset', { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    return api.post('/auth/password-reset/confirm', { token, password })
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    return api.patch<User>(`/auth/profile/${userId}`, updates)
  }

  async deleteAccount(userId: string): Promise<void> {
    return api.delete(`/auth/account/${userId}`)
  }

  // Validation helpers
  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'El email es requerido'
    if (!emailRegex.test(email)) return 'Email inválido'
    return null
  }

  validatePassword(password: string): string | null {
    if (!password) return 'La contraseña es requerida'
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/[A-Z]/.test(password)) return 'La contraseña debe tener al menos una mayúscula'
    if (!/[a-z]/.test(password)) return 'La contraseña debe tener al menos una minúscula'
    if (!/[0-9]/.test(password)) return 'La contraseña debe tener al menos un número'
    return null
  }

  validateName(name: string): string | null {
    if (!name) return 'El nombre es requerido'
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (name.length > 50) return 'El nombre no puede exceder 50 caracteres'
    return null
  }

  // Session management
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  // Password strength meter
  getPasswordStrength(password: string): {
    score: number
    label: 'Muy débil' | 'Débil' | 'Regular' | 'Fuerte' | 'Muy fuerte'
    color: string
  } {
    let score = 0
    
    // Length
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
    
    return {
      score,
      label: labels[score] as any,
      color: colors[score]
    }
  }
}

export const authService = new AuthService()