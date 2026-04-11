import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Página no encontrada
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage