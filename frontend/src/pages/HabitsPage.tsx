import { useState, useEffect } from 'react'
import { 
  Plus, TrendingUp, Flame, Target, Calendar, BarChart, 
  MoreVertical, Edit, Trash2, CheckCircle, XCircle, 
  ChevronRight, Award, Clock, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Habit {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  bestStreak: number
  category?: string
  color: string
  reminderTime?: string
  tracking: HabitTracking[]
}

interface HabitTracking {
  id: string
  date: string
  completed: boolean
  notes?: string
}

const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Meditación',
      description: '10 minutos de meditación matutina',
      frequency: 'daily',
      streak: 7,
      bestStreak: 21,
      category: 'Salud mental',
      color: 'bg-primary-500',
      tracking: Array.from({ length: 7 }, (_, i) => ({
        id: `track-${i}`,
        date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        completed: i < 5,
        notes: i === 0 ? 'Difícil concentrarse hoy' : undefined
      }))
    },
    {
      id: '2',
      name: 'Ejercicio',
      description: '30 minutos de actividad física',
      frequency: 'daily',
      streak: 3,
      bestStreak: 14,
      category: 'Salud física',
      color: 'bg-success-500',
      tracking: Array.from({ length: 7 }, (_, i) => ({
        id: `track-ex-${i}`,
        date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        completed: i < 3,
        notes: i === 2 ? 'Caminata en el parque' : undefined
      }))
    },
    {
      id: '3',
      name: 'Agua 2L',
      description: 'Beber 2 litros de agua al día',
      frequency: 'daily',
      streak: 5,
      bestStreak: 10,
      category: 'Hidratación',
      color: 'bg-blue-500',
      tracking: Array.from({ length: 7 }, (_, i) => ({
        id: `track-water-${i}`,
        date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        completed: i < 5,
        notes: i === 4 ? 'Usé botella medidora' : undefined
      }))
    },
    {
      id: '4',
      name: 'Lectura',
      description: 'Leer 20 páginas diarias',
      frequency: 'daily',
      streak: 2,
      bestStreak: 8,
      category: 'Aprendizaje',
      color: 'bg-purple-500',
      tracking: Array.from({ length: 7 }, (_, i) => ({
        id: `track-read-${i}`,
        date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        completed: i < 2,
        notes: i === 1 ? 'Libro nuevo interesante' : undefined
      }))
    }
  ])
  
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [isEditingHabit, setIsEditingHabit] = useState<Habit | null>(null)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    category: '',
    color: 'bg-primary-500',
    reminderTime: ''
  })

  // Get current week dates for calendar view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('El nombre del hábito es requerido')
      return
    }

    const newHabitObj: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      frequency: newHabit.frequency,
      streak: 0,
      bestStreak: 0,
      category: newHabit.category || undefined,
      color: newHabit.color,
      reminderTime: newHabit.reminderTime || undefined,
      tracking: weekDays.map(day => ({
        id: `track-${Date.now()}-${day.getTime()}`,
        date: format(day, 'yyyy-MM-dd'),
        completed: false
      }))
    }

    setHabits([...habits, newHabitObj])
    resetForm()
    setIsAddingHabit(false)
    toast.success('¡Hábito creado exitosamente!')
  }

  const handleEditHabit = () => {
    if (!isEditingHabit) return

    const updatedHabits = habits.map(habit =>
      habit.id === isEditingHabit.id
        ? { ...habit, ...newHabit }
        : habit
    )

    setHabits(updatedHabits)
    resetForm()
    setIsEditingHabit(null)
    toast.success('Hábito actualizado exitosamente')
  }

  const handleDeleteHabit = (habitId: string) => {
    if (!confirm('¿Estás seguro de eliminar este hábito?')) return

    setHabits(habits.filter(habit => habit.id !== habitId))
    if (selectedHabit?.id === habitId) {
      setSelectedHabit(null)
    }
    toast.success('Hábito eliminado exitosamente')
  }

  const handleToggleHabit = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const updatedHabits = habits.map(habit => {
      if (habit.id !== habitId) return habit
      
      const trackingIndex = habit.tracking.findIndex(t => t.date === dateStr)
      let newTracking = [...habit.tracking]
      
      if (trackingIndex >= 0) {
        // Toggle existing tracking
        newTracking[trackingIndex] = {
          ...newTracking[trackingIndex],
          completed: !newTracking[trackingIndex].completed
        }
      } else {
        // Add new tracking
        newTracking.push({
          id: `track-${Date.now()}`,
          date: dateStr,
          completed: true
        })
      }
      
      // Calculate new streak
      const sortedTracking = newTracking
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
      
      const bestStreak = Math.max(habit.bestStreak, streak)
      
      return {
        ...habit,
        streak,
        bestStreak,
        tracking: newTracking
      }
    })
    
    setHabits(updatedHabits)
    toast.success('¡Hábito actualizado!')
  }

  const resetForm = () => {
    setNewHabit({
      name: '',
      description: '',
      frequency: 'daily',
      category: '',
      color: 'bg-primary-500',
      reminderTime: ''
    })
  }

  const handleEditClick = (habit: Habit) => {
    setIsEditingHabit(habit)
    setNewHabit({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      category: habit.category || '',
      color: habit.color,
      reminderTime: habit.reminderTime || ''
    })
  }

  const getHabitCompletionRate = (habit: Habit): number => {
    if (habit.tracking.length === 0) return 0
    
    const completed = habit.tracking.filter(t => t.completed).length
    return Math.round((completed / habit.tracking.length) * 100)
  }

  const getTotalStats = () => {
    const totalHabits = habits.length
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0)
    const totalCompleted = habits.reduce((sum, habit) => 
      sum + habit.tracking.filter(t => t.completed && isToday(new Date(t.date))).length, 0
    )
    const completionRate = totalHabits > 0 
      ? Math.round((totalCompleted / totalHabits) * 100)
      : 0

    return { totalHabits, totalStreak, totalCompleted, completionRate }
  }

  const getMotivationMessage = () => {
    const stats = getTotalStats()
    
    if (stats.completionRate === 100) {
      return "¡Increíble! Has completado todos tus hábitos hoy. 🎉"
    } else if (stats.completionRate >= 75) {
      return "¡Excelente trabajo! Casi llegas a la perfección. 💪"
    } else if (stats.completionRate >= 50) {
      return "Vas por buen camino. Sigue así. 👍"
    } else if (stats.completionRate >= 25) {
      return "Cada pequeño paso cuenta. Sigue adelante. 🌱"
    } else {
      return "Hoy es un nuevo día para comenzar. ¡Tú puedes! ✨"
    }
  }

  const colorOptions = [
    { name: 'Azul', value: 'bg-primary-500' },
    { name: 'Verde', value: 'bg-success-500' },
    { name: 'Rojo', value: 'bg-danger-500' },
    { name: 'Amarillo', value: 'bg-warning-500' },
    { name: 'Púrpura', value: 'bg-purple-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
  ]

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Hábitos</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Construye rutinas que transformen tu día
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-100 dark:bg-neutral-700' : ''}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-neutral-100 dark:bg-neutral-700' : ''}`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="bg-current h-1 rounded-full" />
                <div className="bg-current h-1 rounded-full" />
                <div className="bg-current h-1 rounded-full" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 ${viewMode === 'calendar' ? 'bg-neutral-100 dark:bg-neutral-700' : ''}`}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setIsAddingHabit(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo hábito
          </button>
        </div>
      </div>

      {/* Motivation and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Motivation Card */}
        <div className="card p-6 gradient-primary text-white lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">¡Sigue así!</h3>
              <p className="opacity-90">{getMotivationMessage()}</p>
            </div>
            <Award className="w-8 h-8 opacity-80" />
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalHabits}</div>
              <div className="text-sm opacity-80">Hábitos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalStreak}</div>
              <div className="text-sm opacity-80">Días de racha</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className="text-sm opacity-80">Completados hoy</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Estadísticas rápidas
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">Mejor racha</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {Math.max(...habits.map(h => h.bestStreak))} días
                </span>
              </div>
              <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-warning-500 rounded-full"
                  style={{ width: `${(Math.max(...habits.map(h => h.bestStreak)) / 30) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">Hábito más consistente</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {habits.reduce((best, habit) => 
                    getHabitCompletionRate(habit) > getHabitCompletionRate(best) ? habit : best
                  , habits[0])?.name || 'Ninguno'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">Necesita mejora</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {habits.reduce((worst, habit) => 
                    getHabitCompletionRate(habit) < getHabitCompletionRate(worst) ? habit : worst
                  , habits[0])?.name || 'Ninguno'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Grid/List */}
      {habits.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No hay hábitos
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Comienza construyendo tu primer hábito. Pequeños pasos llevan a grandes cambios.
          </p>
          <button
            onClick={() => setIsAddingHabit