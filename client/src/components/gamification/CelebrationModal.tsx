import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Badge as BadgeType } from '@/services/gamificationService'

interface CelebrationModalProps {
  type: 'level_up' | 'badge_earned' | 'streak_milestone' | 'module_complete'
  data: {
    level?: number
    badge?: BadgeType
    streak?: number
    xpEarned?: number
    moduleName?: string
  }
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
  className?: string
}

const CELEBRATION_CONFIG = {
  level_up: {
    title: '¡NIVEL ALCANZADO!',
    icon: '⬆️',
    color: 'from-indigo-500 to-purple-600',
  },
  badge_earned: {
    title: '¡INsignia OBTENIDA!',
    icon: '🏅',
    color: 'from-yellow-400 to-orange-500',
  },
  streak_milestone: {
    title: '¡HITO DE RACHA!',
    icon: '🔥',
    color: 'from-orange-500 to-red-600',
  },
  module_complete: {
    title: '¡MÓDULO COMPLETADO!',
    icon: '✅',
    color: 'from-green-500 to-teal-600',
  },
}

export function CelebrationModal({
  type,
  data,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: CelebrationModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const config = CELEBRATION_CONFIG[type]

  useEffect(() => {
    setIsVisible(true)
    setShowConfetti(true)

    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    if (autoClose) {
      const autoCloseTimer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)

      return () => {
        clearTimeout(timer)
        clearTimeout(autoCloseTimer)
      }
    }

    return () => clearTimeout(timer)
  }, [autoClose, autoCloseDelay])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  const handleShare = () => {
    const shareText = getShareText()
    if (navigator.share) {
      navigator
        .share({
          title: config.title,
          text: shareText,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(shareText)
      alert('¡Copiado al portapapeles!')
    }
  }

  const getShareText = () => {
    switch (type) {
      case 'level_up':
        return `🎉 ¡Acabo de alcanzar el nivel ${data.level} en StudyPlanAI! ¡Sigue aprendiendo y creciendo! #StudyPlanAI #NivelAlcanzado`
      case 'badge_earned':
        return `🏅 ¡Acabo de obtener la insignia "${data.badge?.name}" en StudyPlanAI! #StudyPlanAI #InsigniaObtenida`
      case 'streak_milestone':
        return `🔥 ¡He mantenido una racha de ${data.streak} días en StudyPlanAI! La constancia es clave. #StudyPlanAI #Racha`
      case 'module_complete':
        return `✅ ¡Acabo de completar el módulo "${data.moduleName}" en StudyPlanAI! #StudyPlanAI #Aprendizaje`
      default:
        return '¡Mira mi progreso en StudyPlanAI!'
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'level_up':
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={clsx(
                  'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  config.color
                )}
              >
                <span className="text-5xl font-bold text-white">{data.level}</span>
              </div>
            </div>
            {data.xpEarned && (
              <div className="text-center">
                <Badge variant="success" size="md">
                  +{data.xpEarned} XP ganada
                </Badge>
              </div>
            )}
          </div>
        )

      case 'badge_earned':
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={clsx(
                  'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  config.color
                )}
              >
                <span className="text-5xl">{data.badge?.icon || '🏅'}</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{data.badge?.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{data.badge?.description}</p>
            </div>
            {data.xpEarned && (
              <div className="text-center">
                <Badge variant="success" size="md">
                  +{data.xpEarned} XP ganada
                </Badge>
              </div>
            )}
          </div>
        )

      case 'streak_milestone':
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={clsx(
                  'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  config.color
                )}
              >
                <span className="text-5xl font-bold text-white">{data.streak}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                ¡{data.streak} {data.streak === 1 ? 'día' : 'días'} de racha!
              </p>
            </div>
            {data.xpEarned && (
              <div className="text-center">
                <Badge variant="success" size="md">
                  +{data.xpEarned} XP ganada
                </Badge>
              </div>
            )}
          </div>
        )

      case 'module_complete':
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={clsx(
                  'w-24 h-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                  config.color
                )}
              >
                <span className="text-5xl">✅</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{data.moduleName}</h3>
              <p className="text-sm text-gray-500 mt-1">¡Módulo completado con éxito!</p>
            </div>
            {data.xpEarned && (
              <div className="text-center">
                <Badge variant="success" size="md">
                  +{data.xpEarned} XP ganada
                </Badge>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleClose}
    >
      <Card
        className={clsx(
          'max-w-md w-full transform transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
        onClick={() => {}}
      >
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <span className="text-4xl animate-bounce">{config.icon}</span>
          </div>
          <CardTitle className={clsx('text-2xl', config.color.replace('from-', 'text-').split(' ')[0])}>
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContent()}

          <div className="flex gap-3">
            <Button onClick={handleShare} variant="secondary" className="flex-1">
              Compartir
            </Button>
            <Button onClick={handleClose} variant="primary" className="flex-1">
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>

      {showConfetti && <ConfettiAnimation />}
    </div>
  )
}

function ConfettiAnimation() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999'
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
      rotation: number
      rotationSpeed: number
    }> = []

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe']

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }

    let animationFrame: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.3
        p.rotation += p.rotationSpeed

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      document.body.removeChild(canvas)
    }
  }, [])

  return null
}
