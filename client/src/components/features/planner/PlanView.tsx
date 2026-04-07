import { useState } from 'react'
import { format } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle, Badge, ProgressBar, Button, Input, Modal } from '@/components/ui'
import { MilestoneDetailModal } from './MilestoneDetailModal'
import { PlanHistoryModal } from './PlanHistoryModal'
import { XPNotification } from '@/components/ui/XPNotification'
import { usePlanStore } from '@/stores/planStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useCelebrationStore, isStreakMilestone } from '@/stores/celebrationStore'
import { planService } from '@/services/planService'
import type { Plan, Module, Milestone } from '@/types'

function getModuleProgress(mod: Module): number {
  const milestones = mod.milestones ?? []
  if (milestones.length === 0) return 0
  const completed = milestones.filter((m) => m.completedAt).length
  return Math.round((completed / milestones.length) * 100)
}

function getPlanProgress(plan: Plan): number {
  const modules = plan.modules ?? []
  if (modules.length === 0) return 0

  const totalMilestones = modules.reduce((sum, m) => sum + (m.milestones?.length ?? 0), 0)
  if (totalMilestones === 0) return 0

  const completedMilestones = modules.reduce(
    (sum, m) => sum + (m.milestones?.filter((ms) => ms.completedAt).length ?? 0),
    0
  )
  return Math.round((completedMilestones / totalMilestones) * 100)
}

function getEstimatedCompletionDate(plan: Plan): Date | null {
  const modules = plan.modules ?? []
  if (modules.length === 0) return null

  const totalMilestones = modules.reduce((sum, m) => sum + (m.milestones?.length ?? 0), 0)
  if (totalMilestones === 0) return null

  const completedMilestones = modules.reduce(
    (sum, m) => sum + (m.milestones?.filter((ms) => ms.completedAt).length ?? 0),
    0
  )

  if (completedMilestones === 0) return null

  // Find the earliest completion date
  const completedDates = modules
    .flatMap((m) => m.milestones ?? [])
    .filter((ms) => ms.completedAt)
    .map((ms) => new Date(ms.completedAt!).getTime())

  if (completedDates.length === 0) return null

  const firstCompletion = Math.min(...completedDates)
  const lastCompletion = Math.max(...completedDates)
  const daysSpent = Math.max(1, Math.ceil((lastCompletion - firstCompletion) / (1000 * 60 * 60 * 24)))
  
  const milestonesPerDay = completedMilestones / daysSpent
  const remainingMilestones = totalMilestones - completedMilestones
  
  if (milestonesPerDay === 0) return null
  
  const estimatedDaysRemaining = Math.ceil(remainingMilestones / milestonesPerDay)
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDaysRemaining)
  
  return estimatedDate
}

function ModuleCardContent({
  module: mod,
  isDragging
}: {
  module: Module
  isDragging?: boolean
}) {
  const [expanded, setExpanded] = useState(mod.status === 'IN_PROGRESS')
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(mod.title)
  const [editDescription, setEditDescription] = useState(mod.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const { completeMilestone: completeInStore, updateModule: updateModuleInStore, updateMilestone: updateMilestoneInStore } = usePlanStore()
  const { addXP, showXPChange, clearXPChange, setStreak, setLevel } = useGamificationStore()
  const { triggerCelebration } = useCelebrationStore()

  const progress = getModuleProgress(mod)

  const handleCompleteMilestone = async (milestone: Milestone) => {
    if (milestone.completedAt || completingId) return

    setCompletingId(milestone.id)

    try {
      const result = await planService.completeMilestone(milestone.id)
      completeInStore(result.milestone.id)
      addXP(result.xpEarned)
      showXPChange(result.xpEarned)

      if (result.streakUpdated) {
        setStreak(result.streakUpdated.current, result.streakUpdated.longest)
        if (isStreakMilestone(result.streakUpdated.current)) {
          triggerCelebration('streak_milestone', {
            streak: result.streakUpdated.current,
            xpEarned: result.xpEarned,
          })
        }
      }

      if (result.newBadge) {
        triggerCelebration('badge_earned', {
          badge: result.newBadge.badge,
          xpEarned: result.xpEarned,
        })
      }

      if (result.levelUp) {
        const newLevel = Math.floor((result.totalXp / 100) + 1)
        setLevel(newLevel)
        triggerCelebration('level_up', {
          level: newLevel,
          xpEarned: result.xpEarned,
        })
      }

      const moduleAfter = mod.milestones?.map(m =>
        m.id === result.milestone.id ? { ...m, completedAt: new Date().toISOString() } : m
      )
      const allCompleted = moduleAfter?.every(m => m.completedAt)
      if (allCompleted && mod.milestones && mod.milestones.length > 0) {
        triggerCelebration('module_complete', {
          moduleName: mod.title,
          xpEarned: result.xpEarned,
        })
      }

      setTimeout(() => clearXPChange(), 2000)
    } catch (err) {
      console.error('Failed to complete milestone:', err)
    } finally {
      setCompletingId(null)
    }
  }

  const statusBadge = {
    LOCKED: <Badge variant="default">Not Started</Badge>,
    IN_PROGRESS: <Badge variant="primary">In Progress</Badge>,
    COMPLETED: <Badge variant="success">Completed</Badge>,
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(mod.title)
    setEditDescription(mod.description || '')
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return

    setIsSaving(true)
    try {
      const updatedModule = await planService.updateModule(mod.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      })
      updateModuleInStore(mod.id, {
        title: updatedModule.title,
        description: updatedModule.description,
      })
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Failed to update module:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditTitle(mod.title)
    setEditDescription(mod.description || '')
  }

  return (
    <>
      <Card className={`overflow-hidden ${isDragging ? 'shadow-lg ring-2 ring-primary-400' : ''}`}>
        <div className="flex">
          <div className="flex items-center justify-center w-10 bg-gray-100 hover:bg-gray-200 cursor-grab active:cursor-grabbing transition-colors shrink-0">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 text-left p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    mod.status === 'COMPLETED'
                      ? 'bg-success-100 text-success-700'
                      : mod.status === 'IN_PROGRESS'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {mod.order}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">{mod.title}</h4>
                  {mod.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{mod.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge[mod.status]}
                <button
                  onClick={handleEditClick}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  aria-label="Edit module"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="mt-3">
              <ProgressBar value={progress} size="sm" variant={progress === 100 ? 'success' : 'default'} />
            </div>
          </button>
        </div>

        {expanded && mod.milestones && mod.milestones.length > 0 && (
          <div className="border-t divide-y">
          {mod.milestones.map((milestone) => {
            const isCompleted = !!milestone.completedAt
            const isCompleting = completingId === milestone.id

            return (
            <div
              key={milestone.id}
              className={`flex items-center gap-3 p-4 ${isCompleted ? 'bg-success-50/50' : ''}`}
            >
            <button
              onClick={() => handleCompleteMilestone(milestone)}
              disabled={isCompleted || isCompleting}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isCompleted
                  ? 'border-success-500 bg-success-500 text-white'
                  : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              {isCompleted && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              )}
              {isCompleting && (
              <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMilestone(milestone)
                setIsDetailModalOpen(true)
              }}
              className="flex-1 min-w-0 text-left hover:text-primary-600 transition-colors"
            >
              <p className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {milestone.title}
              </p>
              {milestone.description && (
              <p className="text-sm text-gray-500 mt-0.5">{milestone.description}</p>
              )}
            </button>

            {!isCompleted && (
              <Badge variant="warning" size="sm">
                +{milestone.xpReward} XP
              </Badge>
            )}
            </div>
            )
          })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Edit Module"
        footer={
          <>
            <Button variant="ghost" onClick={handleCancelEdit} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} isLoading={isSaving} disabled={!editTitle.trim()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Module title"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Module description (optional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>

      <MilestoneDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        milestone={selectedMilestone}
        onUpdate={(updated) => {
          updateMilestoneInStore(selectedMilestone?.id || '', updated)
          setSelectedMilestone(updated)
        }}
      />
    </>
  )
}

function SortableModuleCard({ module }: { module: Module }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ModuleCardContent module={module} isDragging={isDragging} />
    </div>
  )
}

function AddModuleModal({
  isOpen,
  onClose,
  planId,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  planId: string
  onSuccess: (module: Module) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const module = await planService.createModule(planId, {
        title: title.trim(),
        description: description.trim() || undefined,
      })
      onSuccess(module)
      setTitle('')
      setDescription('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Module"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!title.trim()}
          >
            Add Module
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <Input
          label="Module Title"
          placeholder="e.g., Advanced JavaScript Concepts"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Brief description of what this module covers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  )
}

export function PlanView() {
  const { activePlan, addModule, reorderModules, setActivePlan } = usePlanStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!activePlan) return null

  const modules = activePlan.modules ?? []
  const progress = getPlanProgress(activePlan)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id)
      const newIndex = modules.findIndex((m) => m.id === over.id)

      const newModules = arrayMove(modules, oldIndex, newIndex)
      const newModuleIds = newModules.map((m) => m.id)

      reorderModules(activePlan.id, newModuleIds)

      try {
        await planService.reorderModules(activePlan.id, newModuleIds)
      } catch (error) {
        console.error('Failed to persist module order:', error)
      }
    }
  }

  const handleModuleAdded = (module: Module) => {
    addModule(activePlan.id, module)
  }

  const activeModule = activeId ? modules.find((m) => m.id === activeId) : null

  return (
    <div className="space-y-6">
      <XPNotification />

      <Card>
        <CardHeader>
<div className="flex items-center justify-between">
        <div>
          <CardTitle>{activePlan.title}</CardTitle>
          {activePlan.description && (
            <p className="text-gray-600 mt-1">{activePlan.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            History
          </Button>
          <Badge variant="success">Active</Badge>
        </div>
      </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Goal</p>
              <p className="font-medium text-gray-900">{activePlan.goal}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{activePlan.duration}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Daily Time</p>
              <p className="font-medium text-gray-900">{activePlan.dailyTime}</p>
</div>
        </div>
        <ProgressBar value={progress} showLabel animated />
        {getEstimatedCompletionDate(activePlan) && progress > 0 && progress < 100 && (
          <p className="text-sm text-gray-500 mt-2">
            📅 Estimated completion: {format(getEstimatedCompletionDate(activePlan)!, 'MMM d, yyyy')}
          </p>
        )}
      </CardContent>
    </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Modules ({modules.length})
            </h3>
            <p className="text-sm text-gray-500">Drag to reorder</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Module
          </Button>
        </div>

        {modules.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {modules.map((mod) => (
                  <SortableModuleCard key={mod.id} module={mod} />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeModule ? (
                <div className="opacity-90">
                  <ModuleCardContent module={activeModule} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">No modules in this plan yet.</p>
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                Add Your First Module
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddModuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        planId={activePlan.id}
        onSuccess={handleModuleAdded}
      />

      <PlanHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        plan={activePlan}
        onRestore={(restored) => setActivePlan(restored)}
      />
    </div>
  )
}
