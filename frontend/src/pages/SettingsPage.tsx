import { useState } from 'react'
import { Moon, Sun, Contrast, Bell, Clock, Palette, User, Shield, Download, Trash2, LogOut, Save } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

const SettingsPage = () => {
  const { theme, setTheme, fontSize, setFontSize, reduceMotion, toggleReduceMotion } = useThemeStore()
  const { logout } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState('appearance')
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    whatsapp: false,
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00'
  })
  
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true
  })

  const handleSaveSettings = () => {
    toast.success('Configuración guardada exitosamente')
  }

  const handleExportData = () => {
    toast.info('Exportando datos... Esta función estará disponible pronto.')
  }

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      toast.error('Eliminación de cuenta deshabilitada en demo')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const themeOptions = [
    { id: 'light', name: 'Claro', icon: Sun, description: 'Tema claro estándar' },
    { id: 'dark', name: 'Oscuro', icon: Moon, description: 'Tema oscuro para reducir fatiga visual' },
    { id: 'high-contrast', name: 'Alto contraste', icon: Contrast, description: 'Máxima accesibilidad visual' }
  ]

  const fontSizeOptions = [
    { value: 14, label: 'Pequeño' },
    { value: 16, label: 'Mediano' },
    { value: 18, label: 'Grande' },
    { value: 20, label: 'Extra grande' }
  ]

  const tabs = [
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'pomodoro', name: 'Pomodoro', icon: Clock },
    { id: 'account', name: 'Cuenta', icon: User },
    { id: 'privacy', name: 'Privacidad', icon: Shield },
    { id: 'data', name: 'Datos', icon: Download }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Configuración</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Personaliza NeuroAsistente a tu medida
          </p>
        </div>
        
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary"
        >
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>

      {/* Settings layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="card p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Tema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as any)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === option.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            theme === option.id
                              ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {option.name}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-left">
                          {option.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Tamaño de texto
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Ajusta el tamaño del texto para mejor legibilidad
                  </div>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="input w-40"
                  >
                    {fontSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.value}px)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <p style={{ fontSize: `${fontSize}px` }} className="text-neutral-900 dark:text-neutral-100">
                    Texto de ejemplo con el tamaño actual. Ajusta según tu preferencia.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Accesibilidad
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        Reducir animaciones
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Minimiza movimientos y transiciones
                      </div>
                    </div>
                    <button
                      onClick={toggleReduceMotion}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reduceMotion ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          reduceMotion ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Canales de notificación
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          Notificaciones push
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          En el navegador y dispositivo
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Horario silencioso
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        Activar horario silencioso
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Silencia notificaciones durante la noche
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, quietHours: !prev.quietHours }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.quietHours ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.quietHours ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {notifications.quietHours && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Inicio
                        </label>
                        <input
                          type="time"
                          value={notifications.quietStart}
                          onChange={(e) => setNotifications(prev => ({ ...prev, quietStart: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Fin
                        </label>
                        <input
                          type="time"
                          value={notifications.quietEnd}
                          onChange={(e) => setNotifications(prev => ({ ...prev, quietEnd: e.target.value }))}
                          className="input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pomodoro Settings */}
          {activeTab === 'pomodoro' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Duración de sesiones
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Tiempo de trabajo (minutos)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={pomodoroSettings.workDuration}
                        onChange={(e) => setPomodoroSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100 w-12">
                        {pomodoroSettings.workDuration}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Tiempo de descanso corto (minutos)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={pomodoroSettings.breakDuration}
                        onChange={(e) => setPomodoroSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100 w-12">
                        {pomodoroSettings.breakDuration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Comportamiento
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        Iniciar descansos automáticamente
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Comienza el descanso al terminar el trabajo
                      </div>
                    </div>
                    <button
                      onClick={() => setPomodoroSettings(prev => ({ ...prev, autoStartBreaks: !prev.autoStartBreaks }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pomodoroSettings.autoStartBreaks ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pomodoroSettings.autoStartBreaks ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        Sonido de notificaciones
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Reproducir sonido al cambiar sesiones
                      </div>
                    </div>
                    <button
                      onClick={() => setPomodoroSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pomodoroSettings.soundEnabled ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pomodoroSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Sesión
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={handleLogout}
                    className="w-full btn btn-secondary"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data Settings */}
          {activeTab === 'data' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Exportar datos
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Descarga todos tus datos en formato JSON para respaldo o migración.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="btn btn-primary"
                  >
                    <Download className="w-4 h-4" />
                    Exportar todos los datos
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Eliminar cuenta
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Esta acción eliminará permanentemente todos tus datos y no se puede deshacer.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="btn btn-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage