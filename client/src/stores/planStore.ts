import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plan, Module, Milestone } from '@/types'

interface PlanState {
  plans: Plan[]
  activePlan: Plan | null
  currentModule: Module | null
  isLoading: boolean
  error: string | null

  setPlans: (plans: Plan[]) => void
  setActivePlan: (plan: Plan | null) => void
  setCurrentModule: (module: Module | null) => void
  addPlan: (plan: Plan) => void
  updatePlan: (id: string, updates: Partial<Plan>) => void
  deletePlan: (id: string) => void
  addModule: (planId: string, module: Module) => void
  updateModule: (moduleId: string, updates: Partial<Module>) => void
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void
  reorderModules: (planId: string, moduleIds: string[]) => void
  completeMilestone: (milestoneId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plans: [],
      activePlan: null,
      currentModule: null,
      isLoading: false,
      error: null,
      
      setPlans: (plans) => set({ plans }),
      setActivePlan: (plan) => set({ activePlan: plan }),
      setCurrentModule: (module) => set({ currentModule: module }),
      
      addPlan: (plan) => set((state) => ({ 
        plans: [...state.plans, plan] 
      })),
      
      updatePlan: (id, updates) => set((state) => ({
        plans: state.plans.map((p) => 
          p.id === id ? { ...p, ...updates } : p
        ),
        activePlan: state.activePlan?.id === id 
          ? { ...state.activePlan, ...updates }
          : state.activePlan,
      })),
      
      deletePlan: (id) => set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        activePlan: state.activePlan?.id === id ? null : state.activePlan,
      })),
      
      addModule: (planId, module) => set((state) => ({
        plans: state.plans.map((p) => 
          p.id === planId 
            ? { ...p, modules: [...(p.modules || []), module] }
            : p
        ),
        activePlan: state.activePlan?.id === planId
          ? { ...state.activePlan, modules: [...(state.activePlan.modules || []), module] }
          : state.activePlan,
      })),
      
updateModule: (moduleId, updates) => set((state) => {
    const updateModulesInPlan = (plan: Plan): Plan => ({
      ...plan,
      modules: plan.modules?.map((m) =>
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    })

    return {
      plans: state.plans.map(updateModulesInPlan),
      activePlan: state.activePlan
        ? updateModulesInPlan(state.activePlan)
        : null,
    }
  }),

  updateMilestone: (milestoneId, updates) => set((state) => {
    const updateMilestonesInModules = (modules: Module[] | undefined): Module[] => {
      if (!modules) return []
      return modules.map((m) => ({
        ...m,
        milestones: m.milestones?.map((ms) =>
          ms.id === milestoneId ? { ...ms, ...updates } : ms
        ),
      }))
    }

    const updatePlan = (plan: Plan): Plan => ({
      ...plan,
      modules: updateMilestonesInModules(plan.modules),
    })

    return {
      plans: state.plans.map(updatePlan),
      activePlan: state.activePlan ? updatePlan(state.activePlan) : null,
    }
  }),

  reorderModules: (planId, moduleIds) => set((state) => {
    const reorderModulesInPlan = (plan: Plan): Plan => {
      if (!plan.modules) return plan
      const moduleMap = new Map(plan.modules.map(m => [m.id, m]))
      const reorderedModules = moduleIds
        .map(id => moduleMap.get(id))
        .filter((m): m is Module => m !== undefined)
        .map((m, index) => ({ ...m, order: index + 1 }))
      return { ...plan, modules: reorderedModules }
    }

    return {
      plans: state.plans.map(p => p.id === planId ? reorderModulesInPlan(p) : p),
      activePlan: state.activePlan?.id === planId
        ? reorderModulesInPlan(state.activePlan)
        : state.activePlan,
    }
  }),

  completeMilestone: (milestoneId) => set((state) => {
        const updateMilestonesInModules = (modules: Module[] | undefined): Module[] => {
          if (!modules) return []
          return modules.map((m) => ({
            ...m,
            milestones: m.milestones?.map((ms) =>
              ms.id === milestoneId
                ? { ...ms, completedAt: new Date().toISOString() }
                : ms
            ),
          }))
        }
        
        const updatePlan = (plan: Plan): Plan => ({
          ...plan,
          modules: updateMilestonesInModules(plan.modules),
        })
        
        return {
          plans: state.plans.map(updatePlan),
          activePlan: state.activePlan ? updatePlan(state.activePlan) : null,
        }
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'plan-storage',
      partialize: (state) => ({ 
        plans: state.plans,
        activePlan: state.activePlan,
      }),
    }
  )
)
