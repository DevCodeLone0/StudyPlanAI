import { useEffect, useState } from 'react'
import { useGamificationStore } from '@/stores/gamificationStore'

export function XPNotification() {
  const { recentXPChange, clearXPChange } = useGamificationStore()
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (recentXPChange !== null) {
      setVisible(true)
      setAnimating(true)

      const fadeTimer = setTimeout(() => setAnimating(false), 1800)
      const hideTimer = setTimeout(() => {
        setVisible(false)
        clearXPChange()
      }, 2000)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [recentXPChange, clearXPChange])

  if (!visible || recentXPChange === null) return null

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      <div
        className={`flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold text-lg shadow-lg ${
          animating
            ? 'animate-bounce opacity-100'
            : 'opacity-0 transition-opacity duration-200'
        }`}
      >
        <span>⭐</span>
        <span>+{recentXPChange} XP</span>
      </div>
    </div>
  )
}
