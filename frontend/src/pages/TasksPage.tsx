import { useState, useEffect } from 'react'
import { Plus, Search, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { useTaskStore } from '../stores/taskStore'
import { toast } from 'sonner'

const TasksPage = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 2 as 1 | 2 | 3 })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

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
        tags: [],
        timeSpent: 0
      })
      
      setNewTask({ title: '', description: '', priority: 2 })
      setIsAddingTask(false)
      toast.success('Tarea creada exitosamente')
    } catch (error) {
      toast.error('Error al crear tarea')
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return

    try {
      await deleteTask(taskId)
      toast.success('Tarea eliminada exitosamente')
    } catch (error) {
      toast.error('Error al eliminar tarea')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description?.toLowerCase().includes(search.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && task.status === 'pending') ||
                         (filter === 'completed' && task.status === 'completed') ||
                         (filter === 'in-progress' && task.status === 'in-progress')
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length
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
        
        <button
          onClick={() => setIsAddingTask(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nueva tarea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
                placeholder="Buscar tareas..."
              />
            </div>
          </div>
          
          <div className="w-full sm:w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
            >
              <option value="all">Todas las tareas</option>
              <option value="pending">Pendientes</option>
              <option value="in-progress">En progreso</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Nueva tarea
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                className="input"
                placeholder="¿Qué necesitas hacer?"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="input min-h-[100px] resize-none"
                placeholder="Detalles de la tarea..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Prioridad
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: parseInt(e.target.value) as 1 | 2 | 3 }))}
                className="input"
              >
                <option value="1">Alta</option>
                <option value="2">Media</option>
                <option value="3">Baja</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddTask}
                className="btn btn-primary flex-1"
              >
                Crear tarea
              </button>
              <button
                onClick={() => setIsAddingTask(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No hay tareas
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            {search || filter !== 'all'
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
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card p-4 hover:shadow-medium transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
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
                  
                  <div>
                    <h3 className={`font-medium ${
                      task.status === 'completed'
                        ? 'text-neutral-400 dark:text-neutral-500 line-through'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.priority === 1
                          ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-100'
                          : task.priority === 2
                          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100'
                          : 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100'
                      }`}>
                        {task.priority === 1 ? 'Alta' : task.priority === 2 ? 'Media' : 'Baja'}
                      </span>
                      
                      <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {task.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Completada</span>
                          </>
                        ) : task.status === 'in-progress' ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>En progreso</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TasksPage