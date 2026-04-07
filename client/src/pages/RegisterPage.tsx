import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Button, Input, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { useTranslation } from '@/hooks/useTranslation'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWakingUp, setShowWakingUp] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  useTranslation()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!email) {
      newErrors.email = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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
      const response = await authService.register({ name, email, password })
      setAuth(response.user, response.accessToken)
      toast.success('¡Cuenta creada! Bienvenido a StudyPlanAI 🎉')
      navigate('/app/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error en el registro')
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
          <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Comienza tu camino de aprendizaje</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            error={errors.name}
          />

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
            hint="Mínimo 8 caracteres"
            error={errors.password}
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.confirmPassword}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {showWakingUp ? 'Despertando servidor...' : 'Crear cuenta'}
          </Button>
          {showWakingUp && (
            <p className="text-center text-sm text-gray-500 mt-2">
              La primera solicitud tarda un momento...
            </p>
          )}
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
