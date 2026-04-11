import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, Brain } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'
import { toast } from 'sonner'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    const emailError = authService.validateEmail(email)
    if (emailError) newErrors.email = emailError
    
    const passwordError = authService.validatePassword(password)
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors({})
    
    try {
      await login(email, password)
      toast.success('¡Bienvenido de nuevo!')
      navigate('/')
    } catch (error: any) {
      if (error.status === 401) {
        setErrors({
          email: 'Credenciales inválidas',
          password: 'Credenciales inválidas'
        })
        toast.error('Email o contraseña incorrectos')
      } else {
        toast.error('Error al iniciar sesión')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      // Try to login with demo credentials
      await login('demo@neuroasistente.com', 'Demo123!')
      toast.success('¡Modo demo activado!')
      navigate('/')
    } catch {
      // If demo user doesn't exist, show instructions
      toast.info('Para probar la demo, primero crea una cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = authService.getPasswordStrength(password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            NeuroAsistente
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Dashboard para adultos con TDAH
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Iniciar sesión
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Accede a tu dashboard personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contraseña
                </label>
                <Link
                  to="/password-reset"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {errors.password}
                </p>
              )}
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Fortaleza: {passwordStrength.label}
                    </span>
                    <span style={{ color: passwordStrength.color }}>
                      {passwordStrength.score}/4
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(passwordStrength.score / 4) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar sesión
                </>
              )}
            </button>

            {/* Demo button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full btn btn-secondary"
            >
              Probar demo
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                ¿No tienes una cuenta?
              </span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Crear una cuenta
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Pomodoro Timer</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Gestión de Tareas</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Seguimiento de Hábitos</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Diseñado específicamente para necesidades neurodivergentes
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Accesibilidad y simplicidad como prioridad
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage