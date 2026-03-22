import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export function UsersPage() {
  // Mock data for admin
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', level: 5, plans: 2, streak: 7, status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', level: 3, plans: 1, streak: 0, status: 'active' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', level: 8, plans: 3, streak: 21, status: 'active' },
  ]
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      
      <Card>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">User</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Plans</th>
                <th className="pb-3">Streak</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="py-4">{user.level}</td>
                  <td className="py-4">{user.plans}</td>
                  <td className="py-4">{user.streak} days</td>
                  <td className="py-4">
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
