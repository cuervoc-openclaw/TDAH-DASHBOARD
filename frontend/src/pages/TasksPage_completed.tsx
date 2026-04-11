import { useState, useEffect } from 'react'
import { 
  Plus, Search, Filter, Calendar, Tag, Flag, MoreVertical, 
  CheckCircle, Clock, AlertCircle, Edit, Trash2, ChevronDown,
  List, Grid, SortAsc, X
} from 'lucide-react'
import { useTaskStore, Task } from '../stores/taskStore'
import { toast } from 'sonner'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const TasksPage = () => {
  const { 
    tasks, 
    filteredTasks, 
    fetchTasks, 
    createTask, 
    updateTask, 
    deleteTask,
    setFilters,
    clearFilters,
    filters
  } = useTaskStore()
  
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 2 as 1 | 2 | 3,
    dueDate: '',
    tags: [] as string[],
    category: '',
    estimatedDuration: ''
  })
  
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('El título es requerido')
      return
    }

    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: 'pending',
        isChunked: false,
        tags: newTask.tags,
        category: newTask.category || undefined,
        estimatedDuration: newTask.estimatedDuration ? parseInt(newTask.estimatedDuration) : undefined,
        dueDate: newTask.dueDate || new Date().toISOString(),
        timeSpent: 0
      })
      
      resetForm()
      setIsAddingTask(false)
      toast.success('Tarea creada exitosamente')
    } catch (error) {
      toast.error('Error al crear tarea')
    }
  }

  const handleEditTask = async () => {
    if (!isEditingTask || !newTask.title.trim()) return

    try {
      await updateTask(isEditingTask.id, {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        tags: newTask.tags,
        category: newTask.category || undefined,
        estimatedDuration: newTask.estimatedDuration ? parseInt(newTask.estimatedDuration) : undefined,
        dueDate: newTask.dueDate || undefined
      })
      
      resetForm()
      setIsEditingTask(null)
      toast.success('Tarea actualizada exitosamente')
    } catch (error) {
      toast.error('Error al actualizar tarea')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return

    try {
      await deleteTask(taskId)
      toast.success('Tarea eliminada exitosamente')
    } catch (error) {
      toast.error('Error al eliminar tarea')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'completed' })
      toast.success('¡Tarea completada!')
    } catch (error) {
      toast.error('Error al completar tarea')
    }
  }

  const handleStartTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'in-progress' })
      toast.success('Tarea iniciada')
    } catch (error) {
      toast.error('Error al iniciar tarea')
    }
  }

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 2,
      dueDate: '',
      tags: [],
      category: '',
      estimatedDuration: ''
    })
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleEditClick = (task: Task) => {
    setIsEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : '',
      tags: task.tags,
      category: task.category || '',
      estimatedDuration: task.estimatedDuration?.toString() || ''
    })
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-100'
      case 2: return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100'
      case 3: return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-warning-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />
    }
  }

  const getDueDateLabel = (dueDate?: string) => {
    if (!dueDate) return 'Sin fecha'
    
    const date = parseISO(dueDate)
    
    if (isToday(date)) return 'Hoy'
    if (isTomorrow(date)) return 'Mañana'
    if (isPast(date)) return 'Vencida'
    
    return format(date, 'dd MMM', { locale: es })
  }

  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return 'text-neutral-500'
    
    const date = parseISO(dueDate)
    
    if (isPast(date)) return 'text-danger-600 dark:text-danger-400'
    if (isToday(date)) return 'text-warning-600 dark:text-warning-400'
    if (isTomorrow(date)) return 'text-primary-600 dark:text-primary-400'
    
    return 'text-neutral-600 dark:text-neutral-400'
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'dueDate':
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        comparison = dateA - dateB
        break
        
      case 'priority':
        comparison = a.priority - b.priority
        break
        
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Tareas</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {stats.total} tareas • {stats.completed} completadas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-neutral-100 dark:bg-neutral-700' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-100 dark:bg-neutral-700' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setIsAddingTask(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nueva tarea
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.total}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Total</div>
        </div>
        
        <div className="card p-4">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            {stats.completed}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Completadas</div>
        </div>
        
        <div className="card p-4">
          <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {stats.inProgress}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">En progreso</div>
        </div>
        
        <div className="card p-4">
          <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
            {stats.pending}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Pendientes</div>
        </div>
        
        <div className="card p-4">
          <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">
            {stats.overdue}
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Vencidas</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="input pl-9"
                  placeholder="Buscar tareas..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Estado
              </label>
              <select
                value={filters.status[0] || ''}
                onChange={(e) => setFilters({ status: e.target.value ? [e.target.value] : [] })}
                className="input"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Prioridad
              </label>
              <select
                value={filters.priority[0] || ''}
                onChange={(e) => setFilters({ priority: e.target.value ? [parseInt(e.target.value)] : [] })}
                className="input"
              >
                <option value="">Todas las prioridades</option>
                <option value="1">Alta</option>
                <option value="2">Media</option>
                <option value="3">Baja</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Mostrando {sortedTasks.length} de {tasks.length} tareas
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input text-sm py-1"
          >
            <option value="dueDate">Fecha de vencimiento</option>
            <option value="priority">Prioridad</option>
            <option value="createdAt">Fecha de creación</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <SortAsc className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tasks list/grid */}
      {sortedTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No hay tareas
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            {filters.search || filters.status.length > 0 || filters.priority.length > 0
              ? 'No hay tareas que coincidan con los filtros'
              : 'Comienza creando tu primera tarea'}
          </p>
          <button
            onClick={() => setIsAddingTask(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Crear primera tarea
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List view */
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="card p-4 hover:shadow-medium transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Status checkbox */}
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-success-500 border-success-500'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-success-500'
                  }`}
                >
                  {task.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </button>
                
                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-medium ${
                        task.status === 'completed'
                          ? 'text-neutral-400 dark:text-neutral-500 line-through'
                          : 'text-neutral-