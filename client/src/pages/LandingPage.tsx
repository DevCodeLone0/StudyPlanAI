import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Smarter,
            <span className="text-primary-600"> Not Harder</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Create personalized study plans powered by AI. Track your progress, 
            earn rewards, and achieve your goals with your virtual study companion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Plans',
              description: 'Get a personalized curriculum tailored to your goals, timeline, and learning pace.',
            },
            {
              icon: '🎮',
              title: 'Gamification',
              description: 'Earn XP, maintain streaks, and unlock achievements as you progress through your studies.',
            },
            {
              icon: '📊',
              title: 'Track Progress',
              description: 'Visual dashboards show your progress, helping you stay motivated and on track.',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <span className="text-5xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2026 StudyPlanAI. Built with ❤️ for learners everywhere.</p>
        </div>
      </footer>
    </div>
  )
}
