import { api } from './api'
import { Task } from '../stores/taskStore'

export interface CreateTaskRequest {
  title: string
  description?: string
  priority: 1 | 2 | 3
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  isChunked: boolean
  parentTaskId?: string
  dueDate?: string
  estimatedDuration?: number
  tags: string[]
  category?: string
  timeSpent: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: 1 | 2 | 3
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  isChunked?: boolean
  parentTaskId?: string
  dueDate?: string
  estimatedDuration?: number
  tags?: string[]
  category?: string
  timeSpent?: number
}

export interface TaskFilter {
  status?: string[]
  priority?: number[]
  tags?: string[]
  category?: string
  search?: string
}

class TaskService {
  async getTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks')
  }

  async getTaskById(id: string): Promise<Task> {
    return api.get<Task>(`/tasks/${id}`)
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    return api.post<Task>('/tasks', taskData)
  }

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    return api.patch<Task>(`/tasks/${id}`, updates)
  }

  async deleteTask(id: string): Promise<void> {
    return api.delete(`/tasks/${id}`)
  }

  async chunkTask(taskId: string, subtasks: string[]): Promise<Task[]> {
    return api.post<Task[]>(`/tasks/${taskId}/chunk`, { subtasks })
  }

  async getTasksByFilter(filter: string, params?: TaskFilter): Promise<Task[]> {
    const queryParams = new URLSearchParams()
    
    if (params?.status) {
      params.status.forEach(status => queryParams.append('status', status))
    }
    
    if (params?.priority) {
      params.priority.forEach(priority => queryParams.append('priority', priority.toString()))
    }
    
    if (params?.tags) {
      params.tags.forEach(tag => queryParams.append('tag', tag))
    }
    
    if (params?.category) {
      queryParams.append('category', params.category)
    }
    
    if (params?.search) {
      queryParams.append('search', params.search)
    }
    
    const queryString = queryParams.toString()
    const url = `/tasks/filter/${filter}${queryString ? `?${queryString}` : ''}`
    
    return api.get<Task[]>(url)
  }

  async updateTaskTime(taskId: string, timeSpent: number): Promise<Task> {
    return api.patch<Task>(`/tasks/${taskId}/time`, { timeSpent })
  }

  // Helper methods for task management
  calculateTaskProgress(task: Task): number {
    if (task.status === 'completed') return 100
    if (task.status === 'in-progress') return 50
    return 0
  }

  getTaskPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Alta'
      case 2: return 'Media'
      case 3: return 'Baja'
      default: return 'Sin prioridad'
    }
  }

  getTaskStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'in-progress': return 'En progreso'
      case 'completed': return 'Completada'
      case 'cancelled': return 'Cancelada'
      default: return 'Desconocido'
    }
  }

  formatDueDate(dueDate?: string): string {
    if (!dueDate) return 'Sin fecha'
    
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays === -1) return 'Ayer'
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`
    if (diffDays < 7) return `En ${diffDays} días`
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'completed') return false
    
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    
    return dueDate < now
  }

  estimateTaskComplexity(task: Task): 'simple' | 'medium' | 'complex' {
    const titleLength = task.title.length
    const hasDescription = !!task.description
    const tagCount = task.tags.length
    const hasDueDate = !!task.dueDate
    const hasDuration = !!task.estimatedDuration
    
    let score = 0
    if (titleLength > 50) score += 1
    if (hasDescription) score += 1
    if (tagCount > 3) score += 1
    if (hasDueDate) score += 1
    if (hasDuration) score += 1
    
    if (score <= 1) return 'simple'
    if (score <= 3) return 'medium'
    return 'complex'
  }

  suggestTaskChunking(task: Task): string[] {
    const complexity = this.estimateTaskComplexity(task)
    
    if (complexity === 'simple') {
      return []
    }
    
    const suggestions: string[] = []
    
    if (task.description && task.description.length > 100) {
      suggestions.push('Dividir descripción en pasos específicos')
    }
    
    if (task.estimatedDuration && task.estimatedDuration > 60) {
      suggestions.push(`Dividir en sesiones de ${Math.ceil(task.estimatedDuration / 2)} minutos`)
    }
    
    if (complexity === 'complex') {
      suggestions.push('Crear subtareas para cada componente')
      suggestions.push('Establecer hitos intermedios')
    }
    
    return suggestions
  }

  calculateDailyTaskLimit(tasks: Task[]): number {
    // Simplified calculation for demo
    const completedCount = tasks.filter(task => task.status === 'completed').length
    
    // Base limit: 5 tasks per day, adjust based on completion rate
    const baseLimit = 5
    const completionRate = tasks.filter(t => t.status === 'completed').length / tasks.length
    
    if (completionRate > 0.8) {
      return baseLimit + 2 // High performer
    } else if (completionRate > 0.5) {
      return baseLimit + 1 // Average performer
    } else if (completionRate < 0.3) {
      return baseLimit - 2 // Needs smaller goals
    }
    
    return baseLimit
  }

  getTaskMotivationMessage(_task: Task): string {
    const messages = [
      "¡Tú puedes! Un paso a la vez.",
      "Cada tarea completada es un logro.",
      "Divide y vencerás. Puedes hacerlo.",
      "Pequeños pasos llevan a grandes resultados.",
      "Concéntrate en el proceso, no en la perfección.",
      "Celebra cada progreso, por pequeño que sea.",
      "La consistencia es más importante que la intensidad.",
      "Respira y continúa. Estás haciendo un gran trabajo."
    ]
    
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
  }

  validateTaskData(taskData: CreateTaskRequest): string[] {
    const errors: string[] = []
    
    if (!taskData.title.trim()) {
      errors.push('El título es requerido')
    }
    
    if (taskData.title.length > 200) {
      errors.push('El título no puede exceder 200 caracteres')
    }
    
    if (taskData.description && taskData.description.length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres')
    }
    
    if (taskData.priority < 1 || taskData.priority > 3) {
      errors.push('La prioridad debe ser entre 1 y 3')
    }
    
    if (taskData.estimatedDuration && taskData.estimatedDuration < 1) {
      errors.push('La duración estimada debe ser positiva')
    }
    
    if (taskData.tags.length > 10) {
      errors.push('Máximo 10 etiquetas por tarea')
    }
    
    return errors
  }
}

export const taskService = new TaskService()