import { api } from './api'

export interface Habit {
  id: string
  userId: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  bestStreak: number
  category?: string
  color: string
  reminderTime?: string
  createdAt: string
  updatedAt: string
}

export interface HabitTracking {
  id: string
  habitId: string
  date: string
  completed: boolean
  notes?: string
  createdAt: string
}

export interface CreateHabitRequest {
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  category?: string
  color: string
  reminderTime?: string
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  frequency?: 'daily' | 'weekly' | 'monthly'
  category?: string
  color?: string
  reminderTime?: string
}

export interface TrackHabitRequest {
  date: string
  completed: boolean
  notes?: string
}

class HabitService {
  async getHabits(): Promise<Habit[]> {
    return api.get<Habit[]>('/habits')
  }

  async getHabitById(id: string): Promise<Habit> {
    return api.get<Habit>(`/habits/${id}`)
  }

  async createHabit(habitData: CreateHabitRequest): Promise<Habit> {
    return api.post<Habit>('/habits', habitData)
  }

  async updateHabit(id: string, updates: UpdateHabitRequest): Promise<Habit> {
    return api.patch<Habit>(`/habits/${id}`, updates)
  }

  async deleteHabit(id: string): Promise<void> {
    return api.delete(`/habits/${id}`)
  }

  async getHabitTracking(habitId: string, startDate?: string, endDate?: string): Promise<HabitTracking[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const queryString = params.toString()
    const url = `/habits/${habitId}/tracking${queryString ? `?${queryString}` : ''}`
    
    return api.get<HabitTracking[]>(url)
  }

  async trackHabit(habitId: string, trackingData: TrackHabitRequest): Promise<HabitTracking> {
    return api.post<HabitTracking>(`/habits/${habitId}/track`, trackingData)
  }

  async updateHabitTracking(habitId: string, date: string, updates: Partial<TrackHabitRequest>): Promise<HabitTracking> {
    return api.patch<HabitTracking>(`/habits/${habitId}/track/${date}`, updates)
  }

  async getHabitStats(habitId: string): Promise<{
    streak: number
    bestStreak: number
    completionRate: number
    totalCompleted: number
    totalDays: number
  }> {
    return api.get(`/habits/${habitId}/stats`)
  }

  async getOverallStats(): Promise<{
    totalHabits: number
    totalStreak: number
    averageCompletionRate: number
    bestHabit: Habit
    needsImprovement: Habit
  }> {
    return api.get('/habits/stats/overall')
  }

  // Helper methods
  calculateStreak(tracking: HabitTracking[]): number {
    if (tracking.length === 0) return 0
    
    const sortedTracking = tracking
      .filter(t => t.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let streak = 0
    let currentDate = new Date()
    
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

  calculateCompletionRate(tracking: HabitTracking[], frequency: string): number {
    if (tracking.length === 0) return 0
    
    const completed = tracking.filter(t => t.completed).length
    const total = tracking.length
    
    return Math.round((completed / total) * 100)
  }

  getHabitFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Diario'
      case 'weekly': return 'Semanal'
      case 'monthly': return 'Mensual'
      default: return 'Personalizado'
    }
  }

  getHabitColorOptions(): Array<{ name: string; value: string; bgClass: string; textClass: string }> {
    return [
      { name: 'Azul', value: '#3b82f6', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
      { name: 'Verde', value: '#10b981', bgClass: 'bg-green-500', textClass: 'text-green-500' },
      { name: 'Rojo', value: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-500' },
      { name: 'Amarillo', value: '#f59e0b', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
      { name: 'Púrpura', value: '#8b5cf6', bgClass: 'bg-purple-500', textClass: 'text-purple-500' },
      { name: 'Rosa', value: '#ec4899', bgClass: 'bg-pink-500', textClass: 'text-pink-500' },
      { name: 'Cian', value: '#06b6d4', bgClass: 'bg-cyan-500', textClass: 'text-cyan-500' },
      { name: 'Naranja', value: '#f97316', bgClass: 'bg-orange-500', textClass: 'text-orange-500' }
    ]
  }

  getMotivationMessage(streak: number, completionRate: number): string {
    if (streak >= 30) {
      return "¡Increíble! Llevas un mes completo. Eres una máquina de hábitos. 🏆"
    } else if (streak >= 21) {
      return "¡21 días! Has formado un hábito sólido. Sigue así. 💪"
    } else if (streak >= 14) {
      return "Dos semanas de racha. ¡Vas por buen camino! ✨"
    } else if (streak >= 7) {
      return "Una semana completa. Cada día cuenta. 👍"
    } else if (streak >= 3) {
      return "Buen comienzo. La consistencia es clave. 🌱"
    } else if (completionRate >= 80) {
      return "Excelente tasa de completitud. ¡Sigue así! 🎯"
    } else if (completionRate >= 50) {
      return "Vas por la mitad. Cada esfuerzo cuenta. 💫"
    } else {
      return "Hoy es un nuevo día para comenzar. ¡Tú puedes! 🚀"
    }
  }

  suggestOptimalReminderTime(habit: Habit): string {
    // Simple suggestion based on habit category
    switch (habit.category?.toLowerCase()) {
      case 'salud mental':
      case 'meditación':
        return '08:00' // Morning
      case 'ejercicio':
      case 'salud física':
        return '18:00' // Evening
      case 'aprendizaje':
      case 'lectura':
        return '20:00' // Night
      case 'hidratación':
        return '12:00' // Midday
      default:
        return '09:00' // Default morning
    }
  }

  validateHabitData(habitData: CreateHabitRequest): string[] {
    const errors: string[] = []
    
    if (!habitData.name.trim()) {
      errors.push('El nombre del hábito es requerido')
    }
    
    if (habitData.name.length > 50) {
      errors.push('El nombre no puede exceder 50 caracteres')
    }
    
    if (habitData.description && habitData.description.length > 200) {
      errors.push('La descripción no puede exceder 200 caracteres')
    }
    
    if (!['daily', 'weekly', 'monthly'].includes(habitData.frequency)) {
      errors.push('Frecuencia inválida')
    }
    
    if (habitData.category && habitData.category.length > 30) {
      errors.push('La categoría no puede exceder 30 caracteres')
    }
    
    // Validate color format
    const colorRegex = /^#[0-9A-F]{6}$/i
    if (!colorRegex.test(habitData.color)) {
      errors.push('Color inválido. Debe ser formato hexadecimal (#RRGGBB)')
    }
    
    // Validate reminder time format
    if (habitData.reminderTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(habitData.reminderTime)) {
      errors.push('Formato de hora inválido (HH:MM)')
    }
    
    return errors
  }

  calculateDailyHabitLimit(habits: Habit[]): number {
    const activeDailyHabits = habits.filter(h => h.frequency === 'daily').length
    
    // Base limit: 5 daily habits max for focus
    const baseLimit = 5
    
    if (activeDailyHabits <= baseLimit) {
      return baseLimit - activeDailyHabits
    } else {
      return 0 // Already at or over limit
    }
  }

  getHabitDifficulty(habit: Habit): 'fácil' | 'moderado' | 'difícil' {
    const factors = []
    
    if (habit.frequency === 'daily') factors.push(1)
    if (habit.description && habit.description.length > 50) factors.push(1)
    if (habit.category) factors.push(0.5)
    if (habit.reminderTime) factors.push(0.5)
    
    const score = factors.reduce((sum, factor) => sum + factor, 0)
    
    if (score <= 1) return 'fácil'
    if (score <= 2) return 'moderado'
    return 'difícil'
  }

  generateHabitIdeas(category?: string): string[] {
    const ideas: Record<string, string[]> = {
      'salud mental': [
        'Meditación 10 minutos',
        'Diario de gratitud',
        'Respiración consciente',
        'Paseo en la naturaleza',
        'Desconexión digital'
      ],
      'salud física': [
        'Estiramientos matutinos',
        'Caminata diaria',
        'Ejercicio en casa',
        'Postura correcta',
        'Hidratación constante'
      ],
      'aprendizaje': [
        'Lectura 20 páginas',
        'Aprender palabra nueva',
        'Curso online',
        'Practicar idioma',
        'Tomar notas'
      ],
      'productividad': [
        'Planificar día',
        'Revisar metas',
        'Organizar espacio',
        'Revisar emails',
        'Priorizar tareas'
      ],
      'relaciones': [
        'Llamar a familia',
        'Mensaje a amigo',
        'Expresar gratitud',
        'Escuchar activamente',
        'Compartir logros'
      ]
    }
    
    if (category && ideas[category.toLowerCase()]) {
      return ideas[category.toLowerCase()]
    }
    
    // Return all ideas if no category or category not found
    return Object.values(ideas).flat()
  }
}

export const habitService = new HabitService()