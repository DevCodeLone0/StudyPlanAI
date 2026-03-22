import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export function PlannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          + New Plan
        </button>
      </div>
      
      <Card>
        <CardContent className="py-12 text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Create Your First Study Plan
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tell us your learning goals and our AI will create a personalized 
            curriculum just for you.
          </p>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Generate AI Plan
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
