import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlannerPage } from './pages/PlannerPage'
import { TutorPage } from './pages/TutorPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminUsersPage } from './pages/admin/UsersPage'
import { Layout } from './components/layout/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="planner/:planId" element={<PlannerPage />} />
        <Route path="tutor" element={<TutorPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout requireAdmin />
        </ProtectedRoute>
      }>
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
