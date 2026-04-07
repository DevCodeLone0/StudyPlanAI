import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { useTranslation } from '@/hooks/useTranslation'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWakingUp, setShowWakingUp] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  useTranslation()

  const validate = () => {
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    const wakingUpTimer = setTimeout(() => setShowWakingUp(true), 3000)

    try {
      const response = await authService.login({ email, password })
      setAuth(response.user, response.accessToken)
      toast.success('¡Bienvenido de nuevo!')
      navigate('/app/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      clearTimeout(wakingUpTimer)
      setShowWakingUp(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">StudyPlanAI</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar tu aprendizaje</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {showWakingUp ? 'Despertando servidor...' : 'Iniciar sesión'}
          </Button>
          {showWakingUp && (
            <p className="text-center text-sm text-gray-500 mt-2">
              La primera solicitud tarda un momento...
            </p>
          )}
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
