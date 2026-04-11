import { useState, useEffect } from 'react'
import { CheckCircle, TrendingUp, Award, Plus, MoreVertical } from 'lucide-react'
import { useTaskStore } from '../stores/taskStore'
import { toast } from 'sonner'

const TodayPage = () => {
  const { tasks, fetchTasks, createTask, updateTask } = useTaskStore()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    let interval: any = null
    
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((time) => time - 1)
      }, 1000)
    } else if (pomodoroTime === 0) {
      if (!isBreak) {
        // Work session ended, start break
        setIsBreak(true)
        setPomodoroTime(5 * 60) // 5 minute break
        toast.success('¡Sesión de trabajo completada! Toma un descanso de 5 minutos.')
      } else {
        // Break ended, start work session
        setIsBreak(false)
        setPomodoroTime(25 * 60) // 25 minute work session
        toast.success('¡Descanso completado! Comienza una nueva sesión de trabajo.')
      }
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPomodoroRunning, pomodoroTime, isBreak])

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    return dueDate.toDateString() === today.toDateString()
  }).slice(0, 5) // Show only top 5 tasks

  const habits = [
    { id: 1, name: 'Meditación', completed: true },
    { id: 2, name: 'Ejercicio', completed: false },
    { id: 3, name: 'Agua 2L', completed: true },
    { id: 4, name: 'Sueño 8h', completed: false },
  ]

  const achievements = [
    { id: 1, title: '3 días seguidos', description: 'Completando todas las tareas' },
    { id: 2, title: 'Récord personal', description: '10 Pomodoros en un día' },
  ]

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      await createTask({
        title: newTaskTitle,
        description: '',
        priority: 2,
        status: 'pending',
        isChunked: false,
        tags: [],
        timeSpent: 0,
        dueDate: new Date().toISOString()
      })
      
      setNewTaskTitle('')
      setIsAddingTask(false)
      toast.success('Tarea agregada exitosamente')
    } catch (error) {
      toast.error('Error al agregar tarea')
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const togglePomodoro = () => {
    setIsPomodoroRunning(!isPomodoroRunning)
  }

  const resetPomodoro = () => {
    setIsPomodoroRunning(false)
    setIsBreak(false)
    setPomodoroTime(25 * 60)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Hoy</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
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

      {/* Pomodoro Timer */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Temporizador Pomodoro
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isBreak ? 'text-success-600 dark:text-success-400' : 'text-primary-600 dark:text-primary-400'}`}>
              {isBreak ? 'Descanso' : 'Trabajo'}
            </span>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className={`pomodoro-timer ${isBreak ? 'pomodoro-break' : 'pomodoro-work'}`}>
            {formatTime(pomodoroTime)}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            {isBreak ? 'Descansa un poco' : 'Enfócate en tu tarea'}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={togglePomodoro}
            className={`btn ${isPomodoroRunning ? 'btn-danger' : 'btn-success'}`}
          >
            {isPomodoroRunning ? 'Pausar' : 'Comenzar'}
          </button>
          <button
            onClick={resetPomodoro}
            className="btn btn-secondary"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Tareas prioritarias de hoy
          </h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {todayTasks.filter(t => t.status === 'completed').length} de {todayTasks.length} completadas
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">No hay tareas para hoy</p>
            <button
              onClick={() => setIsAddingTask(true)}
              className="mt-3 text-primary-600 dark:text-primary-400 hover:underline"
            >
              Agregar tu primera tarea
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-success-500 border-success-500'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-success-500'
                  }`}
                >
                  {task.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    task.status === 'completed'
                      ? 'text-neutral-400 dark:text-neutral-500 line-through'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    task.priority === 1
                      ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-100'
                      : task.priority === 2
                      ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100'
                      : 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100'
                  }`}>
                    {task.priority === 1 ? 'Alta' : task.priority === 2 ? 'Media' : 'Baja'}
                  </span>
                  <button className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habits & Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Hábitos de hoy
            </h2>
          </div>
          
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {habit.name}
                </span>
                <button
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    habit.completed
                      ? 'bg-success-500 border-success-500'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-success-500'
                  }`}
                >
                  {habit.completed && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 btn btn-ghost text-sm">
            Ver todos los hábitos
          </button>
        </div>

        {/* Recent Achievements */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Logros recientes
            </h2>
          </div>
          
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800"
              >
                <div className="w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="font-medium text-warning-800 dark:text-warning-200">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-warning-600 dark:text-warning-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 btn btn-ghost text-sm">
            Ver todos los logros
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="modal-backdrop">
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-hard max-w-md w-full p-6 animate-slide-in">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Agregar nueva tarea
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Título de la tarea
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="input"
                    placeholder="¿Qué necesitas hacer?"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask()
                      if (e.key === 'Escape') setIsAddingTask(false)
                    }}
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    className="btn btn-primary"
                  >
                    Agregar tarea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TodayPage