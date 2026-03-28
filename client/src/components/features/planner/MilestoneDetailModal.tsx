import { useState, useEffect } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { Modal, Badge, Button, Input } from '@/components/ui'
import { planService } from '@/services/planService'
import type { Milestone, Resource } from '@/types'

interface MilestoneDetailModalProps {
  isOpen: boolean
  onClose: () => void
  milestone: Milestone | null
  onUpdate: (milestone: Milestone) => void
}

export function MilestoneDetailModal({
  isOpen,
  onClose,
  milestone,
  onUpdate,
}: MilestoneDetailModalProps) {
  const [dueDate, setDueDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [activeTab, setActiveTab] = useState<'view' | 'add-link' | 'add-note'>('view')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newContent, setNewContent] = useState('')
  const [isSavingResource, setIsSavingResource] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (milestone) {
      setDueDate(milestone.dueDate ? format(parseISO(milestone.dueDate), 'yyyy-MM-dd') : '')
      setError(null)
    }
  }, [milestone])

  useEffect(() => {
    if (isOpen && milestone) {
      loadResources()
    }
  }, [isOpen, milestone])

  const loadResources = async () => {
    if (!milestone) return
    setIsLoadingResources(true)
    try {
      const data = await planService.getResources(milestone.id)
      setResources(data)
    } catch (err) {
      console.error('Failed to load resources:', err)
    } finally {
      setIsLoadingResources(false)
    }
  }

  const handleAddResource = async (type: 'LINK' | 'NOTE') => {
    if (!milestone) return
    if (!newTitle.trim()) return
    if (type === 'LINK' && !newUrl.trim()) return
    if (type === 'NOTE' && !newContent.trim()) return

    setIsSavingResource(true)
    try {
      const resource = await planService.addResource(milestone.id, {
        type,
        title: newTitle.trim(),
        url: type === 'LINK' ? newUrl.trim() : undefined,
        content: type === 'NOTE' ? newContent.trim() : undefined,
      })
      setResources((prev) => [resource, ...prev])
      setNewTitle('')
      setNewUrl('')
      setNewContent('')
      setActiveTab('view')
    } catch (err) {
      console.error('Failed to add resource:', err)
      setError(err instanceof Error ? err.message : 'Failed to add resource')
    } finally {
      setIsSavingResource(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!milestone) return

    setDeletingId(resourceId)
    try {
      await planService.deleteResource(resourceId)
      setResources((prev) => prev.filter((r) => r.id !== resourceId))
    } catch (err) {
      console.error('Failed to delete resource:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (!milestone) return null

  const isCompleted = !!milestone.completedAt
  const isOverdue = !isCompleted && milestone.dueDate && isPast(parseISO(milestone.dueDate))

  const handleSaveDueDate = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const updated = await planService.updateMilestone(milestone.id, {
        dueDate: dueDate || undefined,
      })
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update due date')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearDueDate = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const updated = await planService.updateMilestone(milestone.id, {
        dueDate: undefined,
      } as any)
      onUpdate(updated)
      setDueDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear due date')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Milestone Details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveDueDate}
            isLoading={isSaving}
            disabled={isCompleted}
          >
            Save Due Date
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
          {milestone.description && (
            <p className="text-gray-600 mt-1">{milestone.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="warning" size="sm">
            +{milestone.xpReward} XP
          </Badge>
          {isCompleted ? (
            <Badge variant="success" size="sm">
              Completed
            </Badge>
          ) : isOverdue ? (
            <Badge variant="danger" size="sm">
              Overdue
            </Badge>
          ) : (
            <Badge variant="default" size="sm">
              Pending
            </Badge>
          )}
        </div>

        {isCompleted && milestone.completedAt && (
          <div className="p-3 bg-success-50 rounded-lg">
            <p className="text-sm text-success-700">
              Completed on {format(parseISO(milestone.completedAt), 'MMM d, yyyy')}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isCompleted}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {dueDate && !isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDueDate}
                disabled={isSaving}
              >
                Clear
              </Button>
            )}
          </div>
{isOverdue && (
            <p className="text-sm text-danger-600 mt-1">
              This milestone is overdue
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'view'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('add-link')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'add-link'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              + Link
            </button>
            <button
              onClick={() => setActiveTab('add-note')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'add-note'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              + Note
            </button>
          </div>

          {activeTab === 'view' && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {isLoadingResources ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : resources.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No resources yet. Add links or notes.
                </p>
              ) : (
                resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                        resource.type === 'LINK'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {resource.type === 'LINK' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{resource.title}</p>
                      {resource.type === 'LINK' && resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {resource.url}
                        </a>
                      )}
                      {resource.type === 'NOTE' && resource.content && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{resource.content}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      disabled={deletingId === resource.id}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      aria-label="Delete"
                    >
                      {deletingId === resource.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'add-link' && (
            <div className="space-y-3">
              <Input
                label="Title"
                placeholder="e.g., Official Documentation"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <Input
                label="URL"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('view')}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddResource('LINK')}
                  isLoading={isSavingResource}
                  disabled={!newTitle.trim() || !newUrl.trim()}
                >
                  Add Link
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'add-note' && (
            <div className="space-y-3">
              <Input
                label="Title"
                placeholder="e.g., Key concepts"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your notes..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('view')}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddResource('NOTE')}
                  isLoading={isSavingResource}
                  disabled={!newTitle.trim() || !newContent.trim()}
                >
                  Add Note
                </Button>
              </div>
</div>
        )}
      </div>
    </div>
  </Modal>
  )
}
