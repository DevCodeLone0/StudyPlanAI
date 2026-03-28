import { useEffect } from 'react'
import { CelebrationModal } from '@/components/gamification/CelebrationModal'
import { useCelebrationStore } from '@/stores/celebrationStore'

export function CelebrationProvider() {
  const { currentEvent, dismissCurrent } = useCelebrationStore()

  useEffect(() => {
    if (currentEvent) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [currentEvent])

  if (!currentEvent) return null

  return (
    <CelebrationModal
      type={currentEvent.type}
      data={currentEvent.data}
      onClose={dismissCurrent}
      autoClose={true}
      autoCloseDelay={5000}
    />
  )
}
