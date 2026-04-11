import { create } from 'zustand'
import { taskService } from '../services/taskService'

export interface Task {
  id: string
  title: string
  description?: string
  priority: 1 | 2 | 3 // 1: alta, 2: media, 3: baja
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  isChunked: boolean
  parentTaskId?: string
  dueDate?: string
  estimatedDuration?: number // en minutos
  timeSpent: number
  tags: string[]
  category?: string
  createdAt: string
  updatedAt: string
}

interface TaskState {
  tasks: Task[]
  filteredTasks: Task[]
  selectedTask: Task | null
  isLoading: boolean
  error: string | null
  filters: {
    status: string[]
    priority: number[]
    tags: string[]
    category?: string
    search: string
  }
  
  // Actions
  fetchTasks: () => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setSelectedTask: (task: Task | null) => void
  setFilters: (filters: Partial<TaskState['filters']>) => void
  clearFilters: () => void
  applyFilters: () => void
  chunkTask: (taskId: string, subtasks: string[]) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    tags: [],
    category: undefined,
    search: ''
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await taskService.getTasks()
      set({ tasks, filteredTasks: tasks, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar tareas',
        isLoading: false 
      })
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null })
    try {
      const newTask = await taskService.createTask(taskData)
      set(state => ({
        tasks: [...state.tasks, newTask],
        filteredTasks: [...state.filteredTasks, newTask],
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear tarea',
        isLoading: false 
      })
      throw error
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTask = await taskService.updateTask(id, updates)
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? updatedTask : task
        ),
        filteredTasks: state.filteredTasks.map(task => 
          task.id === id ? updatedTask : task
        ),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar tarea',
        isLoading: false 
      })
      throw error
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await taskService.deleteTask(id)
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        filteredTasks: state.filteredTasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar tarea',
        isLoading: false 
      })
      throw error
    }
  },

  setSelectedTask: (task) => {
    set({ selectedTask: task })
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
    get().applyFilters()
  },

  clearFilters: () => {
    set({
      filters: {
        status: [],
        priority: [],
        tags: [],
        category: undefined,
        search: ''
      },
      filteredTasks: get().tasks
    })
  },

  applyFilters: () => {
    const { tasks, filters } = get()
    
    let filtered = tasks
    
    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status))
    }
    
    // Filter by priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority))
    }
    
    // Filter by tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task => 
        filters.tags.some(tag => task.tags.includes(tag))
      )
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category)
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    set({ filteredTasks: filtered })
  },

  chunkTask: async (taskId, subtasks) => {
    set({ isLoading: true, error: null })
    try {
      const chunkedTasks = await taskService.chunkTask(taskId, subtasks)
      set(state => ({
        tasks: [...state.tasks.filter(task => task.id !== taskId), ...chunkedTasks],
        filteredTasks: [...state.filteredTasks.filter(task => task.id !== taskId), ...chunkedTasks],
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al dividir tarea',
        isLoading: false 
      })
      throw error
    }
  }
}))