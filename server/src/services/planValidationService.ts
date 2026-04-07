export interface ValidationResult {
  isValid: boolean
  score: number // 0-100
  issues: string[]
  suggestions: string[]
}

export interface PlanData {
  title?: string
  description?: string
  modules?: Array<{
    title?: string
    description?: string
    estimatedDays?: number
    milestones?: Array<{
      title?: string
      description?: string
      estimatedDuration?: string
      resources?: string[]
    }>
  }>
}

const GENERIC_WORDS = [
  'introduction', 'basics', 'fundamentals', 'overview', 'getting started',
  'intro', 'basic', 'general', 'various', 'misc', 'etc', 'and more',
  'learn', 'understand', 'know', 'study'
]

const GENERIC_MILESTONE_PATTERNS = [
  /learn about/i,
  /understand/i,
  /get to know/i,
  /explore/i,
  /overview of/i,
  /introduction to/i,
  /basics of/i,
]

export function validatePlan(plan: PlanData): ValidationResult {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Check basic structure
  if (!plan.title || plan.title.trim().length < 5) {
    issues.push('Plan title is too short or missing')
    score -= 15
  }

  if (!plan.description || plan.description.trim().length < 20) {
    issues.push('Plan description is too short or missing')
    score -= 10
  }

  if (!plan.modules || plan.modules.length === 0) {
    issues.push('No modules in plan')
    score -= 50
    return { isValid: false, score: Math.max(0, score), issues, suggestions }
  }

  if (plan.modules.length < 3) {
    issues.push('Too few modules (minimum 3 recommended)')
    score -= 10
    suggestions.push('Consider adding more modules to break down the learning path better')
  }

  if (plan.modules.length > 12) {
    issues.push('Too many modules (maximum 12 recommended)')
    score -= 5
    suggestions.push('Consider consolidating related modules')
  }

  // Check each module
  plan.modules.forEach((module, moduleIndex) => {
    const moduleNum = moduleIndex + 1

    // Check module title
    if (!module.title || module.title.trim().length < 5) {
      issues.push(`Module ${moduleNum} title is too short`)
      score -= 5
    }

    // Check for generic module titles
    const moduleTitleLower = (module.title || '').toLowerCase()
    if (GENERIC_WORDS.some(word => moduleTitleLower.includes(word)) && moduleTitleLower.length < 20) {
      issues.push(`Module ${moduleNum} has a generic title: "${module.title}"`)
      score -= 5
      suggestions.push(`Make module ${moduleNum} title more specific (e.g., instead of "Introduction", use "Python Variables and Data Types")`)
    }

    // Check module description
    if (!module.description || module.description.trim().length < 15) {
      issues.push(`Module ${moduleNum} missing detailed description`)
      score -= 5
    }

    // Check milestones
    if (!module.milestones || module.milestones.length === 0) {
      issues.push(`Module ${moduleNum} has no milestones`)
      score -= 15
      return
    }

    if (module.milestones.length < 2) {
      issues.push(`Module ${moduleNum} has too few milestones (minimum 2)`)
      score -= 5
    }

    // Check each milestone
    module.milestones.forEach((milestone, milestoneIndex) => {
      const milestoneNum = milestoneIndex + 1

      if (!milestone.title || milestone.title.trim().length < 5) {
        issues.push(`Module ${moduleNum}, Milestone ${milestoneNum} title too short`)
        score -= 3
      }

      // Check for generic milestone titles
      const milestoneTitle = milestone.title || ''
      if (GENERIC_MILESTONE_PATTERNS.some(pattern => pattern.test(milestoneTitle))) {
        issues.push(`Module ${moduleNum}, Milestone ${milestoneNum} is too generic: "${milestone.title}"`)
        score -= 5
        suggestions.push(`Make milestones actionable (e.g., instead of "Learn about loops", use "Build a program using for and while loops")`)
      }

      if (!milestone.description || milestone.description.trim().length < 10) {
        issues.push(`Module ${moduleNum}, Milestone ${milestoneNum} missing description`)
        score -= 3
      }

      if (!milestone.estimatedDuration) {
        issues.push(`Module ${moduleNum}, Milestone ${milestoneNum} missing time estimate`)
        score -= 2
      }
    })
  })

  // Check overall structure quality
  const totalMilestones = plan.modules.reduce((sum, m) => sum + (m.milestones?.length || 0), 0)
  if (totalMilestones < 10) {
    suggestions.push('Consider adding more milestones for a more structured learning path')
  }

  // Determine if plan is valid
  const isValid = score >= 50 && issues.filter(i => i.includes('missing') || i.includes('too short') || i.includes('no modules')).length < 3

  return {
    isValid,
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestions
  }
}

export function isPlanTooGeneric(plan: PlanData): boolean {
  if (!plan.modules || plan.modules.length === 0) return true

  const result = validatePlan(plan)
  return result.score < 60
}

export function getPlanQualityMessage(score: number): string {
  if (score >= 90) return 'Excellent! This plan is well-structured and detailed.'
  if (score >= 75) return 'Good plan with some room for improvement.'
  if (score >= 60) return 'Acceptable plan, but could be more specific.'
  if (score >= 40) return 'Plan needs more detail and structure.'
  return 'Plan is too generic. Please try generating again.'
}
