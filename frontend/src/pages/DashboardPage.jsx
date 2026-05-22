import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api.js'
import SiteHeader from '../components/layout/SiteHeader.jsx'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.me()
        setUser(data.user)
      } catch (err) {
        // Not authenticated or token expired
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-svh bg-cream text-ink flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-cream text-ink">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6 border border-accent">
          <h1 className="text-2xl font-bold text-ink mb-4">Welcome to your Dashboard, {user?.username}!</h1>
          <div className="bg-gray-50 rounded p-4 mb-6">
            <p className="text-sm text-ink/70"><strong>Email:</strong> {user?.email}</p>
            <p className="text-sm text-ink/70"><strong>Role:</strong> {user?.role}</p>
            <p className="text-sm text-ink/70"><strong>Rating:</strong> {user?.rating}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  )
}
