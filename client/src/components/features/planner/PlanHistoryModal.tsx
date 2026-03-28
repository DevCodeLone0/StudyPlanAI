import { useState, useEffect } from 'react'
import { Modal, Button, Badge } from '@/components/ui'
import { planService } from '@/services/planService'
import type { PlanVersion, Plan } from '@/types'

interface PlanHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan
  onRestore: (plan: Plan) => void
}

export function PlanHistoryModal({ isOpen, onClose, plan, onRestore }: PlanHistoryModalProps) {
  const [versions, setVersions] = useState<PlanVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<PlanVersion | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadVersions()
    }
  }, [isOpen, plan.id])

  const loadVersions = async () => {
    setIsLoading(true)
    try {
      const data = await planService.getPlanHistory(plan.id)
      setVersions(data)
    } catch (err) {
      console.error('Failed to load plan history:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (version: PlanVersion) => {
    setConfirmRestore(version)
  }

  const handleConfirmRestore = async () => {
    if (!confirmRestore) return

    setRestoringId(confirmRestore.id)
    try {
      const restored = await planService.restorePlanVersion(plan.id, confirmRestore.version)
      onRestore(restored)
      setConfirmRestore(null)
      onClose()
    } catch (err) {
      console.error('Failed to restore version:', err)
    } finally {
      setRestoringId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getModuleCount = (data: Plan) => {
    return data.modules?.length ?? 0
  }

  const getMilestoneCount = (data: Plan) => {
    return data.modules?.reduce((sum, m) => sum + (m.milestones?.length ?? 0), 0) ?? 0
  }

  if (confirmRestore) {
    return (
      <Modal
        isOpen={true}
        onClose={() => setConfirmRestore(null)}
        title="Confirm Restore"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRestore(null)} disabled={!!restoringId}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmRestore}
              isLoading={!!restoringId}
            >
              Restore Version {confirmRestore.version}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-gray-700">
            Are you sure you want to restore to <strong>Version {confirmRestore.version}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This will replace your current plan with the saved snapshot. A backup of your current plan will be created automatically.
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>Restoring from:</strong> {formatDate(confirmRestore.createdAt)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Modules:</strong> {getModuleCount(confirmRestore.data)} | <strong>Milestones:</strong> {getMilestoneCount(confirmRestore.data)}
            </p>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan History"
      size="lg"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500">No version history available</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {versions.map((v, idx) => {
              const isCurrent = idx === 0
              const moduleCount = getModuleCount(v.data)
              const milestoneCount = getMilestoneCount(v.data)

              return (
                <div
                  key={v.id}
                  className={`border rounded-lg p-4 ${isCurrent ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">Version {v.version}</span>
                        {isCurrent && (
                          <Badge variant="primary" size="sm">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(v.createdAt)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {moduleCount} module{moduleCount !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {v.data.title && (
                        <p className="text-sm text-gray-600 mt-2 truncate">
                          <strong>Title:</strong> {v.data.title}
                        </p>
                      )}
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(v)}
                        disabled={!!restoringId}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
