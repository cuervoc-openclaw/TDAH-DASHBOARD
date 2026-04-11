import { useState } from 'react'
import { Plus, TrendingUp, Flame, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Habit {
  id: string
  name: string
  description?: string
  streak: number
  bestStreak: number
  color: string
  completedToday: boolean
}

const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Meditación',
      description: '10 minutos de meditación matutina',
      streak: 7,
      bestStreak: 21,
      color: 'bg-primary-500',
      completedToday: true
    },
    {
      id: '2',
      name: 'Ejercicio',
      description: '30 minutos de actividad física',
      streak: 3,
      bestStreak: 14,
      color: 'bg-success-500',
      completedToday: false
    },
    {
      id: '3',
      name: 'Agua 2L',
      description: 'Beber 2 litros de agua al día',
      streak: 5,
      bestStreak: 10,
      color: 'bg-blue-500',
      completedToday: true
    },
    {
      id: '4',
      name: 'Lectura',
      description: 'Leer 20 páginas diarias',
      streak: 2,
      bestStreak: 8,
      color: 'bg-purple-500',
      completedToday: false
    }
  ])
  
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', description: '', color: 'bg-primary-500' })

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('El nombre del hábito es requerido')
      return
    }

    const newHabitObj: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      streak: 0,
      bestStreak: 0,
      color: newHabit.color,
      completedToday: false
    }

    setHabits([...habits, newHabitObj])
    setNewHabit({ name: '', description: '', color: 'bg-primary-500' })
    setIsAddingHabit(false)
    toast.success('¡Hábito creado exitosamente!')
  }

  const handleToggleHabit = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== habitId) return habit
      
      const completedToday = !habit.completedToday
      const streak = completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1)
      const bestStreak = Math.max(habit.bestStreak, streak)
      
      return {
        ...habit,
        completedToday,
        streak,
        bestStreak
      }
    }))
    
    toast.success('¡Hábito actualizado!')
  }

  const handleDeleteHabit = (habitId: string) => {
    if (!confirm('¿Estás seguro de eliminar este hábito?')) return

    setHabits(habits.filter(habit => habit.id !== habitId))
    toast.success('Hábito eliminado exitosamente')
  }

  const stats = {
    totalHabits: habits.length,
    totalStreak: habits.reduce((sum, habit) => sum + habit.streak, 0),
    completedToday: habits.filter(h => h.completedToday).length,
    completionRate: habits.length > 0 
      ? Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100)
      : 0
  }

  const colorOptions = [
    { name: 'Azul', value: 'bg-primary-500' },
    { name: 'Verde', value: 'bg-success-500' },
    { name: 'Rojo', value: 'bg-danger-500' },
    { name: 'Amarillo', value: 'bg-warning-500' },
    { name: 'Púrpura', value: 'bg-purple-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
  ]

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
        
        <button
          onClick={() => setIsAddingHabit(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo hábito
        </button>
      </div>

      {/* Motivation and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Motivation Card */}
        <div className="card p-6 gradient-primary text-white lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">¡Sigue así!</h3>
              <p className="opacity-90">
                {stats.completionRate === 100 
                  ? "¡Increíble! Has completado todos tus hábitos hoy. 🎉"
                  : stats.completionRate >= 75
                  ? "¡Excelente trabajo! Casi llegas a la perfección. 💪"
                  : stats.completionRate >= 50
                  ? "Vas por buen camino. Sigue así. 👍"
                  : "Cada pequeño paso cuenta. Sigue adelante. 🌱"}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
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
                    habit.streak > best.streak ? habit : best
                  , habits[0])?.name || 'Ninguno'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">Necesita mejora</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {habits.reduce((worst, habit) => 
                    habit.streak < worst.streak ? habit : worst
                  , habits[0])?.name || 'Ninguno'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {isAddingHabit && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Nuevo hábito
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nombre del hábito *
              </label>
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="Ej: Meditación, Ejercicio, Lectura..."
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                className="input min-h-[80px] resize-none"
                placeholder="Detalles del hábito..."
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewHabit(prev => ({ ...prev, color: color.value }))}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                      newHabit.color === color.value
                        ? 'ring-2 ring-primary-500 ring-offset-2'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${color.value} mb-1`} />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddHabit}
                className="btn btn-primary flex-1"
              >
                Crear hábito
              </button>
              <button
                onClick={() => setIsAddingHabit(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No hay hábitos
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Comienza construyendo tu primer hábito. Pequeños pasos llevan a grandes cambios.
          </p>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Crear primer hábito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="card p-6 hover:shadow-medium transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${habit.color} flex items-center justify-center`}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {habit.name}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-1 text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Streak */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-warning-500" />
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Racha actual: {habit.streak} días
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Mejor: {habit.bestStreak}
                  </span>
                </div>
                
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-600 dark:text-neutral-400">Progreso</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {habit.completedToday ? 'Completado hoy' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: habit.completedToday ? '100%' : '0%',
                        backgroundColor: habit.color.replace('bg-', '').split('-')[0]
                      }}
                    />
                  </div>
                </div>
                
                {/* Quick actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`flex-1 btn text-sm py-1.5 ${
                      habit.completedToday
                        ? 'btn-success'
                        : 'btn-secondary'
                    }`}
                  >
                    {habit.completedToday ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Completado
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Marcar como hecho
                      </>
                    )}
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

export default HabitsPage