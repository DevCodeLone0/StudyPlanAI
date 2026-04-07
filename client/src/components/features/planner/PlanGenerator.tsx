import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, ProgressBar } from '@/components/ui'
import { planService } from '@/services/planService'
import { usePlanStore } from '@/stores/planStore'
import type { Plan } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

type GeneratorStep = 'form' | 'loading' | 'preview'

export function PlanGenerator({ onCreated }: { onCreated?: () => void } = {}) {
  const navigate = useNavigate()
  const { setActivePlan, addPlan } = usePlanStore()
  useTranslation()

  const [step, setStep] = useState<GeneratorStep>('form')
  const [generatedPlan, setGeneratedPlan] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    goal: '',
    duration: '',
    dailyTime: '',
    topics: '',
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStep('loading')

    try {
      const response = await planService.createPlan({
        goal: form.goal,
        duration: form.duration,
        dailyTime: form.dailyTime,
        topics: form.topics
          ? form.topics.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
      })

      setGeneratedPlan(response.plan)
      setStep('preview')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al generar el plan'
      setError(message)
      setStep('form')
    }
  }

  const handleAccept = async () => {
    if (!generatedPlan) return

    try {
      const activated = await planService.activatePlan(generatedPlan.id)
      setActivePlan(activated)
      addPlan(activated)
      if (onCreated) {
        onCreated()
      } else {
        navigate('/app/planner')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al activar el plan'
      setError(message)
    }
  }

  const handleRegenerate = () => {
    setGeneratedPlan(null)
    setStep('form')
  }

  if (step === 'loading') {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Generando tu plan...
          </h3>
          <p className="text-gray-600 mb-4">
            Nuestra IA está creando un plan personalizado para ti
          </p>
          <div className="max-w-xs mx-auto">
            <ProgressBar value={33} animated showLabel={false} />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'preview' && generatedPlan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📋 {generatedPlan.title}</CardTitle>
              <Badge variant="primary">Generado por IA</Badge>
            </div>
            {generatedPlan.description && (
              <p className="text-gray-600 mt-2">{generatedPlan.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Objetivo</p>
                <p className="font-medium text-gray-900">{generatedPlan.goal}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Duración</p>
                <p className="font-medium text-gray-900">{generatedPlan.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Tiempo diario</p>
                <p className="font-medium text-gray-900">{generatedPlan.dailyTime}</p>
              </div>
            </div>

            {generatedPlan.modules && generatedPlan.modules.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Módulos</h4>
                {generatedPlan.modules.map((mod, index) => (
                  <div
                    key={mod.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{mod.title}</p>
                      {mod.description && (
                        <p className="text-sm text-gray-500">{mod.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <Button variant="ghost" onClick={handleRegenerate}>
            Regenerar
          </Button>
          <Button onClick={handleAccept}>Aceptar Plan</Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <span className="text-6xl mb-4 block">📚</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Crea Tu Plan de Estudio
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Dinos tus objetivos de aprendizaje y nuestra IA creará un plan personalizado para ti.
        </p>

        <form onSubmit={handleGenerate} className="max-w-lg mx-auto text-left space-y-4">
          <Input
            label="¿Qué quieres aprender?"
            placeholder="ej. Aprender español B2, Dominar React, etc."
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duración"
              placeholder="ej. 3 meses"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
            <Input
              label="Tiempo diario"
              placeholder="ej. 1 hora"
              value={form.dailyTime}
              onChange={(e) => setForm({ ...form, dailyTime: e.target.value })}
              required
            />
          </div>

          <Input
            label="Temas específicos (opcional)"
            placeholder="Separados por coma: gramática, vocabulario, conversación"
            value={form.topics}
            onChange={(e) => setForm({ ...form, topics: e.target.value })}
          />

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full">
            Generar Plan con IA
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
