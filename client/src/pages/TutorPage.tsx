import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { aiService, type AIContext } from '@/services/aiService'
import { ContextBanner } from '@/components/tutor/ContextBanner'
import { useTranslation } from '@/hooks/useTranslation'

export function TutorPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "¡Hola! Soy tu tutor IA de estudio. Puedo ayudarte con:\n\n• Entender conceptos difíciles\n• Explicar temas de diferentes maneras\n• Proporcionar ejemplos y práctica\n• ¡Mantenerte motivado!\n\n¿En qué te gustaría que te ayude hoy?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState<AIContext | null>(null)
  const [contextLoading, setContextLoading] = useState(true)

  // Fetch AI context on mount
  useEffect(() => {
    const fetchContext = async () => {
      try {
        setContextLoading(true)
        const ctx = await aiService.getContext()
        setContext(ctx)
      } catch (error) {
        console.error('Failed to fetch AI context:', error)
      } finally {
        setContextLoading(false)
      }
    }

    fetchContext()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the AI backend (context is now auto-injected server-side)
      const response = await aiService.chat({
        message: userMessage.content,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
        },
      ])
    } catch (error) {
      console.error('AI chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Lo siento, estoy teniendo problemas para conectarme. Por favor intenta de nuevo en un momento. 🔧",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">🤖 Tutor IA</h1>

      {/* Context Banner */}
      <ContextBanner
        context={context}
        isLoading={contextLoading}
        className="mb-4"
      />

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntame cualquier cosa sobre tu estudio..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
              Enviar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
