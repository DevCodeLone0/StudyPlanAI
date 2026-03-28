import api from './api'
import type {
  Plan,
  Module,
  Milestone,
  Resource,
  GeneratePlanRequest,
  GeneratePlanResponse,
  CompleteMilestoneResponse,
  PlanVersion,
} from '@/types'

export const planService = {
  // Plans
  async getPlans(): Promise<Plan[]> {
    const response = await api.get<Plan[]>('/plans')
    return response.data
  },
  
  async getPlan(id: string): Promise<Plan> {
    const response = await api.get<Plan>(`/plans/${id}`)
    return response.data
  },
  
  async createPlan(data: GeneratePlanRequest): Promise<GeneratePlanResponse> {
    const response = await api.post<GeneratePlanResponse>('/ai/generate-plan', data)
    return response.data
  },
  
  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
    const response = await api.patch<Plan>(`/plans/${id}`, updates)
    return response.data
  },
  
  async deletePlan(id: string): Promise<void> {
    await api.delete(`/plans/${id}`)
  },
  
  async activatePlan(id: string): Promise<Plan> {
    const response = await api.post<Plan>(`/plans/${id}/activate`)
    return response.data
  },
  
  async getPlanHistory(id: string): Promise<PlanVersion[]> {
    const response = await api.get<PlanVersion[]>(`/plans/${id}/history`)
    return response.data
  },
  
  async restorePlanVersion(planId: string, version: number): Promise<Plan> {
    const response = await api.post<Plan>(`/plans/${planId}/restore/${version}`)
    return response.data
  },
  
  // Modules
  async createModule(planId: string, data: Partial<Module>): Promise<Module> {
    const response = await api.post<Module>(`/plans/${planId}/modules`, data)
    return response.data
  },
  
  async updateModule(id: string, updates: Partial<Module>): Promise<Module> {
    const response = await api.patch<Module>(`/modules/${id}`, updates)
    return response.data
  },
  
  async deleteModule(id: string): Promise<void> {
    await api.delete(`/modules/${id}`)
  },
  
  async reorderModules(planId: string, moduleIds: string[]): Promise<void> {
    await api.post(`/plans/${planId}/modules/reorder`, { moduleIds })
  },
  
  // Milestones
  async createMilestone(moduleId: string, data: Partial<Milestone>): Promise<Milestone> {
    const response = await api.post<Milestone>(`/modules/${moduleId}/milestones`, data)
    return response.data
  },
  
  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const response = await api.patch<Milestone>(`/milestones/${id}`, updates)
    return response.data
  },
  
  async deleteMilestone(id: string): Promise<void> {
    await api.delete(`/milestones/${id}`)
  },
  
  async completeMilestone(id: string): Promise<CompleteMilestoneResponse> {
    const response = await api.post<CompleteMilestoneResponse>(`/milestones/${id}/complete`)
    return response.data
  },
  
// Resources
  async addResource(milestoneId: string, data: Partial<Resource>): Promise<Resource> {
    const response = await api.post<Resource>(`/milestones/${milestoneId}/resources`, data)
    return response.data
  },

  async getResources(milestoneId: string): Promise<Resource[]> {
    const response = await api.get<Resource[]>(`/milestones/${milestoneId}/resources`)
    return response.data
  },

  async deleteResource(id: string): Promise<void> {
    await api.delete(`/resources/${id}`)
  },
}
